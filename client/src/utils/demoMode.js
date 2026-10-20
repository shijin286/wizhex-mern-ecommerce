// Tracks whether the UI is currently showing the offline demo catalogue.
const listeners = new Set();
let active = false;

// On by default in development; set VITE_DEMO_FALLBACK=true/false to override.
export const DEMO_FALLBACK_ENABLED =
  import.meta.env.VITE_DEMO_FALLBACK !== undefined
    ? import.meta.env.VITE_DEMO_FALLBACK === 'true'
    : import.meta.env.DEV;

export function isDemoMode() {
  return active;
}

export function setDemoMode(value) {
  if (active === value) return;
  active = value;
  listeners.forEach((listener) => listener());
}

export function subscribeDemoMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
