import { CrudManager } from "@/components/admin/CrudManager";
import { db } from "@/lib/db";

export default async function Page() {
  const rows = await db().list("testimonials");
  return <CrudManager table="testimonials" title="Depoimentos" rows={JSON.parse(JSON.stringify(rows))} />;
}
