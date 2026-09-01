export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "csai_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function applyTheme(mode?: ThemeMode, persist = true) {
  if (typeof window === "undefined") return;
  const next = mode ?? getStoredTheme();
  if (persist) localStorage.setItem(THEME_KEY, next);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = next === "dark" || (next === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}
