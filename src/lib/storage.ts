import type { PrototypeState } from '../types';

export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch (err) {
    console.warn(`Error loading key "${key}" from localStorage:`, err);
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving key "${key}" to localStorage:`, err);
  }
}

export function removeLocal(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Error removing key "${key}" from localStorage:`, err);
  }
}

export function workspaceCacheKey(businessId: string): string {
  return `automanager.workspace-state.${businessId}`;
}

export function isPrototypeState(value: unknown): value is PrototypeState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.orders) &&
    Array.isArray(v.vehicles) &&
    Array.isArray(v.parts) &&
    Array.isArray(v.tools) &&
    Array.isArray(v.events)
  );
}
