"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthField, authPrimaryClass } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { signupSchema, type SignupValues } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth-store";

export function SignupForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", company: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSession(await api.post<AuthResponse>("/auth/signup", values));
      toast.success("Conta criada com sucesso!");
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setError("email", { message: err.message });
      if (err instanceof ApiError && err.errors) {
        Object.entries(err.errors).forEach(([field, message]) => setError(field as keyof SignupValues, { message }));
      }
      toast.error(errorMessage(err));
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-[26px] font-bold tracking-[-0.01em]">Crie sua conta</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados para começar a sortear</p>
      </div>
      <AuthField id="name" label="Nome completo" placeholder="Ana Ribeiro" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <AuthField id="company" label="Empresa" placeholder="Nome da empresa" autoComplete="organization" error={errors.company?.message} {...register("company")} />
      <AuthField id="email" type="email" label="E-mail" placeholder="voce@empresa.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <AuthField id="password" type="password" label="Senha" placeholder="Mínimo 8 caracteres" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
      <Button type="submit" disabled={isSubmitting} className={authPrimaryClass}>
        {isSubmitting ? "Criando..." : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-[3px] hover:text-tyl-pink-hover">
          Entrar
        </Link>
      </p>
    </form>
  );
}
