import { useState, type CSSProperties, type ReactNode } from "react";

export function Page({ children, maxWidth = 1340 }: { children: ReactNode; maxWidth?: number }) {
  return <div style={{ maxWidth, margin: "0 auto", padding: "32px 28px 64px" }}>{children}</div>;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 29, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>{title}</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "var(--text-muted)" }}>{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: "var(--surface-panel)", borderRadius: 18, border: "1px solid var(--hairline)", padding: 22, ...style }}>
      {children}
    </div>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ width: 4, height: 18, borderRadius: 999, background: "var(--accent-gradient)" }} />
      <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{title}</h3>
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>{children}</span>;
}

export function Segmented<T extends string>({
  options, value, onChange,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "var(--surface-input)", border: "1px solid var(--hairline)" }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 9, fontSize: 13.5, fontWeight: active ? 600 : 500,
              border: active ? "1px solid var(--accent-border-strong)" : "1px solid transparent",
              background: active ? "rgba(124,92,255,0.16)" : "transparent",
              color: active ? "#fff" : "var(--text-muted)", whiteSpace: "nowrap",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SelectRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Label>{label}</Label>
      <div style={{
        height: 46, borderRadius: 11, background: "var(--surface-input)", border: "1px solid var(--hairline-2)",
        padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-strong)", fontSize: 14,
      }}>
        <span>{value}</span>
        <span style={{ color: "var(--text-faint)" }}>▾</span>
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label, sublabel }: { on: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
      padding: "12px 14px", borderRadius: 11, background: "var(--surface-input)",
      border: "1px solid var(--hairline-2)", color: "var(--text-strong)",
    }}>
      <span style={{ textAlign: "left" }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{label}</span>
        {sublabel && <span style={{ display: "block", fontSize: 12, color: "var(--text-muted-2)", marginTop: 2 }}>{sublabel}</span>}
      </span>
      <span style={{
        width: 44, height: 26, borderRadius: 999, padding: 3, flex: "0 0 auto",
        background: on ? "var(--accent-gradient)" : "rgba(255,255,255,0.10)",
        display: "flex", justifyContent: on ? "flex-end" : "flex-start", transition: "background .15s",
      }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff" }} />
      </span>
    </button>
  );
}

export function Chip({ children, dashed = false }: { children: ReactNode; dashed?: boolean }) {
  return (
    <span style={{
      padding: "6px 12px", borderRadius: 999, fontSize: 12.5,
      background: dashed ? "transparent" : "rgba(124,92,255,0.12)",
      border: dashed ? "1px dashed var(--accent-border)" : "1px solid var(--accent-border)",
      color: "var(--text-purple-2)",
    }}>{children}</span>
  );
}

/** Dropdown real (select nativo estilizado). */
export function Select<T extends string>({
  label, value, onChange, options,
}: { label?: string; value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <Label>{label}</Label>}
      <select
        className="ac-focusable"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          height: 46, borderRadius: 11, background: "var(--surface-input)", border: "1px solid var(--hairline-2)",
          padding: "0 14px", color: "var(--text-strong)", fontSize: 14, appearance: "none",
          backgroundImage: "linear-gradient(45deg, transparent 50%, var(--text-faint) 50%), linear-gradient(135deg, var(--text-faint) 50%, transparent 50%)",
          backgroundPosition: "calc(100% - 18px) 19px, calc(100% - 13px) 19px",
          backgroundSize: "5px 5px, 5px 5px", backgroundRepeat: "no-repeat",
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} style={{ background: "#13131b", color: "#fff" }}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Slider com rótulo + valor. */
export function Slider({
  label, value, onChange, min, max, step = 0.1, format,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Label>{label}</Label>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-purple-2)" }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent-purple)" }}
      />
    </div>
  );
}

/** Linha com seletor de cor. */
export function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Label>{label}</Label>
      <input
        type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 46, height: 30, padding: 0, border: "1px solid var(--hairline-2)", borderRadius: 8, background: "none", cursor: "pointer" }}
      />
    </div>
  );
}

/** Seção colapsável (configurações avançadas). */
export function Expander({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "var(--surface-input)", border: "none", color: "var(--text-body)", fontSize: 13.5, fontWeight: 600 }}
      >
        {title}
        <span style={{ color: "var(--text-faint)", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
      </button>
      {open && <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>}
    </div>
  );
}
