import { CrudManager } from "@/components/admin/CrudManager";
import { db } from "@/lib/db";

export default async function Page() {
  const rows = await db().list("services");
  return <CrudManager table="services" title="Serviços e preços" rows={JSON.parse(JSON.stringify(rows))} />;
}
