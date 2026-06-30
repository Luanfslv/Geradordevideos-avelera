interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  ring?: boolean;
}

export default function Avatar({ initials, color, size = 40, ring = false }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: size * 0.36,
        color: "#fff",
        flex: "0 0 auto",
        boxShadow: ring ? "0 0 0 2px #fff" : "0 0 0 2px rgba(255,255,255,0.12)",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
