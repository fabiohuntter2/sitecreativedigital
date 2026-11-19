import {
  Camera,
  Clapperboard,
  CodeXml,
  FileBadge,
  Headphones,
  Megaphone,
  MicVocal,
  MonitorPlay,
  Music,
  Palette,
  Radio,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  code: CodeXml,
  mic: MicVocal,
  sparkles: Sparkles,
  megaphone: Megaphone,
  "file-badge": FileBadge,
  clapperboard: Clapperboard,
  music: Music,
  camera: Camera,
  "monitor-play": MonitorPlay,
  palette: Palette,
  radio: Radio,
  headphones: Headphones,
};

export function ServiceIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp className={className} aria-hidden="true" strokeWidth={1.7} />;
}
