import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// CellDrop treats Supabase as optional.
// The analyzer works fully client side; Supabase only powers auth and saved history.
// When the two env values are missing, the app still runs and simply hides those features.

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
