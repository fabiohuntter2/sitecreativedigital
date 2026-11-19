import { CrudManager } from "@/components/admin/CrudManager";
import { db } from "@/lib/db";

export default async function Page() {
  const rows = await db().list("media");
  return <CrudManager table="media" title="Músicas e vídeos (Experimente)" rows={JSON.parse(JSON.stringify(rows))} />;
}
