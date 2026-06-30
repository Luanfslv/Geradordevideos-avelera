import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Member } from "../types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Login está configurado de verdade? Caso contrário, roda em modo demo. */
export const authConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;
if (authConfigured) {
  client = createClient(url as string, anon as string);
}

export interface SignInResult {
  ok: boolean;
  email?: string;
  error?: string;
}

/**
 * Autentica via Supabase. Em modo demo (sem env), aceita qualquer
 * usuário não-vazio — útil pra navegar a UI sem backend.
 */
export async function signIn(identifier: string, password: string): Promise<SignInResult> {
  const id = identifier.trim();
  if (!id) return { ok: false, error: "Digite seu usuário e senha para entrar." };

  if (!authConfigured || !client) {
    // Modo demo: entra direto.
    return { ok: true, email: id.includes("@") ? id : `${id}@acelera.local` };
  }

  const email = id.includes("@") ? id : `${id}@aceleravaquinha.com`;
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { ok: false, error: "Usuário ou senha incorretos." };
  }
  return { ok: true, email: data.user?.email ?? email };
}

export async function signOut(): Promise<void> {
  if (client) await client.auth.signOut();
}

/** Monta um Member a partir do email/handle digitado (fallback quando não está no time). */
export function memberFromIdentifier(identifier: string): Member {
  const base = identifier.split("@")[0] || "cria";
  const parts = base.replace(/[._-]+/g, " ").trim().split(" ");
  const first = cap(parts[0] || "Cria");
  const name = parts.map(cap).join(" ");
  const initials = (parts[0]?.[0] ?? "C").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
  return { name, first, handle: base, initials, color: "#7C5CFF", role: "Membro" };
}

function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
