"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import type { MachineSound } from "@/hooks/use-machine-sound";
import { api, errorMessage } from "@/lib/api";
import type { DrawSettings, MachineDrawResult, MachinePool, MachineProduct, ParticipantResult } from "@/lib/machine-types";

export type GamePhase = "idle" | "spinning" | "board" | "won";
export type Tile = { pid: string; open: boolean };

/** Animação de um estilo: recebe o prêmio decidido pelo servidor e resolve quando a animação termina. */
export type GameHandle = { run: (result: MachineDrawResult) => Promise<void> };

export type LeadPayload = {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  answers: Record<string, string | boolean>;
};

const shuffle = <T,>(a: T[]) => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

/**
 * Sessão de jogo do totem: cadastro do participante (créditos vindos do servidor), jogadas e resultado.
 * O prêmio é sempre decidido por `POST /draws`; o cliente apenas anima até ele.
 */
export function useGameSession({
  eventId,
  settings,
  pool,
  products,
  reloadPool,
  sound,
  gameRef,
}: {
  eventId: string | null;
  settings: DrawSettings;
  pool: MachinePool | null;
  products: MachineProduct[];
  reloadPool: () => Promise<void> | void;
  sound: MachineSound;
  gameRef: RefObject<GameHandle | null>;
}) {
  const [participant, setParticipant] = useState<{ id: string; name: string } | null>(null);
  const [credits, setCredits] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [result, setResult] = useState<MachineDrawResult | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [boardResult, setBoardResult] = useState<MachineDrawResult | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const busy = useRef(false);

  const blockMessage = pool?.block ? pool.blockMessage : null;
  const hasPool = !!pool && pool.items.length > 0;

  const complete = useCallback(
    (r: MachineDrawResult) => {
      sound.stopTicking();
      sound.win();
      setResult(r);
      setPhase("won");
      void reloadPool();
    },
    [sound, reloadPool],
  );

  const requestDraw = useCallback(async (): Promise<MachineDrawResult | null> => {
    if (!participant) return null;
    busy.current = true;
    try {
      const r = await api.post<MachineDrawResult>("/draws", { participantId: participant.id });
      setCredits(r.creditsRemaining);
      return r;
    } catch (err) {
      toast.error(errorMessage(err));
      void reloadPool();
      return null;
    } finally {
      busy.current = false;
    }
  }, [participant, reloadPool]);

  /** Verificações comuns antes de jogar; abre o cadastro quando não há créditos. */
  const canStart = useCallback(() => {
    if (busy.current) return false;
    if (blockMessage) {
      toast.error(blockMessage);
      return false;
    }
    if (credits <= 0) {
      setFormOpen(true);
      return false;
    }
    return hasPool;
  }, [blockMessage, credits, hasPool]);

  const buildBoard = useCallback(
    (winnerId: string): Tile[] => {
      const others = products.filter((p) => p.id !== winnerId).flatMap((p) => [p.id, p.id]);
      const decoys = shuffle(others).slice(0, 9);
      while (decoys.length < 9) decoys.push(others[decoys.length % Math.max(1, others.length)] ?? winnerId);
      return shuffle([winnerId, winnerId, winnerId, ...decoys]).map((pid) => ({ pid, open: false }));
    },
    [products],
  );

  const flipOn = useCallback(
    (board: Tile[], i: number, r: MachineDrawResult) => {
      const t = board[i];
      if (!t || t.open) return;
      const next = board.map((x, k) => (k === i ? { ...x, open: true } : x));
      const hit = t.pid === r.product.id;
      sound.flip(hit);
      const found = next.filter((x) => x.open && x.pid === r.product.id).length;
      setTiles(next);
      if (found >= 3) {
        setPhase("spinning");
        setTimeout(() => {
          setTiles((cur) => cur.map((x) => ({ ...x, open: true })));
          complete(r);
        }, 700);
      }
    },
    [sound, complete],
  );

  /** Blocos: o crédito e o prêmio são definidos ao iniciar o tabuleiro. */
  const startBoard = useCallback(async () => {
    const r = await requestDraw();
    if (!r) return null;
    const board = buildBoard(r.product.id);
    sound.board();
    setBoardResult(r);
    setTiles(board);
    setPhase("board");
    return { board, r };
  }, [requestDraw, buildBoard, sound]);

  const play = useCallback(async () => {
    if (phase === "spinning" || phase === "won") return;
    if (settings.style === "BLOCKS") {
      if (phase === "board") return;
      if (canStart()) await startBoard();
      return;
    }
    if (!canStart()) return;
    setPhase("spinning");
    setResult(null);
    const r = await requestDraw();
    if (!r) {
      setPhase("idle");
      return;
    }
    await gameRef.current?.run(r);
    complete(r);
  }, [phase, settings.style, canStart, startBoard, requestDraw, gameRef, complete]);

  const flip = useCallback(
    async (i: number) => {
      if (phase === "spinning" || phase === "won") return;
      if (phase === "board" && boardResult) {
        flipOn(tiles, i, boardResult);
        return;
      }
      if (!canStart()) return;
      const started = await startBoard();
      if (started) flipOn(started.board, i, started.r);
    },
    [phase, boardResult, tiles, flipOn, canStart, startBoard],
  );

  /** Registra o participante e libera os créditos configurados. Retorna a mensagem de erro, se houver. */
  const submitLead = useCallback(
    async (payload: LeadPayload): Promise<string | null> => {
      if (!eventId) return "Selecione um evento.";
      try {
        const p = await api.post<ParticipantResult>("/participants", { eventId, ...payload });
        setParticipant({ id: p.id, name: p.name });
        setCredits(p.creditsRemaining);
        setFormOpen(false);
        setTiles([]);
        setPhase("idle");
        sound.credits();
        return null;
      } catch (err) {
        void reloadPool();
        return errorMessage(err);
      }
    },
    [eventId, sound, reloadPool],
  );

  /** Fecha o resultado; sem créditos restantes, limpa o participante para o próximo. */
  const closeResult = useCallback(() => {
    setResult(null);
    setTiles([]);
    setBoardResult(null);
    setPhase("idle");
    if (credits <= 0) setParticipant(null);
  }, [credits]);

  return {
    participant,
    credits,
    phase,
    spinning: phase === "spinning",
    won: phase === "won" && !!result,
    boardActive: phase === "board",
    result,
    tiles,
    boardWinnerId: boardResult?.product.id ?? null,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
    play,
    flip,
    submitLead,
    closeResult,
    blockMessage,
    hasPool,
  };
}
export type GameSession = ReturnType<typeof useGameSession>;
