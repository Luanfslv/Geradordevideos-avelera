import { useState, type CSSProperties, type ReactNode } from "react";
import { Page, PageHeader, Panel, SectionHeader, Label, SelectRow, Toggle, Segmented } from "../components/ui";
import Avatar from "../components/Avatar";
import { TEAM } from "../data/seed";

export default function Configuracoes() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notify, setNotify] = useState(true);

  return (
    <Page maxWidth={1180}>
      <PageHeader title="Configurações" subtitle="Chaves de API, narração e quem tem acesso ao estúdio." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 18, alignItems: "start" }}>
        {/* Coluna esquerda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel>
            <SectionHeader title="Inteligência artificial (roteiro)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SelectRow label="Provedor" value={<span>Google Gemini <Tag>GRÁTIS</Tag></span>} />
              <KeyRow label="Chave da API" masked="••••••••••••••••a91f" status="conectada" />
              <SelectRow label="Modelo" value="gemini-1.5-flash" />
            </div>
          </Panel>
          <Panel>
            <SectionHeader title="Fontes de vídeo" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <KeyRow label="Pexels" masked="••••••••••••3f7c" status="conectada" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Label>Pixabay</Label>
                <button style={addRow}>+ adicionar chave</button>
              </div>
            </div>
          </Panel>
          <Panel>
            <SectionHeader title="Narração (TTS)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SelectRow label="Provedor" value={<span>Microsoft edge-tts <Tag>GRÁTIS · SEM CHAVE</Tag></span>} />
              <SelectRow label="Voz padrão" value="🇧🇷 Antônio · masculina" />
            </div>
          </Panel>
        </div>

        {/* Coluna direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <SectionHeaderInline title="Equipe & acesso" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mono-muted)" }}>{TEAM.length} membros</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TEAM.map((m) => (
                <div key={m.handle} style={memberRow}>
                  <Avatar initials={m.initials} color={m.color} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{m.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-mono-muted)" }}>@{m.handle}</div>
                  </div>
                  <span style={rolePill}>{m.role}</span>
                </div>
              ))}
              <button style={inviteBtn}>+ Convidar colaborador</button>
            </div>
          </Panel>
          <Panel>
            <SectionHeader title="Preferências" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SelectRow label="Idioma da interface" value="🇧🇷 Português (BR)" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Label>Tema</Label>
                <Segmented value={theme} onChange={setTheme} options={[{ id: "dark", label: "Escuro" }, { id: "light", label: "Claro" }]} />
              </div>
              <Toggle on={notify} onChange={setNotify} label="Notificar quando renderizar" sublabel={notify ? "Ativado" : "Desativado"} />
            </div>
          </Panel>
        </div>
      </div>
    </Page>
  );
}

function SectionHeaderInline({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 18, borderRadius: 999, background: "var(--accent-gradient)" }} />
      <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{title}</h3>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.08em", color: "var(--status-success)", border: "1px solid rgba(33,212,196,0.3)", borderRadius: 999, padding: "2px 7px", marginLeft: 8 }}>{children}</span>;
}

function KeyRow({ label, masked, status }: { label: string; masked: string; status: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Label>{label}</Label>
      <div style={{ height: 46, borderRadius: 11, background: "var(--surface-input)", border: "1px solid var(--hairline-2)", padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-body)" }}>{masked}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--status-success)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--status-success)" }} />{status}
        </span>
      </div>
    </div>
  );
}

const addRow: CSSProperties = { height: 46, borderRadius: 11, background: "transparent", border: "1px dashed var(--accent-border)", color: "var(--text-purple)", fontSize: 13.5, fontWeight: 600 };
const memberRow: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 11, background: "var(--surface-input)", border: "1px solid var(--hairline)" };
const rolePill: CSSProperties = { padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--text-purple-2)", background: "rgba(124,92,255,0.14)", border: "1px solid var(--accent-border)" };
const inviteBtn: CSSProperties = { height: 50, borderRadius: 12, background: "transparent", border: "1px dashed var(--accent-border)", color: "var(--text-purple)", fontSize: 14, fontWeight: 600, marginTop: 4 };
