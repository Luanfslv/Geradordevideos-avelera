import { useState, type CSSProperties, type FormEvent } from "react";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { TEAM } from "../data/seed";
import { signIn, authConfigured, memberFromIdentifier } from "../lib/supabase";
import type { Member } from "../types";

interface LoginProps {
  onLogin: (member: Member) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Digite seu usuário e senha para entrar.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await signIn(username, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Não foi possível entrar.");
      return;
    }
    const handle = username.trim().replace(/^@/, "").split("@")[0];
    const member = TEAM.find((m) => m.handle === handle) ?? memberFromIdentifier(username);
    onLogin(member);
  }

  function pickTeam(i: number) {
    setSelected(i);
    setUsername(TEAM[i].handle);
  }

  return (
    <div style={wrap}>
      {/* ── Painel esquerdo (brand) ── */}
      <div style={leftPanel}>
        <div style={grid} />
        <div style={{ ...blob, top: -80, left: -60, background: "#FF2E93", animation: "acFloat 18s ease-in-out infinite" }} />
        <div style={{ ...blob, bottom: -90, left: 120, background: "#7C5CFF", animation: "acFloat2 20s ease-in-out infinite" }} />
        <div style={leftContent}>
          <Logo size={42} />
          <div style={eyebrowPill}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--status-lime)" }} />
            GERADOR DE VÍDEOS EM MASSA
          </div>
          <h1 style={h1}>
            Um tema vira{" "}
            <span className="ac-gradient-text">dezenas de vídeos</span> prontos pra postar.
          </h1>
          <p style={leftSub}>
            Roteiro com IA, narração, legendas e cortes — tudo automático, do briefing ao TikTok.
            Aqueça suas contas no piloto automático.
          </p>
          <div style={statsRow}>
            <Stat n="12.4K" l="vídeos gerados" />
            <Stat n="6" l="contas aquecendo" />
            <Stat n="~90s" l="por vídeo" />
          </div>
          <div style={liveCard}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 8, height: 8, borderRadius: "50%", background: "var(--status-lime)",
                    animation: `acTick ${1.6 + i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-body)" }}>
              3 vídeos renderizando agora
            </span>
          </div>
        </div>
      </div>

      {/* ── Painel direito (form) ── */}
      <div style={rightPanel}>
        <form style={formBox} onSubmit={submit}>
          <h2 style={h2}>Entrar na sua conta</h2>
          <p style={rightSub}>Acesse o estúdio e continue aquecendo suas contas.</p>

          <Field label="Usuário">
            <input
              className="ac-focusable"
              style={input}
              placeholder="seu.usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Senha">
            <input
              className="ac-focusable"
              style={input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <div style={rememberRow}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-muted)", fontSize: 13.5 }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: "var(--accent-purple)" }} />
              Lembrar de mim
            </label>
            <a href="#" onClick={(e) => e.preventDefault()}>Esqueceu a senha?</a>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <button type="submit" style={primaryBtn} disabled={loading}>
            {loading ? "Entrando…" : "Entrar no estúdio"}
          </button>

          <div style={divider}>
            <span style={dividerLine} />
            <span className="ac-eyebrow">OU ENTRE COMO</span>
            <span style={dividerLine} />
          </div>

          <div style={teamRow}>
            {TEAM.map((m, i) => (
              <button type="button" key={m.handle} onClick={() => pickTeam(i)} style={teamBtn}>
                <Avatar initials={m.initials} color={m.color} size={44} ring={selected === i} />
                <span style={{ fontSize: 12.5, color: "var(--text-body)" }}>{m.first}</span>
              </button>
            ))}
          </div>

          <p style={footer}>
            Não tem acesso? <a href="#" onClick={(e) => e.preventDefault()}>Fale com o admin</a>
            {!authConfigured && <span style={demoTag}>modo demo</span>}
          </p>
        </form>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text-primary)" }}>{n}</div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted-2)" }}>{l}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
      {children}
    </div>
  );
}

/* estilos */
const wrap: CSSProperties = { display: "flex", minHeight: "100vh", background: "var(--bg-root)", flexWrap: "wrap" };
const leftPanel: CSSProperties = {
  flex: "1 1 480px", minWidth: 0, position: "relative", overflow: "hidden",
  background: "radial-gradient(130% 120% at 0% 0%, #2A1147 0%, #170B28 44%, #0C0C11 100%)",
};
const grid: CSSProperties = {
  position: "absolute", inset: 0,
  backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "46px 46px",
  maskImage: "radial-gradient(80% 80% at 20% 10%, #000 0%, transparent 75%)",
  WebkitMaskImage: "radial-gradient(80% 80% at 20% 10%, #000 0%, transparent 75%)",
};
const blob: CSSProperties = { position: "absolute", width: 360, height: 360, borderRadius: "50%", filter: "blur(70px)", opacity: 0.5 };
const leftContent: CSSProperties = { position: "relative", padding: "56px 60px", display: "flex", flexDirection: "column", gap: 26, maxWidth: 600 };
const eyebrowPill: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
  padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--hairline-2)", fontFamily: "var(--font-mono)", fontSize: 10.5,
  letterSpacing: "0.18em", color: "var(--text-body)",
};
const h1: CSSProperties = { margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--text-primary)" };
const leftSub: CSSProperties = { margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 440 };
const statsRow: CSSProperties = { display: "flex", gap: 40, marginTop: 4 };
const liveCard: CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, alignSelf: "flex-start",
  padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--hairline-2)", backdropFilter: "blur(8px)",
};
const rightPanel: CSSProperties = { flex: "0 0 480px", background: "var(--bg-root)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 };
const formBox: CSSProperties = { width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 };
const h2: CSSProperties = { margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)" };
const rightSub: CSSProperties = { margin: "0 0 6px", fontSize: 14.5, color: "var(--text-muted)" };
const input: CSSProperties = {
  height: 50, borderRadius: 13, background: "var(--surface-panel-alt)", border: "1px solid var(--hairline-2)",
  padding: "0 16px", color: "var(--text-strong)", fontSize: 15, transition: "border-color .15s, box-shadow .15s",
};
const rememberRow: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 };
const errorBox: CSSProperties = {
  padding: "10px 14px", borderRadius: 11, background: "rgba(255,84,112,0.10)",
  border: "1px solid var(--error-border)", color: "var(--status-error-text)", fontSize: 13.5,
};
const primaryBtn: CSSProperties = {
  height: 52, borderRadius: 13, border: "none", background: "var(--accent-gradient)",
  color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
  boxShadow: "var(--shadow-accent)", marginTop: 4,
};
const divider: CSSProperties = { display: "flex", alignItems: "center", gap: 14, margin: "8px 0" };
const dividerLine: CSSProperties = { flex: 1, height: 1, background: "var(--hairline-2)" };
const teamRow: CSSProperties = { display: "flex", gap: 14, justifyContent: "center" };
const teamBtn: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", padding: 4 };
const footer: CSSProperties = { textAlign: "center", fontSize: 13, color: "var(--text-muted-2)", marginTop: 6, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" };
const demoTag: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--status-warning)", border: "1px solid rgba(255,178,62,0.3)", borderRadius: 999, padding: "2px 7px" };
