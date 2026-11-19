import { ImageResponse } from "next/og";

export const alt = "Huntter Produções — Agência digital, estúdio musical e produtora audiovisual";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento gerada automaticamente (WhatsApp, Facebook, LinkedIn…). */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 15% 20%, #713bce88, transparent 45%), radial-gradient(circle at 90% 80%, #39d6a055, transparent 45%), #090909",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#39d6a0", fontWeight: 700 }}>HUNTTER CREATIVE STUDIO</div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 24, lineHeight: 1.05, display: "flex", flexDirection: "column" }}>
          <span>Sua ideia ganha vida.</span>
          <span style={{ color: "#b495ff" }}>Sua marca ganha espaço.</span>
        </div>
        <div style={{ fontSize: 30, marginTop: 36, color: "#a3a3ad" }}>
          Sites · Estúdio musical · Música com IA · Audiovisual · Marketing digital
        </div>
      </div>
    ),
    size,
  );
}
