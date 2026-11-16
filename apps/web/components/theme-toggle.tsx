"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const nextTheme = isCurrentlyDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-full border border-white/35 dark:border-white/15 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-foreground backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm cursor-pointer select-none"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {/* Light mode icon (shown when light theme is active) */}
      <Sun className="h-4 w-4 block dark:hidden text-foreground transition-transform" />
      {/* Dark mode icon (shown when dark theme is active) */}
      <Moon className="h-4 w-4 hidden dark:block text-foreground transition-transform" />
    </button>
  );
}
