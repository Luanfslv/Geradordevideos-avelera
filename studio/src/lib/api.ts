// Cliente da API real (FastAPI do MoneyPrinterTurbo). Rotas sob /api/v1.
// Em dev, o Vite faz proxy de /api para o backend; em produção, mesma origem.
import { getAccessToken } from "./supabase";

const API_BASE = "/api/v1";

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  let json: { status?: number; data?: T; message?: string } = {};
  try {
    json = await res.json();
  } catch {
    /* resposta sem corpo */
  }
  if (!res.ok || (typeof json.status === "number" && json.status >= 400)) {
    throw new Error(json.message || `Erro ${res.status}`);
  }
  return (json.data ?? (json as unknown)) as T;
}

// ── Roteiro & palavras-chave ──────────────────────────────────────────────
export async function generateScript(p: {
  subject: string;
  language?: string;
  paragraphs?: number;
}): Promise<string> {
  const data = await req<{ video_script: string }>("/scripts", {
    method: "POST",
    body: JSON.stringify({
      video_subject: p.subject,
      video_language: p.language ?? "pt-BR",
      paragraph_number: p.paragraphs ?? 1,
    }),
  });
  return data.video_script;
}

export async function generateTerms(p: {
  subject: string;
  script: string;
  amount?: number;
}): Promise<string[]> {
  const data = await req<{ video_terms: string[] }>("/terms", {
    method: "POST",
    body: JSON.stringify({
      video_subject: p.subject,
      video_script: p.script,
      amount: p.amount ?? 5,
      match_materials_to_script: false,
    }),
  });
  return data.video_terms ?? [];
}

// ── Criação do vídeo ──────────────────────────────────────────────────────
export interface CreateVideoParams {
  subject: string;
  script: string;
  terms: string[];
  // vídeo
  source: string;            // pexels | pixabay | local
  aspect: "9:16" | "16:9";
  concatMode: string;        // random | sequential
  transition: string;        // "" | Shuffle | FadeIn | FadeOut | SlideIn | SlideOut
  clipDuration: number;
  videoCount: number;
  // áudio
  voiceName: string;
  voiceVolume: number;
  voiceRate: number;
  bgmType: string;           // random | "" (nenhuma)
  bgmVolume: number;
  // legendas
  subtitlesOn: boolean;
  fontName: string;
  subtitlePosition: string;  // top | center | bottom
  textColor: string;
  fontSize: number;
  strokeColor: string;
  strokeWidth: number;
  subtitleBg: boolean;
  language?: string;
}

export async function createVideo(p: CreateVideoParams): Promise<string> {
  const data = await req<{ task_id: string }>("/videos", {
    method: "POST",
    body: JSON.stringify({
      video_subject: p.subject,
      video_script: p.script,
      video_terms: p.terms.join(", "),
      video_source: p.source,
      video_aspect: p.aspect,
      video_concat_mode: p.concatMode,
      video_transition_mode: p.transition || null,
      video_clip_duration: p.clipDuration,
      video_count: p.videoCount,
      video_language: p.language ?? "pt-BR",
      voice_name: p.voiceName,
      voice_volume: p.voiceVolume,
      voice_rate: p.voiceRate,
      bgm_type: p.bgmType,
      bgm_volume: p.bgmVolume,
      subtitle_enabled: p.subtitlesOn,
      font_name: p.fontName,
      subtitle_position: p.subtitlePosition,
      text_fore_color: p.textColor,
      font_size: p.fontSize,
      stroke_color: p.strokeColor,
      stroke_width: p.strokeWidth,
      text_background_color: p.subtitleBg,
    }),
  });
  return data.task_id;
}

// ── Status / progresso ────────────────────────────────────────────────────
export const TASK_STATE = { FAILED: -1, COMPLETE: 1, PROCESSING: 4 } as const;

export interface TaskStatus {
  state: number;
  progress: number;
  videos: string[];
  combinedVideos: string[];
}

export async function getTask(taskId: string): Promise<TaskStatus> {
  const data = await req<{
    state?: number;
    progress?: number;
    videos?: string[];
    combined_videos?: string[];
  }>(`/tasks/${taskId}`, { method: "GET" });
  return {
    state: data.state ?? TASK_STATE.PROCESSING,
    progress: data.progress ?? 0,
    videos: data.videos ?? [],
    combinedVideos: data.combined_videos ?? [],
  };
}

/** Faz polling do progresso até concluir/falhar. */
export function pollTask(
  taskId: string,
  onProgress: (progress: number, state: number) => void,
  intervalMs = 2500
): { promise: Promise<TaskStatus>; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout>;
  let cancelled = false;
  const promise = new Promise<TaskStatus>((resolve, reject) => {
    const tick = async () => {
      if (cancelled) return;
      try {
        const t = await getTask(taskId);
        onProgress(t.progress, t.state);
        if (t.state === TASK_STATE.COMPLETE) return resolve(t);
        if (t.state === TASK_STATE.FAILED) return reject(new Error("A geração falhou."));
        timer = setTimeout(tick, intervalMs);
      } catch (e) {
        reject(e);
      }
    };
    void tick();
  });
  return { promise, cancel: () => { cancelled = true; clearTimeout(timer); } };
}

/** Rótulo amigável derivado do progresso (o backend só dá %). */
export function progressLabel(progress: number): string {
  if (progress <= 0) return "Iniciando…";
  if (progress < 20) return "Escrevendo roteiro…";
  if (progress < 45) return "Buscando vídeos…";
  if (progress < 65) return "Sintetizando narração…";
  if (progress < 85) return "Gerando legendas…";
  if (progress < 100) return "Renderizando vídeo…";
  return "Concluído!";
}

/** Melhor URL de download de um vídeo finalizado. */
export function bestVideoUrl(t: TaskStatus): string | null {
  return t.videos[0] ?? t.combinedVideos[0] ?? null;
}

// ── Lista de tarefas (Meus vídeos) ────────────────────────────────────────
export interface ApiTask {
  task_id?: string;
  state?: number;
  progress?: number;
  videos?: string[];
  combined_videos?: string[];
  params?: { video_subject?: string };
}

export async function listTasks(): Promise<ApiTask[]> {
  const data = await req<{ tasks: ApiTask[] }>("/tasks?page=1&page_size=50", {
    method: "GET",
  });
  return data.tasks ?? [];
}

// ── Configuração gerenciada (chaves de API + provedor de IA) ──────────────
export interface ManagedConfig {
  llm_provider: string;
  gemini_api_key: string;
  openai_api_key: string;
  pexels_api_keys: string[];
  pixabay_api_keys: string[];
  coverr_api_keys: string[];
}

export async function getConfig(): Promise<ManagedConfig> {
  return req<ManagedConfig>("/config", { method: "GET" });
}

export async function updateConfig(patch: Partial<ManagedConfig>): Promise<void> {
  await req<{ saved: boolean }>("/config", { method: "POST", body: JSON.stringify(patch) });
}
