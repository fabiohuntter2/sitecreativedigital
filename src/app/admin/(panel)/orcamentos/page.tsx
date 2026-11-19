import { QuotesManager } from "@/components/admin/QuotesManager";
import { db } from "@/lib/db";

export default async function QuotesPage() {
  const quotes = await db().list("quotes");
  return <QuotesManager quotes={JSON.parse(JSON.stringify(quotes))} />;
}
