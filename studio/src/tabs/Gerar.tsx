import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  Page, PageHeader, Panel, SectionHeader, Segmented, Select, Slider, ColorRow, Toggle, Label, Chip, Expander,
} from "../components/ui";
import PhonePreview from "../components/PhonePreview";
import { generateScript, generateTerms, createVideo, pollTask, progressLabel, uploadMaterial } from "../lib/api";
import type { Aspect } from "../types";

const VOICES = [
  { id: "pt-BR-AntonioNeural-Male", label: "Antônio · masculina (BR)" },
  { id: "pt-BR-FranciscaNeural-Female", label: "Francisca · feminina (BR)" },
  { id: "pt-BR-ThalitaMultilingualNeural-Female", label: "Thalita · feminina (BR, multi)" },
];
const FONTS = [
  { id: "BeVietnamPro-Bold.ttf", label: "Be Vietnam Pro · Bold (acentos PT)" },
  { id: "BeVietnamPro-Medium.ttf", label: "Be Vietnam Pro · Medium" },
  { id: "Charm-Bold.ttf", label: "Charm · Bold" },
  { id: "MicrosoftYaHeiBold.ttc", label: "Microsoft YaHei · Bold" },
  { id: "STHeitiMedium.ttc", label: "STHeiti · Medium" },
];
const TRANSITIONS = [
  { id: "", label: "Nenhuma" },
  { id: "Shuffle", label: "Aleatória (Shuffle)" },
  { id: "FadeIn", label: "Fade In" },
  { id: "FadeOut", label: "Fade Out" },
  { id: "SlideIn", label: "Slide In" },
  { id: "SlideOut", label: "Slide Out" },
];

export default function Gerar({ onGoToVideos }: { onGoToVideos: () => void }) {
  // roteiro
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [paragraphs, setParagraphs] = useState("1");
  // vídeo
  const [source, setSource] = useState("pexels");
  const [materials, setMaterials] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aspect, setAspect] = useState<Aspect>("9:16");
  const [concatMode, setConcatMode] = useState("random");
  const [transition, setTransition] = useState("");
  const [clipDuration, setClipDuration] = useState(3);
  const [videoCount, setVideoCount] = useState("1");
  // áudio
  const [voiceName, setVoiceName] = useState(VOICES[0].id);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [bgmType, setBgmType] = useState("random");
  const [bgmVolume, setBgmVolume] = useState(0.2);
  // legendas
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [fontName, setFontName] = useState(FONTS[0].id);
  const [subtitlePosition, setSubtitlePosition] = useState("bottom");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState(60);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [subtitleBg, setSubtitleBg] = useState(false);
  // estado de execução
  const [scriptLoading, setScriptLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genName, setGenName] = useState("");
  const [error, setError] = useState("");
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const localNeedsUpload = source === "local" && materials.length === 0;

  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setError(""); setUploading(true);
    try {
      const names: string[] = [];
      for (const f of files) names.push(await uploadMaterial(f));
      setMaterials((m) => [...m, ...names]);
    } catch (err) {
      setError(msg(err, "Falha no upload do vídeo."));
    } finally {
      setUploading(false);
    }
  }

  async function genScript() {
    if (!topic.trim() || scriptLoading) return;
    setError(""); setScriptLoading(true);
    try {
      const s = await generateScript({ subject: topic.trim(), language: "pt-BR", paragraphs: Number(paragraphs) });
      setScript(s);
      const terms = await generateTerms({ subject: topic.trim(), script: s });
      if (terms.length) setKeywords(terms);
    } catch (e) {
      setError(msg(e, "Não foi possível gerar o roteiro. Confira a chave da Gemini."));
    } finally {
      setScriptLoading(false);
    }
  }

  async function generate() {
    if (generating) return;
    if (localNeedsUpload) { setError("Envie ao menos um vídeo local antes de gerar."); return; }
    if (!script.trim()) { setError("Gere ou escreva um roteiro antes."); return; }
    setError(""); setGenerating(true); setProgress(0); setGenName(progressLabel(0));
    try {
      const taskId = await createVideo({
        subject: topic.trim() || "Vídeo Acelera",
        script: script.trim(),
        terms: keywords,
        source, materials, aspect, concatMode, transition,
        clipDuration, videoCount: Number(videoCount),
        voiceName, voiceVolume, voiceRate, bgmType, bgmVolume,
        subtitlesOn, fontName, subtitlePosition, textColor, fontSize, strokeColor, strokeWidth, subtitleBg,
        language: "pt-BR",
      });
      const { promise, cancel } = pollTask(taskId, (p) => { setProgress(p); setGenName(progressLabel(p)); });
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

      <Panel style={{ marginBottom: 22 }}>
        <Label>Tema do vídeo</Label>
        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <input className="ac-focusable" style={topicInput} placeholder="Ex: 5 hábitos de quem acorda às 5h"
            value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && genScript()} />
          <button style={{ ...genScriptBtn, opacity: scriptLoading || !topic.trim() ? 0.6 : 1 }} onClick={genScript} disabled={scriptLoading}>
            {scriptLoading ? "Gerando roteiro…" : "◆ Gerar roteiro com IA"}
          </button>
        </div>
      </Panel>

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Col 1 */}
        <Panel style={{ flex: "1.18 1 330px" }}>
          <SectionHeader title="Roteiro & palavras-chave" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Select label="Idioma do roteiro" value="pt-BR" onChange={() => {}} options={[{ id: "pt-BR", label: "🇧🇷 Português (BR)" }]} /></div>
              <div style={{ width: 130 }}><Select label="Parágrafos" value={paragraphs} onChange={setParagraphs} options={["1", "2", "3", "4", "5"].map((n) => ({ id: n, label: n }))} /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Label>Roteiro</Label>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--status-success)" }}>{script ? "● pronto" : "○ vazio"}</span>
              </div>
              <textarea className="ac-focusable" style={textarea}
                placeholder="Digite um tema acima e clique em 'Gerar roteiro com IA' — ou escreva aqui."
                value={script} onChange={(e) => setScript(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Label>Palavras-chave</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {keywords.length === 0
                  ? <span style={{ fontSize: 12.5, color: "var(--text-muted-2)" }}>Geradas pela IA junto com o roteiro.</span>
                  : <>{keywords.map((k) => <Chip key={k}>{k}</Chip>)}<Chip dashed>+ adicionar</Chip></>}
              </div>
            </div>
          </div>
        </Panel>

        {/* Col 2 */}
        <Panel style={{ flex: "1 1 320px" }}>
          <SectionHeader title="Vídeo & áudio" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* vídeo */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Fonte dos clipes</Label>
              <Segmented value={source} onChange={setSource}
                options={[{ id: "pexels", label: "Pexels" }, { id: "pixabay", label: "Pixabay" }, { id: "local", label: "Local" }]} />
              {source === "local" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
                  <label style={{ ...uploadBtn, opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? "Enviando…" : "↑ Enviar vídeo(s) local"}
                    <input type="file" accept="video/*,image/*" multiple style={{ display: "none" }} onChange={onUpload} disabled={uploading} />
                  </label>
                  {materials.map((f, i) => (
                    <div key={i} style={matRow}>
                      <span style={matName}>{f}</span>
                      <button style={matDel} title="Remover" onClick={() => setMaterials(materials.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                  {materials.length === 0 && <span style={{ fontSize: 11.5, color: "var(--text-muted-2)" }}>Envie ao menos um arquivo (mp4, mov, png…) pra usar a fonte Local.</span>}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>Proporção</Label>
              <Segmented value={aspect} onChange={setAspect}
                options={[{ id: "9:16", label: "9:16 · Retrato" }, { id: "16:9", label: "16:9 · Paisagem" }]} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Select label="Concatenação" value={concatMode} onChange={setConcatMode} options={[{ id: "random", label: "Aleatória" }, { id: "sequential", label: "Sequencial" }]} /></div>
              <div style={{ flex: 1 }}><Select label="Transição" value={transition} onChange={setTransition} options={TRANSITIONS} /></div>
            </div>
            <Slider label="Duração por clipe" value={clipDuration} onChange={setClipDuration} min={1} max={8} step={1} format={(v) => `${v}s`} />
            <Select label="Nº de vídeos (em lote)" value={videoCount} onChange={setVideoCount} options={["1", "2", "3", "4", "5"].map((n) => ({ id: n, label: n }))} />

            <div style={{ height: 1, background: "var(--hairline)", margin: "2px 0" }} />

            {/* áudio */}
            <Select label="Voz da narração (TTS · edge-tts grátis)" value={voiceName} onChange={setVoiceName} options={VOICES} />
            <Slider label="Volume da fala" value={voiceVolume} onChange={setVoiceVolume} min={0.6} max={3} step={0.1} format={(v) => `${v.toFixed(1)}x`} />
            <Slider label="Velocidade da fala" value={voiceRate} onChange={setVoiceRate} min={0.5} max={2} step={0.1} format={(v) => `${v.toFixed(1)}x`} />
            <Select label="Música de fundo" value={bgmType} onChange={setBgmType} options={[{ id: "random", label: "Aleatória (do acervo)" }, { id: "", label: "Nenhuma" }]} />
            <Slider label="Volume da música" value={bgmVolume} onChange={setBgmVolume} min={0} max={1} step={0.05} format={(v) => `${Math.round(v * 100)}%`} />

            {/* legendas avançadas */}
            <Expander title="Configurações de legendas">
              <Select label="Fonte da legenda" value={fontName} onChange={setFontName} options={FONTS} />
              <Select label="Posição da legenda" value={subtitlePosition} onChange={setSubtitlePosition}
                options={[{ id: "bottom", label: "Inferior (recomendado)" }, { id: "center", label: "Centro" }, { id: "top", label: "Topo" }]} />
              <div style={{ display: "flex", gap: 16 }}>
                <ColorRow label="Cor do texto" value={textColor} onChange={setTextColor} />
                <ColorRow label="Cor do contorno" value={strokeColor} onChange={setStrokeColor} />
              </div>
              <Slider label="Tamanho da fonte" value={fontSize} onChange={setFontSize} min={28} max={100} step={1} format={(v) => `${v}px`} />
              <Slider label="Largura do contorno" value={strokeWidth} onChange={setStrokeWidth} min={0} max={4} step={0.5} format={(v) => v.toFixed(1)} />
              <Toggle on={subtitleBg} onChange={setSubtitleBg} label="Fundo da legenda" sublabel={subtitleBg ? "Ativado" : "Desativado"} />
            </Expander>
          </div>
        </Panel>

        {/* Col 3 */}
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
                <button style={{ ...generateBtn, opacity: script.trim() && !localNeedsUpload ? 1 : 0.6 }} onClick={generate}>Gerar vídeo</button>
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
const textarea: CSSProperties = { height: 150, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: 14, color: "var(--text-body)", fontSize: 14, lineHeight: 1.6, resize: "vertical", fontFamily: "var(--font-body)" };
const generateBtn: CSSProperties = { height: 54, borderRadius: 13, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, boxShadow: "var(--shadow-accent)" };
const progressCard: CSSProperties = { display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--accent-border)" };
const progBarTrack: CSSProperties = { height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" };
const progBarFill: CSSProperties = { height: "100%", borderRadius: 999, background: "var(--accent-gradient)", transition: "width .3s ease" };
const uploadBtn: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", height: 44, borderRadius: 11, border: "1px dashed var(--accent-border)", background: "rgba(124,92,255,0.08)", color: "var(--text-purple)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" };
const matRow: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, height: 38, borderRadius: 9, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: "0 10px" };
const matName: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const matDel: CSSProperties = { width: 24, height: 24, flex: "0 0 auto", borderRadius: 7, border: "1px solid var(--error-border)", background: "rgba(255,84,112,0.10)", color: "var(--status-error-text)", fontSize: 11 };
