import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Page, PageHeader } from "../components/ui";
import { VIDEOS } from "../data/seed";
import { listTasks, type ApiTask, TASK_STATE } from "../lib/api";
import type { VideoStatus } from "../types";

type Filter = "all" | VideoStatus;

interface CardData {
  id: string;
  title: string;
  status: VideoStatus;
  progress: number;
  url: string | null;
  hue: number;
}

const STATUS_META: Record<VideoStatus, { label: string; color: string }> = {
  done: { label: "Concluído", color: "var(--status-success)" },
  generating: { label: "Gerando", color: "var(--status-warning)" },
  failed: { label: "Falhou", color: "var(--status-error)" },
};

function statusFromState(state?: number): VideoStatus {
  if (state === TASK_STATE.COMPLETE) return "done";
  if (state === TASK_STATE.FAILED) return "failed";
  return "generating";
}

function hueFrom(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function mapTask(t: ApiTask): CardData {
  const id = t.task_id ?? Math.random().toString(36).slice(2);
  return {
    id,
    title: t.params?.video_subject || "Vídeo sem título",
    status: statusFromState(t.state),
    progress: t.progress ?? 0,
    url: t.videos?.[0] ?? t.combined_videos?.[0] ?? null,
    hue: hueFrom(id),
  };
}

export default function MeusVideos({ onNew }: { onNew: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let alive = true;
    listTasks()
      .then((tasks) => {
        if (!alive) return;
        setCards(tasks.map(mapTask));
        setDemo(false);
      })
      .catch(() => {
        // Sem backend (modo demo): mostra os dados de exemplo.
        if (!alive) return;
        setCards(VIDEOS.map((v) => ({ id: v.id, title: v.title, status: v.status, progress: 0, url: null, hue: v.hue })));
        setDemo(true);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => ({
    all: cards.length,
    done: cards.filter((c) => c.status === "done").length,
    generating: cards.filter((c) => c.status === "generating").length,
    failed: cards.filter((c) => c.status === "failed").length,
  }), [cards]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `Todos · ${counts.all}` },
    { id: "done", label: `Concluídos · ${counts.done}` },
    { id: "generating", label: `Gerando · ${counts.generating}` },
    { id: "failed", label: `Falhas · ${counts.failed}` },
  ];
  const list = filter === "all" ? cards : cards.filter((c) => c.status === filter);

  return (
    <Page>
      <PageHeader
        title="Meus vídeos"
        subtitle={demo ? "Exibindo exemplos (backend offline)." : "Tudo que a sua equipe gerou — pronto pra baixar e postar."}
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

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando…</div>
      ) : list.length === 0 ? (
        <div style={emptyBox}>
          Nenhum vídeo ainda. Clique em <b>+ Novo vídeo</b> e gere o primeiro. 🎬
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(206px, 1fr))", gap: 18 }}>
          {list.map((v) => <VideoCard key={v.id} v={v} />)}
        </div>
      )}
    </Page>
  );
}

function VideoCard({ v }: { v: CardData }) {
  const meta = STATUS_META[v.status];
  return (
    <div style={card}>
      <div style={{ ...thumb, background: `linear-gradient(150deg, hsl(${v.hue} 55% 22%), hsl(${(v.hue + 30) % 360} 60% 14%))` }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.16, backgroundImage: "repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 16px)" }} />
        <div style={thumbTop}>
          <span style={statusChip}><span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />{meta.label}</span>
          {v.status === "generating" && v.progress > 0 && <span style={durChip}>{v.progress}%</span>}
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {v.status === "done" && <span style={playCircle}><span style={playGlyph} /></span>}
          {v.status === "generating" && <span style={spinner} />}
          {v.status === "failed" && <span style={errMark}>!</span>}
        </div>
      </div>
      <div style={{ padding: "12px 4px 0" }}>
        <div style={title}>{v.title}</div>
        <div style={{ marginTop: 12 }}>
          {v.status === "done" && (
            <div style={{ display: "flex", gap: 8 }}>
              {v.url
                ? <a href={v.url} download style={{ ...smallBtn, textAlign: "center", textDecoration: "none", color: "var(--text-body)" }}>Baixar</a>
                : <span style={{ ...smallBtn, opacity: 0.5, textAlign: "center" }}>Baixar</span>}
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
const emptyBox: CSSProperties = { padding: "40px 24px", borderRadius: 16, background: "var(--surface-panel)", border: "1px dashed var(--hairline-2)", color: "var(--text-muted)", fontSize: 14.5, textAlign: "center" };
const card: CSSProperties = { background: "var(--surface-panel)", borderRadius: 16, border: "1px solid var(--hairline)", padding: 12 };
const thumb: CSSProperties = { position: "relative", aspectRatio: "9 / 16", borderRadius: 12, overflow: "hidden" };
const thumbTop: CSSProperties = { position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between" };
const statusChip: CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff", background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: 999, backdropFilter: "blur(4px)" };
const durChip: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff", background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: 999 };
const playCircle: CSSProperties = { width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" };
const playGlyph: CSSProperties = { width: 0, height: 0, borderStyle: "solid", borderWidth: "9px 0 9px 14px", borderColor: "transparent transparent transparent #fff", marginLeft: 4 };
const spinner: CSSProperties = { width: 42, height: 42, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.22)", borderTopColor: "var(--status-warning)", animation: "acSpin 0.8s linear infinite" };
const errMark: CSSProperties = { width: 44, height: 44, borderRadius: "50%", background: "rgba(255,84,112,0.18)", color: "var(--status-error)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 };
const title: CSSProperties = { fontSize: 14, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const smallBtn: CSSProperties = { flex: 1, padding: "8px 10px", borderRadius: 10, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", color: "var(--text-body)", fontSize: 12.5, fontWeight: 600, display: "block" };
