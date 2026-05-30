"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "تفعيل الوضع الصباحي" : "تفعيل الوضع الليلي"}
      className="w-9 h-9 rounded-lg border border-border-soft bg-bg-card text-text-secondary hover:text-gold-bright hover:border-border-strong transition-colors flex items-center justify-center"
    >
      {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
    </button>
  );
}
