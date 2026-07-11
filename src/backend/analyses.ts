import { supabase } from "./supabaseClient";

// A saved analysis row. Mirrors the analyses table defined in supabase/schema.sql.
export interface AnalysisRecord {
  id: string;
  user_id: string;
  live: number;
  dead: number;
  viability: number;
  concentration: number;
  dilution_factor: number;
  squares_counted: number;
  note: string | null;
  created_at: string;
}

export interface AnalysisInput {
  live: number;
  dead: number;
  viability: number;
  concentration: number;
  dilution_factor: number;
  squares_counted: number;
  note?: string;
}

export async function saveAnalysis(
  input: AnalysisInput
): Promise<{ data: AnalysisRecord | null; error: string | null }> {
  if (!supabase) return { data: null, error: "Supabase is not configured yet." };

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { data: null, error: "You need to sign in to save an analysis." };

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userId,
      live: input.live,
      dead: input.dead,
      viability: input.viability,
      concentration: input.concentration,
      dilution_factor: input.dilution_factor,
      squares_counted: input.squares_counted,
      note: input.note ?? null,
    })
    .select()
    .single();

  return { data: (data as AnalysisRecord) ?? null, error: error?.message ?? null };
}

export async function listAnalyses(): Promise<{
  data: AnalysisRecord[];
  error: string | null;
}> {
  if (!supabase) return { data: [], error: "Supabase is not configured yet." };

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as AnalysisRecord[]) ?? [], error: error?.message ?? null };
}

export async function deleteAnalysis(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured yet." };
  const { error } = await supabase.from("analyses").delete().eq("id", id);
  return { error: error?.message ?? null };
}
