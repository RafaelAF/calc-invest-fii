"use client";

import { useTheme } from "@/lib/theme-context";

export default function ToggleDarkMode() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative h-7 w-12 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 transition-colors duration-200"
      aria-label="Alternar tema"
    >
      <div
        className={`absolute inset-0 flex items-center px-0.5 transition-all duration-200 ${theme === "dark" ? "justify-end" : "justify-start"
          }`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-950 shadow-sm">
          {theme === "dark" ? (
            <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm9-9a1 1 0 010 2h-1a1 1 0 110-2h1zM4 12a1 1 0 010 2H3a1 1 0 110-2h1zm13.07-6.07a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM7.05 14.95a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}
