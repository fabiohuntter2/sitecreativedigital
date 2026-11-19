"use client";

import { useMemo, useState } from "react";
import { Film, Music2, Play } from "lucide-react";
import { ExampleBadge } from "@/components/ui/Primitives";
import { SHOWCASE_CATEGORIES } from "@/lib/constants";
import type { ShowcaseMedia } from "@/lib/types";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";

export function ExperienceHub({ media }: { media: ShowcaseMedia[] }) {
  const [cat, setCat] = useState<string>("todos");
  const filtered = useMemo(() => (cat === "todos" ? media : media.filter((m) => m.category === cat)), [media, cat]);
  const audios = filtered.filter((m) => m.kind === "audio");
  const videos = filtered.filter((m) => m.kind === "video");
  const [videoId, setVideoId] = useState<string | null>(null);
  const currentVideo = videos.find((v) => v.id === videoId) ?? videos[0];

  const available = SHOWCASE_CATEGORIES.filter((c) => media.some((m) => m.category === c.value));

  return (
    <div>
      <div role="tablist" aria-label="Filtrar por categoria" className="reveal mb-10 flex flex-wrap justify-center gap-2">
        {[{ value: "todos", label: "Todos" }, ...available].map((c) => (
          <button
            key={c.value}
            role="tab"
            aria-selected={cat === c.value}
            type="button"
            onClick={() => {
              setCat(c.value);
              setVideoId(null);
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              cat === c.value
                ? "bg-gradient-to-r from-purple to-green text-white shadow-lg"
                : "border border-white/10 bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {audios.length > 0 && (
        <section aria-labelledby="audio-h" className="mb-16">
          <h2 id="audio-h" className="mb-5 flex items-center gap-2 font-display text-2xl font-bold">
            <Music2 className="h-6 w-6 text-green" /> Ouça
          </h2>
          <AudioPlayer
            key={cat}
            tracks={audios.map((a) => ({ id: a.id, title: a.title, subtitle: a.subtitle, url: a.url, cover: a.cover_url, isExample: a.is_example }))}
          />
        </section>
      )}

      {videos.length > 0 && currentVideo && (
        <section aria-labelledby="video-h">
          <h2 id="video-h" className="mb-5 flex items-center gap-2 font-display text-2xl font-bold">
            <Film className="h-6 w-6 text-green" /> Assista
          </h2>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <VideoPlayer url={currentVideo.url} poster={currentVideo.cover_url} title={currentVideo.title} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h3 className="font-display text-xl font-bold">{currentVideo.title}</h3>
                {currentVideo.is_example && <ExampleBadge />}
              </div>
              {currentVideo.subtitle && <p className="text-sm text-mute">{currentVideo.subtitle}</p>}
            </div>
            <ul className="space-y-2">
              {videos.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setVideoId(v.id)}
                    aria-current={v.id === currentVideo.id ? "true" : undefined}
                    className={`group flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition ${
                      v.id === currentVideo.id ? "bg-white/10 ring-1 ring-purple/60" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-graphite">
                      {v.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.cover_url} alt="" className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-0 grid place-items-center bg-ink/30">
                        <Play className="h-5 w-5 fill-white" />
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{v.title}</span>
                      <span className="block truncate text-xs text-mute">{v.subtitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!audios.length && !videos.length && (
        <p className="glass rounded-3xl p-10 text-center text-mute">Nenhuma produção publicada nesta categoria ainda.</p>
      )}
    </div>
  );
}
