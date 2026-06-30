import type { GenStep } from "../types";

// Passos da geração (espelham o protótipo). Em produção, substituir por
// progresso real do job/websocket vindo do backend FastAPI.
export const GEN_STEPS: GenStep[] = [
  { label: "Iniciando…", progress: 4 },
  { label: "Escrevendo roteiro com IA…", progress: 16 },
  { label: "Buscando vídeos no Pexels…", progress: 38 },
  { label: "Sintetizando narração (TTS)…", progress: 60 },
  { label: "Gerando legendas…", progress: 78 },
  { label: "Renderizando vídeo…", progress: 94 },
  { label: "Concluído!", progress: 100 },
];

/**
 * Executa o pipeline simulado, chamando onStep a cada passo.
 * Retorna uma função para cancelar.
 */
export function runPipeline(
  onStep: (step: GenStep) => void,
  onDone: () => void,
  stepMs = 850
): () => void {
  let i = 0;
  let timer: ReturnType<typeof setTimeout>;
  const tick = () => {
    if (i >= GEN_STEPS.length) {
      onDone();
      return;
    }
    onStep(GEN_STEPS[i]);
    i += 1;
    timer = setTimeout(tick, stepMs);
  };
  tick();
  return () => clearTimeout(timer);
}
