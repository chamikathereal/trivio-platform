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
      className="relative flex items-center justify-center w-8 h-8 rounded-full border border-border/80 bg-secondary/40 hover:bg-secondary text-foreground backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm cursor-pointer select-none"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {/* Light mode icon */}
      <Sun className="h-3.5 w-3.5 block dark:hidden text-foreground transition-transform" />
      {/* Dark mode icon */}
      <Moon className="h-3.5 w-3.5 hidden dark:block text-foreground transition-transform" />
    </button>
  );
}
