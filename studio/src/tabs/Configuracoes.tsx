import { useEffect, useState, type ChangeEvent, type CSSProperties } from "react";
import { Page, PageHeader, Panel, SectionHeader, Label, Select, Toggle, Segmented } from "../components/ui";
import Avatar from "../components/Avatar";
import {
  getConfig, updateConfig, type ManagedConfig,
  listLibrary, uploadLibrary, deleteLibrary, ADMIN_EMAIL, type LibraryItem,
} from "../lib/api";
import { getUserEmail, authConfigured } from "../lib/supabase";
import type { Member } from "../types";

export default function Configuracoes({ user }: { user: Member }) {
  const [cfg, setCfg] = useState<ManagedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [provider, setProvider] = useState("gemini");
  const [llmKey, setLlmKey] = useState("");
  const [savedLLM, setSavedLLM] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notify, setNotify] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [libUploading, setLibUploading] = useState(false);

  useEffect(() => {
    getConfig()
      .then((c) => {
        setCfg(c);
        setProvider(c.llm_provider || "gemini");
        setLlmKey((c.llm_provider === "openai" ? c.openai_api_key : c.gemini_api_key) || "");
      })
      .catch(() => setErr("Não foi possível carregar a configuração (backend offline ou sem permissão)."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    (async () => {
      const email = await getUserEmail();
      setIsAdmin(!authConfigured || email === ADMIN_EMAIL);
      try { setLibrary(await listLibrary()); } catch { /* sem acervo / offline */ }
    })();
  }, []);

  async function onLibUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setErr(""); setLibUploading(true);
    try {
      for (const f of files) await uploadLibrary(f);
      setLibrary(await listLibrary());
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Falha no upload do acervo.");
    } finally {
      setLibUploading(false);
    }
  }

  async function removeLib(name: string) {
    try {
      await deleteLibrary(name);
      setLibrary((l) => l.filter((x) => x.file !== name));
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Falha ao remover do acervo.");
    }
  }

  function onProvider(p: string) {
    setProvider(p);
    if (cfg) setLlmKey((p === "openai" ? cfg.openai_api_key : cfg.gemini_api_key) || "");
  }

  async function saveLLM() {
    const patch: Partial<ManagedConfig> = { llm_provider: provider };
    if (provider === "openai") patch.openai_api_key = llmKey;
    else patch.gemini_api_key = llmKey;
    try {
      await updateConfig(patch);
      setCfg((c) => (c ? ({ ...c, ...patch } as ManagedConfig) : c));
      setSavedLLM(true);
      setTimeout(() => setSavedLLM(false), 2000);
    } catch {
      setErr("Falha ao salvar. Tente de novo.");
    }
  }

  async function saveKeys(field: keyof ManagedConfig, keys: string[]) {
    try {
      await updateConfig({ [field]: keys } as Partial<ManagedConfig>);
      setCfg((c) => (c ? ({ ...c, [field]: keys } as ManagedConfig) : c));
    } catch {
      setErr("Falha ao salvar a chave. Tente de novo.");
    }
  }

  return (
    <Page maxWidth={1180}>
      <PageHeader title="Configurações" subtitle="Chaves de API, IA, narração e quem tem acesso ao estúdio." />
      {err && <div style={errorBox}>{err}</div>}
      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Carregando…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 18, alignItems: "start" }}>
          {/* Esquerda */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Panel>
              <SectionHeader title="Inteligência artificial (roteiro)" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Select label="Provedor" value={provider} onChange={onProvider}
                  options={[{ id: "gemini", label: "Google Gemini (grátis)" }, { id: "openai", label: "OpenAI" }]} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label>{provider === "openai" ? "Chave OpenAI" : "Chave Gemini"}</Label>
                  <input className="ac-focusable" type="password" style={input} placeholder="Cole a chave da API"
                    value={llmKey} onChange={(e) => setLlmKey(e.target.value)} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button style={saveBtn} onClick={saveLLM}>Salvar</button>
                  {savedLLM && <span style={{ color: "var(--status-success)", fontSize: 13 }}>✓ salvo</span>}
                </div>
              </div>
            </Panel>

            <Panel>
              <SectionHeader title="Fontes de vídeo (chaves de API)" />
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <KeyManager label="Pexels" keys={cfg?.pexels_api_keys ?? []} onChange={(k) => saveKeys("pexels_api_keys", k)} />
                <KeyManager label="Pixabay" keys={cfg?.pixabay_api_keys ?? []} onChange={(k) => saveKeys("pixabay_api_keys", k)} />
                <KeyManager label="Coverr" keys={cfg?.coverr_api_keys ?? []} onChange={(k) => saveKeys("coverr_api_keys", k)} />
              </div>
            </Panel>

            {isAdmin && (
              <Panel>
                <SectionHeader title="Acervo de vídeos (admin)" />
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-muted)" }}>
                  Vídeos padrão que toda a equipe pode usar como fonte <b>Acervo</b> na tela Gerar — sem Pexels nem upload próprio.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {library.length === 0 && <span style={{ fontSize: 12.5, color: "var(--text-muted-2)" }}>Nenhum vídeo no acervo ainda.</span>}
                  {library.map((v) => (
                    <div key={v.file} style={keyRow}>
                      <span style={{ fontSize: 12.5, color: "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.name} <span style={{ color: "var(--text-faint)" }}>· {fmtSize(v.size)}</span>
                      </span>
                      <button style={delBtn} title="Remover" onClick={() => removeLib(v.file)}>✕</button>
                    </div>
                  ))}
                  <label style={{ ...uploadLabel, opacity: libUploading ? 0.6 : 1 }}>
                    {libUploading ? "Enviando… (vídeos longos podem demorar)" : "↑ Subir vídeo(s) ao acervo"}
                    <input type="file" accept="video/*" multiple style={{ display: "none" }} onChange={onLibUpload} disabled={libUploading} />
                  </label>
                </div>
              </Panel>
            )}

            <Panel>
              <SectionHeader title="Narração (TTS)" />
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
                Microsoft <b>edge-tts</b> — grátis e sem chave. As vozes e a velocidade são escolhidas por vídeo na tela <b>Gerar</b>.
              </p>
            </Panel>
          </div>

          {/* Direita */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <SectionHeaderInline title="Equipe & acesso" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mono-muted)" }}>você</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={memberRow}>
                  <Avatar initials={user.initials} color={user.color} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{user.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mono-muted)" }}>@{user.handle}</div>
                  </div>
                  <span style={rolePill}>{user.role}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted-2)", marginTop: 2 }}>
                  Os colaboradores são gerenciados no Supabase (Authentication → Users).
                </span>
              </div>
            </Panel>

            <Panel>
              <SectionHeader title="Preferências" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Select label="Idioma da interface" value="pt-BR" onChange={() => {}} options={[{ id: "pt-BR", label: "🇧🇷 Português (BR)" }]} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Label>Tema</Label>
                  <Segmented value={theme} onChange={setTheme} options={[{ id: "dark", label: "Escuro" }, { id: "light", label: "Claro" }]} />
                </div>
                <Toggle on={notify} onChange={setNotify} label="Notificar quando renderizar" sublabel={notify ? "Ativado" : "Desativado"} />
              </div>
            </Panel>
          </div>
        </div>
      )}
    </Page>
  );
}

function KeyManager({ label, keys, onChange }: { label: string; keys: string[]; onChange: (keys: string[]) => void }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Label>{label}</Label>
      {keys.length === 0 && <span style={{ fontSize: 12, color: "var(--text-muted-2)" }}>Nenhuma chave configurada.</span>}
      {keys.map((k, i) => (
        <div key={i} style={keyRow}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-body)" }}>{mask(k)}</span>
          <button style={delBtn} title="Excluir" onClick={() => onChange(keys.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <input className="ac-focusable" style={{ ...input, height: 42 }} placeholder="Colar nova chave"
          value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onChange([...keys, val.trim()]); setVal(""); } }} />
        <button style={addBtn} onClick={() => { if (val.trim()) { onChange([...keys, val.trim()]); setVal(""); } }}>Adicionar</button>
      </div>
    </div>
  );
}

function mask(k: string): string {
  return k.length > 12 ? `${k.slice(0, 6)}…${k.slice(-4)}` : k;
}

function fmtSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

function SectionHeaderInline({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 18, borderRadius: 999, background: "var(--accent-gradient)" }} />
      <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{title}</h3>
    </div>
  );
}

const errorBox: CSSProperties = { margin: "0 0 18px", padding: "12px 16px", borderRadius: 12, background: "rgba(255,84,112,0.10)", border: "1px solid var(--error-border)", color: "var(--status-error-text)", fontSize: 13.5 };
const input: CSSProperties = { height: 46, borderRadius: 11, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: "0 14px", color: "var(--text-strong)", fontSize: 14, flex: 1 };
const saveBtn: CSSProperties = { height: 42, padding: "0 22px", borderRadius: 11, border: "none", background: "var(--accent-gradient)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, boxShadow: "var(--shadow-accent)" };
const keyRow: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", height: 42, borderRadius: 10, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: "0 12px" };
const delBtn: CSSProperties = { width: 26, height: 26, borderRadius: 8, border: "1px solid var(--error-border)", background: "rgba(255,84,112,0.10)", color: "var(--status-error-text)", fontSize: 12, lineHeight: 1 };
const addBtn: CSSProperties = { height: 42, padding: "0 16px", borderRadius: 10, border: "1px solid var(--accent-border)", background: "rgba(124,92,255,0.12)", color: "var(--text-purple-2)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" };
const uploadLabel: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 11, border: "1px dashed var(--accent-border)", background: "rgba(124,92,255,0.08)", color: "var(--text-purple)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginTop: 4 };
const memberRow: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 11, background: "var(--surface-input)", border: "1px solid var(--hairline)" };
const rolePill: CSSProperties = { padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--text-purple-2)", background: "rgba(124,92,255,0.14)", border: "1px solid var(--accent-border)" };
