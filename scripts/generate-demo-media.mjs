// Gera as mídias DEMONSTRATIVAS do site (sem direitos de terceiros):
// - 3 faixas instrumentais sintetizadas por código (MP3)
// - 3 vídeos curtos marcados como "EXEMPLO DEMONSTRATIVO" (MP4)
// - capas em SVG nas cores da marca
// Requer ffmpeg instalado. Uso: npm run media:demo
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const OUT = path.resolve("public/demo");
for (const d of ["audio", "video", "covers"]) mkdirSync(path.join(OUT, d), { recursive: true });

/* ----------------------------- síntese ----------------------------- */
const SR = 44100;
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function render({ bpm, seconds, chords, bassPattern, arp, swing = 0, kickEvery = 1, padLevel = 0.12, leadLevel = 0.08, hats = true }) {
  const n = Math.floor(SR * seconds);
  const L = new Float32Array(n), R = new Float32Array(n);
  const beat = 60 / bpm;
  const bar = beat * 4;
  const add = (buf, i, v) => { if (i >= 0 && i < n) buf[i] += v; };

  const totalBeats = Math.floor(seconds / beat);
  for (let b = 0; b < totalBeats; b++) {
    const t0 = b * beat;
    const chord = chords[Math.floor(t0 / bar) % chords.length];
    // kick
    if (b % kickEvery === 0) {
      for (let k = 0; k < SR * 0.35; k++) {
        const t = k / SR;
        const f = 45 + 90 * Math.exp(-t * 28);
        const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.55;
        const i = Math.floor((t0) * SR) + k; add(L, i, v); add(R, i, v);
      }
    }
    // clap/snare nos tempos 2 e 4
    if (b % 4 === 1 || b % 4 === 3) {
      for (let k = 0; k < SR * 0.22; k++) {
        const t = k / SR;
        const v = rnd() * Math.exp(-t * 22) * 0.22;
        const i = Math.floor(t0 * SR) + k; add(L, i, v * 0.9); add(R, i, v);
      }
    }
    // hi-hats em colcheias
    if (hats) for (let h = 0; h < 2; h++) {
      const th = t0 + h * beat / 2 + (h ? swing * beat : 0);
      let prev = 0;
      for (let k = 0; k < SR * 0.05; k++) {
        const x = rnd(); const hp = x - prev; prev = x;
        const v = hp * Math.exp(-(k / SR) * 90) * (h ? 0.05 : 0.08);
        const i = Math.floor(th * SR) + k; add(L, i, v * 0.7); add(R, i, v);
      }
    }
    // baixo
    const bn = chord[0] - 24 + (bassPattern[b % bassPattern.length] || 0);
    const bf = midi(bn);
    for (let k = 0; k < SR * beat * 0.9; k++) {
      const t = k / SR;
      const ph = (bf * t) % 1;
      const saw = 2 * ph - 1;
      const v = (Math.sin(2 * Math.PI * bf * t) * 0.7 + saw * 0.15) * Math.min(1, t * 200) * Math.exp(-t * 2.2) * 0.32;
      const i = Math.floor(t0 * SR) + k; add(L, i, v); add(R, i, v);
    }
    // arpejo
    if (arp) for (let s = 0; s < 4; s++) {
      const note = chord[(b * 4 + s) % chord.length] + 12 * (s % 2 ? 1 : 0);
      const f = midi(note);
      const ts = t0 + s * beat / 4;
      for (let k = 0; k < SR * beat * 0.24; k++) {
        const t = k / SR;
        const tri = 2 * Math.abs(2 * ((f * t) % 1) - 1) - 1;
        const v = tri * Math.exp(-t * 14) * leadLevel;
        const i = Math.floor(ts * SR) + k; add(L, i, v * (s % 2 ? 0.6 : 1)); add(R, i, v * (s % 2 ? 1 : 0.6));
      }
    }
  }
  // pad contínuo por compasso
  const bars = Math.ceil(seconds / bar);
  for (let c = 0; c < bars; c++) {
    const chord = chords[c % chords.length];
    const start = Math.floor(c * bar * SR);
    const len = Math.floor(bar * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      const env = Math.min(1, t / 0.6) * Math.min(1, (bar - t) / 0.4);
      let v = 0;
      for (const nn of chord) {
        const f = midi(nn);
        v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 1.003 * t);
      }
      v = (v / chord.length) * env * padLevel;
      add(L, start + k, v * (1 + 0.2 * Math.sin(t * 0.7))); add(R, start + k, v * (1 - 0.2 * Math.sin(t * 0.7)));
    }
  }
  // normaliza e aplica fade
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.89 / (peak || 1);
  const fade = SR * 2;
  for (let i = 0; i < n; i++) {
    const f = Math.min(1, i / (SR * 0.5), (n - i) / fade);
    L[i] = Math.tanh(L[i] * g * 1.1) * f; R[i] = Math.tanh(R[i] * g * 1.1) * f;
  }
  return [L, R];
}

function wav(file, [L, R]) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(file, buf);
}

function ff(args) {
  const r = spawnSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg falhou: " + args.join(" "));
}

const tracks = {
  "demo-groove": { bpm: 98, seconds: 32, swing: 0.08, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]], bassPattern: [0, 0, 7, 0, 0, 12, 7, 5], arp: true },
  "demo-ambient": { bpm: 72, seconds: 32, kickEvery: 2, hats: false, padLevel: 0.2, leadLevel: 0.06, chords: [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [48, 55, 60, 64, 67], [45, 52, 57, 60, 64]], bassPattern: [0], arp: true },
  "demo-pulse": { bpm: 124, seconds: 30, chords: [[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 66], [50, 54, 57, 61]], bassPattern: [0, 12, 0, 12], arp: true, leadLevel: 0.07 },
};

for (const [name, cfg] of Object.entries(tracks)) {
  const tmp = path.join(OUT, "audio", `${name}.wav`);
  wav(tmp, render(cfg));
  ff(["-i", tmp, "-codec:a", "libmp3lame", "-b:a", "160k", "-metadata", `title=${name} (exemplo)`, "-metadata", "comment=Faixa demonstrativa gerada por código", path.join(OUT, "audio", `${name}.mp3`)]);
  unlinkSync(tmp);
  console.log("áudio:", name);
}

/* ------------------------------- vídeos ------------------------------- */
const font = process.platform === "win32" ? "C\\:/Windows/Fonts/arialbd.ttf" : "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const fontOk = process.platform === "win32" ? existsSync("C:/Windows/Fonts/arialbd.ttf") : existsSync(font);
const text = (t, size, y, alpha = 1) =>
  fontOk ? `,drawtext=fontfile='${font}':text='${t}':fontcolor=white@${alpha}:fontsize=${size}:x=(w-tw)/2:y=${y}` : "";

const videos = [
  { name: "demo-clipe", title: "VIDEOCLIPE", audio: "demo-groove", c: ["0x713bce", "0x090909", "0x39d6a0"], d: 14 },
  { name: "demo-comercial", title: "COMERCIAL", audio: "demo-pulse", c: ["0x39d6a0", "0x171717", "0x713bce"], d: 12 },
  { name: "demo-vinheta", title: "VINHETA", audio: "demo-ambient", c: ["0x090909", "0x713bce", "0x171717"], d: 8 },
];
for (const v of videos) {
  const graph =
    `[1:a]showwaves=s=1280x220:mode=cline:colors=0x39d6a0|0xffffff:rate=30,format=rgba,colorchannelmixer=aa=0.75[w];` +
    `[0:v][w]overlay=0:H-h-30` +
    text("EXEMPLO DEMONSTRATIVO", 26, 60, 0.85) +
    text(v.title, 96, "(h-th)/2-60") +
    text("HUNTTER CREATIVE STUDIO", 28, "(h-th)/2+50", 0.7) +
    `,format=yuv420p[v]`;
  ff([
    "-f", "lavfi", "-i", `gradients=s=1280x720:c0=${v.c[0]}:c1=${v.c[1]}:c2=${v.c[2]}:nb_colors=3:speed=0.015:d=${v.d}:r=30`,
    "-i", path.join(OUT, "audio", `${v.audio}.mp3`),
    "-filter_complex", graph, "-map", "[v]", "-map", "1:a", "-t", String(v.d),
    "-af", `afade=t=out:st=${v.d - 1.5}:d=1.5`,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
    path.join(OUT, "video", `${v.name}.mp4`),
  ]);
  console.log("vídeo:", v.name);
}

/* -------------------------------- capas -------------------------------- */
const cover = (title, sub, a, b, motif) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="r" cx=".8" cy=".2" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".06"/></pattern></defs>
<rect width="800" height="600" fill="#090909"/><rect width="800" height="600" fill="url(#g)" opacity=".85"/><rect width="800" height="600" fill="url(#p)"/><rect width="800" height="600" fill="url(#r)"/>
${motif}
<text x="48" y="500" font-family="Arial, sans-serif" font-weight="800" font-size="54" fill="#fff">${title}</text>
<text x="50" y="545" font-family="Arial, sans-serif" font-size="22" letter-spacing="4" fill="#fff" fill-opacity=".75">${sub}</text>
</svg>`;
const bars = Array.from({ length: 28 }, (_, i) => { const h = 40 + ((i * 53) % 160); return `<rect x="${60 + i * 24}" y="${300 - h / 2}" width="12" height="${h}" rx="6" fill="#fff" fill-opacity=".55"/>`; }).join("");
const browser = `<rect x="140" y="90" width="520" height="300" rx="18" fill="#090909" fill-opacity=".55" stroke="#fff" stroke-opacity=".25"/><circle cx="170" cy="118" r="7" fill="#f87171"/><circle cx="194" cy="118" r="7" fill="#fcd34d"/><circle cx="218" cy="118" r="7" fill="#39d6a0"/><rect x="170" y="160" width="260" height="26" rx="8" fill="#fff" fill-opacity=".8"/><rect x="170" y="200" width="380" height="12" rx="6" fill="#fff" fill-opacity=".35"/><rect x="170" y="222" width="320" height="12" rx="6" fill="#fff" fill-opacity=".35"/><rect x="170" y="270" width="140" height="40" rx="20" fill="#39d6a0"/><rect x="460" y="250" width="170" height="110" rx="12" fill="#713bce" fill-opacity=".8"/>`;
const film = `<rect x="160" y="100" width="480" height="270" rx="16" fill="#000" fill-opacity=".45" stroke="#fff" stroke-opacity=".3"/><path d="M370 190 L450 235 L370 280 Z" fill="#fff"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${176 + i * 46}" y="110" width="24" height="14" rx="3" fill="#fff" fill-opacity=".3"/><rect x="${176 + i * 46}" y="346" width="24" height="14" rx="3" fill="#fff" fill-opacity=".3"/>`).join("")}`;
const spark = `<g fill="#fff"><path d="M400 110 L425 210 L520 235 L425 260 L400 360 L375 260 L280 235 L375 210 Z" fill-opacity=".85"/><path d="M560 120 L570 155 L605 165 L570 175 L560 210 L550 175 L515 165 L550 155 Z" fill-opacity=".6"/></g>`;
const megaphone = `<g fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round" stroke-opacity=".85"><path d="M260 210 L460 130 L460 350 L260 270 Z"/><path d="M260 210 H200 V270 H260"/><path d="M520 190 Q560 240 520 290"/><path d="M560 160 Q620 240 560 320"/></g>`;
const doc = `<g fill="none" stroke="#fff" stroke-width="10" stroke-opacity=".85"><path d="M300 90 H460 L520 150 V390 H300 Z"/><path d="M460 90 V150 H520"/><path d="M340 210 H480 M340 250 H480 M340 290 H430"/></g><circle cx="500" cy="360" r="46" fill="#39d6a0"/><path d="M478 360 l16 16 l30 -32" stroke="#090909" stroke-width="10" fill="none"/>`;
const camera = `<g fill="none" stroke="#fff" stroke-width="10" stroke-opacity=".85"><rect x="190" y="150" width="330" height="200" rx="26"/><path d="M520 210 L620 160 V340 L520 290"/><circle cx="355" cy="250" r="60"/></g><circle cx="230" cy="185" r="10" fill="#f87171"/>`;

const covers = {
  sites: cover("Criação de Sites", "SITES · LANDING PAGES · LOJAS", "#713bce", "#1e1b4b", browser),
  audio: cover("Estúdio de Áudio", "GRAVAÇÃO · MIXAGEM · MASTER", "#4c1d95", "#0f766e", bars),
  ia: cover("Música com IA", "COMPOSIÇÃO · ARRANJOS · LETRAS", "#7c3aed", "#39d6a0", spark),
  marketing: cover("Marketing Digital", "ARTES · POSTS · REELS", "#39d6a0", "#4c1d95", megaphone),
  vinheta: cover("Produção Audiovisual", "VINHETAS · ABERTURAS · EVENTOS", "#171717", "#713bce", film),
  audiovisual: cover("Videoclipes", "ROTEIRO · CAPTAÇÃO · EDIÇÃO", "#713bce", "#090909", film),
  comercial: cover("Comerciais", "PUBLICIDADE · INSTITUCIONAL", "#0f766e", "#171717", camera),
  documento: cover("Registro de Músicas", "ORIENTAÇÃO · DOCUMENTAÇÃO", "#1e1b4b", "#0f766e", doc),
};
for (const [n, svg] of Object.entries(covers)) writeFileSync(path.join(OUT, "covers", `${n}.svg`), svg);
console.log("capas:", Object.keys(covers).join(", "));
