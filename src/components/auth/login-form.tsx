"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthField, authPrimaryClass } from "@/components/auth/auth-field";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { api, errorMessage } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSession(await api.post<AuthResponse>("/auth/login", values));
      router.replace("/dashboard");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-[26px] font-bold tracking-[-0.01em]">Entre na sua conta</h1>
        <p className="text-sm text-muted-foreground">Digite seu e-mail abaixo para acessar o painel</p>
      </div>
      <AuthField id="email" type="email" label="E-mail" placeholder="voce@empresa.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <AuthField
        id="password"
        type="password"
        label="Senha"
        placeholder="••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        aside={
          <button type="button" onClick={() => toast.info("Recuperação de senha disponível em breve.")} className="cursor-pointer text-[13px] text-[#d4c4d0] hover:text-foreground">
            Esqueceu sua senha?
          </button>
        }
        {...register("password")}
      />
      <Button type="submit" disabled={isSubmitting} className={authPrimaryClass}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex items-center gap-3 text-[13px] text-[#8a8a8a]">
        <div className="h-px flex-1 bg-[#33242f]" />
        <span>Ou continue com</span>
        <div className="h-px flex-1 bg-[#33242f]" />
      </div>
      <GoogleButton />
      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link href="/cadastro" className="text-foreground underline underline-offset-[3px] hover:text-tyl-pink-hover">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
