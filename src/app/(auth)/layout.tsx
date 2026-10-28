"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hydrated && token) router.replace("/dashboard");
  }, [hydrated, token, router]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <Image src="/assets/auth-background.png" alt="" fill priority className="object-cover object-right" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.92)_30%,rgba(0,0,0,.45)_55%,rgba(0,0,0,0)_75%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.85)_0%,rgba(0,0,0,0)_25%)]" />
      <div className="relative z-[1] px-7 py-6">
        <Image src="/assets/logo-tyl.png" alt="TestYourLuck" width={148} height={44} className="mix-blend-screen" style={{ height: 44, width: "auto" }} priority />
      </div>
      <div className="relative z-[1] flex flex-1 items-center px-7 pt-8 pb-14">
        <div className="w-full max-w-[400px] ml-[clamp(0px,10vw,160px)]">{children}</div>
      </div>
    </div>
  );
}
