import type { Member, VideoItem } from "../types";

// Time / roster (placeholder — trocar por dados reais do Supabase).
export const TEAM: Member[] = [
  { name: "Luan Marques", first: "Luan", handle: "luanmarques", initials: "LM", color: "#7C5CFF", role: "Admin" },
  { name: "Bia Andrade", first: "Bia", handle: "biacria", initials: "BA", color: "#FF2E93", role: "Editora" },
  { name: "Rafa Nunes", first: "Rafa", handle: "rafanunes", initials: "RN", color: "#21D4C4", role: "Editor" },
];

// Vídeos seed (placeholder — trocar por lista real da API).
export const VIDEOS: VideoItem[] = [
  { id: "v1", title: "5 hábitos de quem acorda às 5h", status: "done", duration: "0:34", handle: "rafanunes", age: "há 2h", hue: 270 },
  { id: "v2", title: "Receita fit de 30 segundos", status: "done", duration: "0:28", handle: "biacria", age: "há 5h", hue: 330 },
  { id: "v3", title: "POV: você descobriu juros compostos", status: "generating", duration: "0:41", handle: "cria.acelera", age: "agora", hue: 190 },
  { id: "v4", title: "3 apps que mudaram minha rotina", status: "done", duration: "0:36", handle: "luanmarques", age: "há 1d", hue: 250 },
  { id: "v5", title: "O segredo dos vídeos virais", status: "failed", duration: "0:22", handle: "rafanunes", age: "há 1d", hue: 12 },
  { id: "v6", title: "Como dobrar seu foco em 1 semana", status: "done", duration: "0:39", handle: "biacria", age: "há 2d", hue: 300 },
  { id: "v7", title: "Por que você procrastina (e a solução)", status: "generating", duration: "0:30", handle: "cria.acelera", age: "agora", hue: 210 },
  { id: "v8", title: "Mitos sobre dinheiro que te quebram", status: "done", duration: "0:44", handle: "luanmarques", age: "há 3d", hue: 285 },
];

export const SAMPLE_SCRIPT =
  "Você já se perguntou por que algumas pessoas fazem tudo antes das 9h? O segredo está em 5 hábitos. Primeiro: acordar no mesmo horário todo dia. Segundo: luz natural nos primeiros minutos. Terceiro: movimentar o corpo por 10 minutos. Quarto: anotar as 3 prioridades do dia. E quinto: nada de celular na primeira meia hora. Comece amanhã e sinta a diferença.";

export const SAMPLE_KEYWORDS = ["rotina matinal", "produtividade", "5 da manhã", "hábitos", "foco"];
