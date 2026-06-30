interface LogoProps {
  size?: number;
  wordmark?: boolean;
  small?: boolean;
}

/** Marca do Acelera Studio: quadrado com gradiente + triângulo "play" em CSS. */
export default function Logo({ size = 42, wordmark = true, small = false }: LogoProps) {
  const radius = Math.round(size * 0.31);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: "var(--accent-gradient-135)",
          boxShadow: small ? "0 6px 18px rgba(124,92,255,0.45)" : "var(--shadow-logo)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "8px 0 8px 13px",
            borderColor: "transparent transparent transparent #fff",
            marginLeft: 3,
          }}
        />
      </div>
      {wordmark && (
        <div style={{ lineHeight: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: small ? 18 : 20,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Acelera<span style={{ color: "var(--accent-pink)" }}>.</span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: small ? 9 : 10,
              letterSpacing: "0.32em",
              color: "var(--text-mono-muted)",
              marginTop: 3,
            }}
          >
            STUDIO
          </div>
        </div>
      )}
    </div>
  );
}
