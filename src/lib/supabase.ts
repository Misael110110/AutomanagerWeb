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
    if (stored) {
      const sanitized = sanitizeSupabaseUrl(stored);
      if (!sanitized.startsWith('https://') || !sanitized.includes('.supabase.co')) {
        localStorage.removeItem(STORAGE_URL_KEY);
      } else {
        return sanitized;
      }
    }
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
    if (stored) {
      const sanitized = sanitizeSupabaseKey(stored);
      // Clean up if corrupted by masked bullets or invalid short key
      if (sanitized.includes('•') || sanitized.length < 20) {
        localStorage.removeItem(STORAGE_KEY_KEY);
      } else {
        return sanitized;
      }
    }
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

export function getSupabaseConfig(): {
  url: string;
  key: string;
  rawKey: string;
  isConfigured: boolean;
} {
  return {
    url: currentUrl,
    key: currentKey ? '••••••••' + currentKey.slice(-6) : '',
    rawKey: currentKey,
    isConfigured: isSupabaseConfigured,
  };
}

export function saveSupabaseConfig(url: string, key?: string): void {
  const cleanUrl = sanitizeSupabaseUrl(url);
  if (cleanUrl.startsWith('https://') && cleanUrl.includes('.supabase.co')) {
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
  }
  if (key) {
    const cleanKey = sanitizeSupabaseKey(key);
    // Never save masked keys or corrupted keys
    if (!cleanKey.includes('•') && cleanKey.length >= 20) {
      localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    }
  }
  window.location.reload();
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  window.location.reload();
}


