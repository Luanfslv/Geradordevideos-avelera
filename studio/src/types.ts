export type Screen = "login" | "app";
export type Tab = "gerar" | "videos" | "config";
export type Aspect = "9:16" | "16:9";
export type VideoStatus = "done" | "generating" | "failed";

export interface Member {
  name: string;
  first: string;
  handle: string; // sem @
  initials: string;
  color: string;
  role: string;
}

export interface VideoItem {
  id: string;
  title: string;
  status: VideoStatus;
  duration: string;
  handle: string;
  age: string;
  hue: number;
}

export interface GenStep {
  label: string;
  progress: number;
}
