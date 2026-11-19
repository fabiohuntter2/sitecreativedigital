import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession, isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Acesso administrativo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (isAuthConfigured() && (await getSession())) redirect("/admin");
  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/4 h-96 w-[600px] -translate-x-1/2 rounded-full bg-purple/30 blur-[120px]" />
      <div className="glass relative w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <LogoMark className="mx-auto h-14 w-14" />
        <h1 className="mt-5 text-center font-display text-2xl font-bold">Painel administrativo</h1>
        <p className="mt-1 text-center text-sm text-mute">Huntter Produções</p>
        {!isAuthConfigured() && (
          <p className="mt-6 rounded-xl bg-amber-300/10 p-4 text-sm text-amber-100 ring-1 ring-amber-300/30">
            O login ainda não foi configurado. Defina <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> e <code>AUTH_SECRET</code> no arquivo <code>.env.local</code> (instruções no README).
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
