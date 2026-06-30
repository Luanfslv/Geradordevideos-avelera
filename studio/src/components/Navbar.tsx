import type { CSSProperties } from "react";
import Logo from "./Logo";
import Avatar from "./Avatar";
import type { Member, Tab } from "../types";

interface NavbarProps {
  user: Member;
  tab: Tab;
  onTab: (t: Tab) => void;
  onLogout: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "gerar", label: "Gerar" },
  { id: "videos", label: "Meus vídeos" },
  { id: "config", label: "Configurações" },
];

export default function Navbar({ user, tab, onTab, onLogout }: NavbarProps) {
  return (
    <nav style={bar}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 0 }}>
        <Logo size={34} small />
        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                style={{
                  ...tabBtn,
                  background: active ? "rgba(124,92,255,0.16)" : "transparent",
                  border: active ? "1px solid var(--accent-border-strong)" : "1px solid transparent",
                  color: active ? "#fff" : "var(--text-muted)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={queuePill}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--status-lime)", animation: "acTick 1.8s ease-in-out infinite" }} />
          3 na fila
        </div>
        <div style={userChip}>
          <Avatar initials={user.initials} color={user.color} size={36} />
          <div style={{ lineHeight: 1.2, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-strong)" }}>{user.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-mono-muted)" }}>{user.role}</div>
          </div>
        </div>
        <button onClick={onLogout} style={logoutBtn} title="Sair">
          <span style={doorGlyph} />
          Sair
        </button>
      </div>
    </nav>
  );
}

const bar: CSSProperties = {
  position: "sticky", top: 0, zIndex: 50, height: 62,
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 24px", background: "rgba(10,10,15,0.82)", backdropFilter: "blur(16px)",
  borderBottom: "1px solid var(--hairline)",
};
const tabBtn: CSSProperties = {
  padding: "8px 14px", borderRadius: 10, fontSize: 14, whiteSpace: "nowrap",
  background: "transparent", transition: "background .12s, color .12s",
};
const queuePill: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999,
  background: "var(--surface-panel-alt)", border: "1px solid var(--hairline-2)",
  fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-body)",
};
const userChip: CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, padding: "5px 12px 5px 5px",
  borderRadius: 999, background: "var(--surface-panel-alt)", border: "1px solid var(--hairline-2)",
};
const logoutBtn: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 11,
  background: "rgba(255,84,112,0.10)", border: "1px solid var(--error-border)",
  color: "var(--status-error-text)", fontWeight: 600, fontSize: 13.5,
};
const doorGlyph: CSSProperties = {
  width: 12, height: 12, borderRadius: 2,
  borderLeft: "2px solid var(--status-error-text)", borderTop: "2px solid var(--status-error-text)",
  borderBottom: "2px solid var(--status-error-text)",
};
