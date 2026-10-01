import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'automanager.supabase_url';
const STORAGE_KEY_KEY = 'automanager.supabase_key';

function getInitialUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_URL_KEY);
    if (stored) return stored.trim();
  }
  return (
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    (import.meta.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ||
    ''
  ).trim();
}

function getInitialKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_KEY);
    if (stored) return stored.trim();
  }
  return (
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    ''
  ).trim();
}

const currentUrl = getInitialUrl();
const currentKey = getInitialKey();

export const isSupabaseConfigured = Boolean(currentUrl && currentKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(currentUrl, currentKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  return {
    url: currentUrl,
    key: currentKey ? '••••••••' + currentKey.slice(-6) : '',
    isConfigured: isSupabaseConfigured,
  };
}

export function saveSupabaseConfig(url: string, key: string): void {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  window.location.reload();
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  window.location.reload();
}
