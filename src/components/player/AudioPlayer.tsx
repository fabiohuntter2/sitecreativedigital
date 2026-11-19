"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { ExampleBadge } from "@/components/ui/Primitives";
import { formatTime } from "@/lib/media";

export type Track = { id: string; title: string; subtitle?: string; url: string; cover?: string; isExample?: boolean };

export function AudioPlayer({ tracks, compact = false }: { tracks: Track[]; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const autoplayNext = useRef(false);

  const track = tracks[index];

  useEffect(() => {
    if (index >= tracks.length) setIndex(0);
  }, [tracks.length, index]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setTime(0);
    setDuration(0);
    setError("");
    a.load();
    if (autoplayNext.current) {
      a.play().catch(() => setPlaying(false));
      autoplayNext.current = false;
    }
  }, [track?.url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setError("Não foi possível reproduzir este arquivo."));
    else a.pause();
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!tracks.length) return;
      autoplayNext.current = true;
      setIndex((i) => (i + dir + tracks.length) % tracks.length);
    },
    [tracks.length],
  );

  const select = (i: number) => {
    if (i === index) return toggle();
    autoplayNext.current = true;
    setIndex(i);
  };

  if (!track) {
    return <p className="glass rounded-3xl p-8 text-center text-mute">Nenhum áudio disponível nesta categoria.</p>;
  }

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className={`glass overflow-hidden rounded-[1.75rem] ${compact ? "" : "lg:grid lg:grid-cols-[1.1fr_1fr]"}`}>
      <div className="relative p-6 sm:p-8">
        <div aria-hidden="true" className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-purple/30 blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-purple to-green sm:h-28 sm:w-28">
            {track.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.cover} alt="" className="h-full w-full object-cover" />
            )}
            <div className={`absolute inset-0 grid place-items-center bg-ink/30 transition ${playing ? "opacity-100" : "opacity-0"}`}>
              <div className="flex h-8 items-end gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className="eq-bar w-1.5 rounded-sm bg-white" style={{ height: "100%", animationDelay: `${i * 0.13}s` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green">Tocando agora</p>
            <h3 className="mt-1 truncate font-display text-xl font-bold sm:text-2xl">{track.title}</h3>
            {track.subtitle && <p className="truncate text-sm text-mute">{track.subtitle}</p>}
            {track.isExample && <ExampleBadge className="mt-2" />}
          </div>
        </div>

        <audio
          ref={audioRef}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => (tracks.length > 1 ? go(1) : setPlaying(false))}
          onError={() => setError("Arquivo de áudio indisponível.")}
        >
          <source src={track.url} />
        </audio>

        <div className="relative mt-7">
          <input
            type="range"
            className="seek w-full"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = v;
              setTime(v);
            }}
            style={{ "--p": `${pct}%` } as React.CSSProperties}
            aria-label="Posição da faixa"
            aria-valuetext={`${formatTime(time)} de ${formatTime(duration)}`}
          />
          <div className="mt-1.5 flex justify-between text-xs tabular-nums text-mute">
            <span>{formatTime(time)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Faixa anterior" className="grid h-11 w-11 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pausar" : "Reproduzir"}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-purple to-green shadow-[0_10px_40px_-8px_rgba(113,59,206,.9)] transition hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="h-7 w-7 fill-white" /> : <Play className="ml-1 h-7 w-7 fill-white" />}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Próxima faixa" className="grid h-11 w-11 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ativar som" : "Silenciar"} className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10">
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              className="seek hidden w-24 sm:block"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              style={{ "--p": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
              aria-label="Volume"
            />
          </div>
        </div>
        {error && <p role="alert" className="relative mt-3 text-sm text-red-300">{error}</p>}
      </div>

      {!compact && tracks.length > 1 && (
        <div className="border-t border-white/5 bg-ink/40 p-3 lg:border-l lg:border-t-0">
          <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mute">
            <ListMusic className="h-4 w-4" /> Playlist
          </p>
          <ol className="max-h-80 space-y-1 overflow-y-auto">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    i === index ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-bold text-mute">
                    {i === index && playing ? (
                      <span className="flex h-4 items-end gap-0.5">
                        {[0, 1, 2].map((k) => (
                          <span key={k} className="eq-bar w-1 rounded-sm bg-green" style={{ height: "100%", animationDelay: `${k * 0.15}s` }} />
                        ))}
                      </span>
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${i === index ? "text-green" : ""}`}>{t.title}</span>
                    {t.subtitle && <span className="block truncate text-xs text-mute">{t.subtitle}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
