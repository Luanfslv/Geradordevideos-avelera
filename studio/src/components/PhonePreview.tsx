import type { CSSProperties } from "react";
import type { Aspect } from "../types";

interface PhonePreviewProps {
  aspect: Aspect;
  generating: boolean;
  progress: number;
  genName: string;
  subtitlesOn: boolean;
}

export default function PhonePreview({ aspect, generating, progress, genName, subtitlesOn }: PhonePreviewProps) {
  const portrait = aspect === "9:16";
  const frame: CSSProperties = {
    width: portrait ? 230 : "100%",
    aspectRatio: portrait ? "9 / 16" : "16 / 9",
    margin: "0 auto",
    borderRadius: 22,
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(150deg, #3a1a5e, #7c1f4e)",
    boxShadow: "var(--shadow-phone)",
    border: "1px solid rgba(255,255,255,0.08)",
  };
  return (
    <div style={frame}>
      {/* stripes */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, backgroundImage: "repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 16px)" }} />
      {/* top chips */}
      <div style={chipsRow}>
        <span style={chip}>@cria.acelera</span>
        <span style={chip}>0:32</span>
      </div>

      {/* centro: play idle OU spinner gerando */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        {generating ? (
          <>
            <span style={spinner} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 600 }}>{genName}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--text-purple-2)", marginTop: 4 }}>{progress}%</div>
            </div>
          </>
        ) : (
          <span style={playGlyph} />
        )}
      </div>

      {/* legenda */}
      {subtitlesOn && !generating && (
        <div style={captionWrap}>
          <span style={caption}>
            isso muda <span style={{ color: "var(--status-lime)" }}>tudo</span>
          </span>
        </div>
      )}

      {/* scrubber */}
      <div style={scrubber}>
        <div style={{ width: generating ? `${progress}%` : "32%", height: "100%", background: "#fff", borderRadius: 999 }} />
      </div>
    </div>
  );
}

const chipsRow: CSSProperties = { position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" };
const chip: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#fff", background: "rgba(0,0,0,0.35)", padding: "4px 8px", borderRadius: 999, backdropFilter: "blur(4px)" };
const playGlyph: CSSProperties = {
  width: 0, height: 0, borderStyle: "solid", borderWidth: "14px 0 14px 22px",
  borderColor: "transparent transparent transparent #fff",
  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))", marginLeft: 6,
};
const spinner: CSSProperties = {
  width: 46, height: 46, borderRadius: "50%",
  border: "3px solid rgba(255,255,255,0.25)", borderTopColor: "var(--status-warning)",
  animation: "acSpin 0.8s linear infinite",
};
const captionWrap: CSSProperties = { position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center" };
const caption: CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" };
const scrubber: CSSProperties = { position: "absolute", left: 14, right: 14, bottom: 16, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.25)" };
