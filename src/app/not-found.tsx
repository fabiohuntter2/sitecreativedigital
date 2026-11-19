import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
      <div aria-hidden="true" className="absolute left-1/2 top-1/3 h-96 w-[700px] -translate-x-1/2 rounded-full bg-purple/30 blur-[120px]" />
      <div className="relative">
        <LogoMark className="mx-auto h-20 w-20" />
        <p className="mt-6 font-display text-7xl font-extrabold text-gradient">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-mute">O conteúdo que você procura não existe ou foi movido.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-purple to-green px-7 py-3 font-semibold">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
