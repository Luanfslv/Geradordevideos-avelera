import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Page, PageHeader, Panel, SectionHeader, Segmented, SelectRow, Toggle, Label, Chip } from "../components/ui";
import PhonePreview from "../components/PhonePreview";
import { SAMPLE_KEYWORDS } from "../data/seed";
import {
  generateScript,
  generateTerms,
  createVideo,
  pollTask,
  progressLabel,
} from "../lib/api";
import type { Aspect } from "../types";

export default function Gerar({ onGoToVideos }: { onGoToVideos: () => void }) {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [keywords, setKeywords] = useState<string[]>(SAMPLE_KEYWORDS);
  const [source, setSource] = useState<"pexels" | "pixabay" | "local">("pexels");
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [voiceFem, setVoiceFem] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(true);

  const [scriptLoading, setScriptLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genName, setGenName] = useState("");
  const [error, setError] = useState("");
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  async function genScript() {
    if (!topic.trim() || scriptLoading) return;
    setError("");
    setScriptLoading(true);
    try {
      const s = await generateScript({ subject: topic.trim(), language: "pt-BR" });
      setScript(s);
      const terms = await generateTerms({ subject: topic.trim(), script: s });
      if (terms.length) setKeywords(terms);
    } catch (e) {
      setError(msg(e, "Não foi possível gerar o roteiro. Confira a chave da Gemini nas Configurações."));
    } finally {
      setScriptLoading(false);
    }
  }

  async function generate() {
    if (generating) return;
    if (!script.trim()) {
      setError("Gere ou escreva um roteiro antes de gerar o vídeo.");
      return;
    }
    setError("");
    setGenerating(true);
    setProgress(0);
    setGenName(progressLabel(0));
    try {
      const taskId = await createVideo({
        subject: topic.trim() || "Vídeo Acelera",
        script: script.trim(),
        terms: keywords,
        aspect,
        voiceName: voiceFem ? "pt-BR-FranciscaNeural-Female" : "pt-BR-AntonioNeural-Male",
        source,
        subtitlesOn,
        language: "pt-BR",
      });
      const { promise, cancel } = pollTask(taskId, (p) => {
        setProgress(p);
        setGenName(progressLabel(p));
      });
      cancelRef.current = cancel;
      await promise;
      setGenerating(false);
      setTimeout(onGoToVideos, 700);
    } catch (e) {
      setGenerating(false);
      setError(msg(e, "A geração do vídeo falhou. Veja os logs do backend."));
    }
  }

  return (
    <Page>
      <PageHeader
        title="Gerar vídeo"
        subtitle="Descreva um tema — a IA escreve o roteiro, busca os clipes, narra e legenda."
        right={<span style={draftPill}><span style={dot("var(--status-success)")} />Conectado ao backend</span>}
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
            onKeyDown={(e) => e.key === "Enter" && genScript()}
          />
          <button style={{ ...genScriptBtn, opacity: scriptLoading || !topic.trim() ? 0.6 : 1 }} onClick={genScript} disabled={scriptLoading}>
            {scriptLoading ? "Gerando roteiro…" : "◆ Gerar roteiro com IA"}
          </button>
        </div>
      </Panel>

      {error && <div style={errorBox}>{error}</div>}

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
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--status-success)" }}>
                  {script ? "● pronto" : "○ vazio"}
                </span>
              </div>
              <textarea
                className="ac-focusable"
                style={textarea}
                placeholder="Digite um tema acima e clique em 'Gerar roteiro com IA' — ou escreva o roteiro aqui."
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Label>Palavras-chave</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {keywords.map((k) => <Chip key={k}>{k}</Chip>)}
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
              <Segmented value={source} onChange={setSource}
                options={[{ id: "pexels", label: "Pexels" }, { id: "pixabay", label: "Pixabay" }, { id: "local", label: "Local" }]} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Proporção</Label>
              <Segmented value={aspect} onChange={setAspect}
                options={[{ id: "9:16", label: "9:16 · Retrato" }, { id: "16:9", label: "16:9 · Paisagem" }]} />
            </div>
            <div style={{ height: 1, background: "var(--hairline)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Voz da narração</Label>
              <Segmented value={voiceFem ? "fem" : "masc"} onChange={(v) => setVoiceFem(v === "fem")}
                options={[{ id: "masc", label: "Antônio · masc" }, { id: "fem", label: "Francisca · fem" }]} />
            </div>
            <SelectRow label="Música de fundo" value="Aleatória (do acervo)" />
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
                <button style={{ ...generateBtn, opacity: script.trim() ? 1 : 0.6 }} onClick={generate}>Gerar vídeo</button>
                <span style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted-2)" }}>narração grátis (edge-tts) · pt-BR</span>
              </>
            )}
          </div>
        </Panel>
      </div>
    </Page>
  );
}

function msg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

const dot = (c: string): CSSProperties => ({ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" });
const draftPill: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "var(--surface-panel-alt)", border: "1px solid var(--hairline-2)", fontSize: 12.5, color: "var(--text-muted)" };
const topicInput: CSSProperties = { flex: "1 1 280px", height: 50, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: "0 16px", color: "var(--text-strong)", fontSize: 15 };
const genScriptBtn: CSSProperties = { height: 50, padding: "0 22px", borderRadius: 12, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, boxShadow: "var(--shadow-accent)", whiteSpace: "nowrap" };
const errorBox: CSSProperties = { margin: "0 0 18px", padding: "12px 16px", borderRadius: 12, background: "rgba(255,84,112,0.10)", border: "1px solid var(--error-border)", color: "var(--status-error-text)", fontSize: 13.5 };
const textarea: CSSProperties = { height: 158, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: 14, color: "var(--text-body)", fontSize: 14, lineHeight: 1.6, resize: "vertical", fontFamily: "var(--font-body)" };
const generateBtn: CSSProperties = { height: 54, borderRadius: 13, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, boxShadow: "var(--shadow-accent)" };
const progressCard: CSSProperties = { display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--accent-border)" };
const progBarTrack: CSSProperties = { height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" };
const progBarFill: CSSProperties = { height: "100%", borderRadius: 999, background: "var(--accent-gradient)", transition: "width .3s ease" };
