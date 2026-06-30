import { useState, type CSSProperties } from "react";
import { Page, PageHeader } from "../components/ui";
import { VIDEOS } from "../data/seed";
import type { VideoItem, VideoStatus } from "../types";

type Filter = "all" | VideoStatus;

const STATUS_META: Record<VideoStatus, { label: string; color: string }> = {
  done: { label: "Concluído", color: "var(--status-success)" },
  generating: { label: "Gerando", color: "var(--status-warning)" },
  failed: { label: "Falhou", color: "var(--status-error)" },
};

export default function MeusVideos({ onNew }: { onNew: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = {
    all: VIDEOS.length,
    done: VIDEOS.filter((v) => v.status === "done").length,
    generating: VIDEOS.filter((v) => v.status === "generating").length,
    failed: VIDEOS.filter((v) => v.status === "failed").length,
  };
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `Todos · ${counts.all}` },
    { id: "done", label: `Concluídos · ${counts.done}` },
    { id: "generating", label: `Gerando · ${counts.generating}` },
    { id: "failed", label: `Falhas · ${counts.failed}` },
  ];
  const list = filter === "all" ? VIDEOS : VIDEOS.filter((v) => v.status === filter);

  return (
    <Page>
      <PageHeader
        title="Meus vídeos"
        subtitle="Tudo que a sua equipe gerou — pronto pra baixar e postar."
        right={<button style={newBtn} onClick={onNew}>+ Novo vídeo</button>}
      />
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              ...filterPill,
              background: active ? "rgba(124,92,255,0.16)" : "var(--surface-panel)",
              border: active ? "1px solid var(--accent-border-strong)" : "1px solid var(--hairline)",
              color: active ? "#fff" : "var(--text-muted)",
            }}>{f.label}</button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(206px, 1fr))", gap: 18 }}>
        {list.map((v) => <VideoCard key={v.id} v={v} />)}
      </div>
    </Page>
  );
}

function VideoCard({ v }: { v: VideoItem }) {
  const meta = STATUS_META[v.status];
  return (
    <div style={card} className="ac-card">
      <div style={{ ...thumb, background: `linear-gradient(150deg, hsl(${v.hue} 55% 22%), hsl(${v.hue + 30} 60% 14%))` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.16, backgroundImage: "repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 16px)" }} />
        <div style={thumbTop}>
          <span style={statusChip}><span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />{meta.label}</span>
          <span style={durChip}>{v.duration}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {v.status === "done" && <span style={playCircle}><span style={playGlyph} /></span>}
          {v.status === "generating" && <span style={spinner} />}
          {v.status === "failed" && <span style={errMark}>!</span>}
        </div>
      </div>
      <div style={{ padding: "12px 4px 0" }}>
        <div style={title}>{v.title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mono-muted)", marginTop: 6 }}>@{v.handle} · {v.age}</div>
        <div style={{ marginTop: 12 }}>
          {v.status === "done" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={smallBtn}>Baixar</button>
              <button style={{ ...smallBtn, background: "var(--accent-gradient)", border: "none", color: "#fff" }}>Postar</button>
            </div>
          )}
          {v.status === "generating" && <span style={{ fontSize: 12.5, color: "var(--status-warning)" }}>Renderizando…</span>}
          {v.status === "failed" && <button style={{ ...smallBtn, color: "var(--status-error-text)", borderColor: "var(--error-border)" }}>Tentar de novo</button>}
        </div>
      </div>
    </div>
  );
}

const newBtn: CSSProperties = { padding: "12px 20px", borderRadius: 13, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, boxShadow: "var(--shadow-accent)" };
const filterPill: CSSProperties = { padding: "9px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 500 };
const card: CSSProperties = { background: "var(--surface-panel)", borderRadius: 16, border: "1px solid var(--hairline)", padding: 12, transition: "transform .12s, border-color .12s" };
const thumb: CSSProperties = { position: "relative", aspectRatio: "9 / 16", borderRadius: 12, overflow: "hidden" };
const thumbTop: CSSProperties = { position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between" };
const statusChip: CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff", background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: 999, backdropFilter: "blur(4px)" };
const durChip: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff", background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: 999 };
const playCircle: CSSProperties = { width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" };
const playGlyph: CSSProperties = { width: 0, height: 0, borderStyle: "solid", borderWidth: "9px 0 9px 14px", borderColor: "transparent transparent transparent #fff", marginLeft: 4 };
const spinner: CSSProperties = { width: 42, height: 42, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.22)", borderTopColor: "var(--status-warning)", animation: "acSpin 0.8s linear infinite" };
const errMark: CSSProperties = { width: 44, height: 44, borderRadius: "50%", background: "rgba(255,84,112,0.18)", color: "var(--status-error)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 };
const title: CSSProperties = { fontSize: 14, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const smallBtn: CSSProperties = { flex: 1, padding: "8px 10px", borderRadius: 10, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", color: "var(--text-body)", fontSize: 12.5, fontWeight: 600 };
