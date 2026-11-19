import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <AdminShell email={session.email} mode={isSupabaseConfigured() ? "supabase" : "local"}>
      {children}
    </AdminShell>
  );
}
