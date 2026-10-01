import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const envUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined);

const envKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined);

export const isSupabaseConfigured = Boolean(envUrl && envKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(envUrl!, envKey!, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
