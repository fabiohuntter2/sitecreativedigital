import { SettingsForm } from "@/components/admin/SettingsForm";
import { db } from "@/lib/db";
import { mergeSettings } from "@/lib/content";

export default async function SettingsPage() {
  const settings = mergeSettings(await db().getSettings());
  return <SettingsForm initial={settings} />;
}
