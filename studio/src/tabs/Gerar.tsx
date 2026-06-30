import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Page, PageHeader, Panel, SectionHeader, Segmented, SelectRow, Toggle, Label, Chip } from "../components/ui";
import PhonePreview from "../components/PhonePreview";
import { SAMPLE_SCRIPT, SAMPLE_KEYWORDS } from "../data/seed";
import { runPipeline } from "../lib/pipeline";
import type { Aspect } from "../types";

export default function Gerar({ onGoToVideos }: { onGoToVideos: () => void }) {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState(SAMPLE_SCRIPT);
  const [source, setSource] = useState<"pexels" | "pixabay" | "local">("pexels");
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [voiceFem, setVoiceFem] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genName, setGenName] = useState("");
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  function generate() {
    if (generating) return;
    setGenerating(true);
    setProgress(0);
    cancelRef.current = runPipeline(
      (s) => { setGenName(s.label); setProgress(s.progress); },
      () => { setGenerating(false); setTimeout(onGoToVideos, 600); }
    );
  }

  return (
    <Page>
      <PageHeader
        title="Gerar vídeo"
        subtitle="Descreva um tema — a IA escreve o roteiro, busca os clipes, narra e legenda."
        right={<span style={draftPill}><span style={dot("var(--status-success)")} />Rascunho salvo</span>}
      />

      {/* Barra de tema */}
      <Panel style={{ marginBottom: 22 }}>
        <Label>Tema do vídeo</Label>
        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <input
            className="ac-focusable"
            style={topicInput}
            placeholder="Ex: 5 hábitos de quem acorda às 5h"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button style={genScriptBtn}>◆ Gerar roteiro com IA</button>
        </div>
      </Panel>

      {/* 3 colunas */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Col 1: Roteiro & palavras-chave */}
        <Panel style={{ flex: "1.18 1 330px" }}>
          <SectionHeader title="Roteiro & palavras-chave" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SelectRow label="Idioma do roteiro" value="🇧🇷 Português (BR)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Label>Roteiro</Label>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--status-success)" }}>● gerado pela IA</span>
              </div>
              <textarea
                className="ac-focusable"
                style={textarea}
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Label>Palavras-chave</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SAMPLE_KEYWORDS.map((k) => <Chip key={k}>{k}</Chip>)}
                <Chip dashed>+ adicionar</Chip>
              </div>
            </div>
          </div>
        </Panel>

        {/* Col 2: Vídeo & áudio */}
        <Panel style={{ flex: "1 1 300px" }}>
          <SectionHeader title="Vídeo & áudio" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Fonte dos clipes</Label>
              <Segmented
                value={source}
                onChange={setSource}
                options={[{ id: "pexels", label: "Pexels" }, { id: "pixabay", label: "Pixabay" }, { id: "local", label: "Local" }]}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Proporção</Label>
              <Segmented
                value={aspect}
                onChange={setAspect}
                options={[{ id: "9:16", label: "9:16 · Retrato" }, { id: "16:9", label: "16:9 · Paisagem" }]}
              />
            </div>
            <SelectRow label="Transição" value="Fade" />
            <SelectRow label="Duração por clipe" value="3.5s" />
            <div style={{ height: 1, background: "var(--hairline)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Voz da narração</Label>
              <Segmented
                value={voiceFem ? "fem" : "masc"}
                onChange={(v) => setVoiceFem(v === "fem")}
                options={[{ id: "masc", label: "Antônio · masc" }, { id: "fem", label: "Francisca · fem" }]}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Velocidade da fala</Label>
              <div style={sliderTrack}><div style={{ ...sliderFill, width: "52%" }} /><span style={{ ...sliderKnob, left: "52%" }} /></div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-purple-2)", alignSelf: "flex-end" }}>1.0x</span>
            </div>
            <SelectRow label="Música de fundo" value="Lo-fi suave" />
          </div>
        </Panel>

        {/* Col 3: Preview + actions */}
        <Panel style={{ flex: "0.95 1 286px" }}>
          <PhonePreview aspect={aspect} generating={generating} progress={progress} genName={genName} subtitlesOn={subtitlesOn} />
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <Toggle on={subtitlesOn} onChange={setSubtitlesOn} label="Legendas automáticas" sublabel={subtitlesOn ? "Ativadas" : "Desativadas"} />
            {generating ? (
              <div style={progressCard}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "var(--text-body)" }}>{genName}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-purple-2)" }}>{progress}%</span>
                </div>
                <div style={progBarTrack}><div style={{ ...progBarFill, width: `${progress}%` }} /></div>
                <span style={{ fontSize: 11.5, color: "var(--text-muted-2)" }}>renderizando… não feche a aba</span>
              </div>
            ) : (
              <>
                <button style={generateBtn} onClick={generate}>Gerar vídeo</button>
                <span style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted-2)" }}>≈ 90s · narração grátis (edge-tts)</span>
              </>
            )}
          </div>
        </Panel>
      </div>
    </Page>
  );
}

const dot = (c: string): CSSProperties => ({ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" });
const draftPill: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "var(--surface-panel-alt)", border: "1px solid var(--hairline-2)", fontSize: 12.5, color: "var(--text-muted)" };
const topicInput: CSSProperties = { flex: "1 1 280px", height: 50, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: "0 16px", color: "var(--text-strong)", fontSize: 15 };
const genScriptBtn: CSSProperties = { height: 50, padding: "0 22px", borderRadius: 12, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, boxShadow: "var(--shadow-accent)", whiteSpace: "nowrap" };
const textarea: CSSProperties = { height: 158, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: 14, color: "var(--text-body)", fontSize: 14, lineHeight: 1.6, resize: "vertical", fontFamily: "var(--font-body)" };
const sliderTrack: CSSProperties = { position: "relative", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.10)" };
const sliderFill: CSSProperties = { position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 999, background: "var(--accent-gradient)" };
const sliderKnob: CSSProperties = { position: "absolute", top: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" };
const generateBtn: CSSProperties = { height: 54, borderRadius: 13, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, boxShadow: "var(--shadow-accent)" };
const progressCard: CSSProperties = { display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--accent-border)" };
const progBarTrack: CSSProperties = { height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" };
const progBarFill: CSSProperties = { height: "100%", borderRadius: 999, background: "var(--accent-gradient)", transition: "width .3s ease" };
