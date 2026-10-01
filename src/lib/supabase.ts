import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'automanager.supabase_url';
const STORAGE_KEY_KEY = 'automanager.supabase_key';

export function sanitizeSupabaseUrl(raw: string): string {
  let val = raw.trim();
  if (val.includes('=')) {
    val = val.split('=').pop() || '';
  }
  return val.replace(/^["']|["']$/g, '').trim();
}

export function sanitizeSupabaseKey(raw: string): string {
  let val = raw.trim();
  if (val.includes('=')) {
    val = val.split('=').pop() || '';
  }
  return val.replace(/^["']|["']$/g, '').trim();
}

function getInitialUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_URL_KEY);
    if (stored) return sanitizeSupabaseUrl(stored);
  }
  return sanitizeSupabaseUrl(
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
    (import.meta.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ||
    ''
  );
}

function getInitialKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_KEY);
    if (stored) return sanitizeSupabaseKey(stored);
  }
  return sanitizeSupabaseKey(
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
    (import.meta.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    ''
  );
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
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(key);
  localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
  localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
  window.location.reload();
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  window.location.reload();
}

