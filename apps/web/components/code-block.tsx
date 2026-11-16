"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({ code, language = "typescript", title, className, maxHeight }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const lines = code.trim().split("\n");

  // Lightweight syntax highlighter for authentic terminal display
  const renderHighlightedLine = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//")) {
      return <span className="text-muted-foreground/60 italic">{line}</span>;
    }

    // Split on comment part if line has inline comment
    const commentIndex = line.indexOf("//");
    let codePart = line;
    let commentPart = "";
    if (commentIndex !== -1) {
      codePart = line.slice(0, commentIndex);
      commentPart = line.slice(commentIndex);
    }

    // Tokenize strings, keywords, numbers in codePart
    const tokens = codePart.split(/(".*?"|'.*?'|\b(?:import|from|const|let|var|function|return|export|default|new|typeof|interface|type)\b|\b\d+n?\b)/g);

    return (
      <>
        {tokens.map((token, i) => {
          if (!token) return null;
          if (token.startsWith('"') || token.startsWith("'")) {
            return (
              <span key={i} className="text-foreground/90 font-medium">
                {token}
              </span>
            );
          }
          if (
            /^(import|from|const|let|var|function|return|export|default|new|typeof|interface|type)$/.test(
              token
            )
          ) {
            return (
              <span key={i} className="font-semibold text-foreground">
                {token}
              </span>
            );
          }
          if (/^\d+n?$/.test(token)) {
            return (
              <span key={i} className="font-semibold text-foreground/95">
                {token}
              </span>
            );
          }
          return <span key={i} className="text-foreground/80">{token}</span>;
        })}
        {commentPart && (
          <span className="text-muted-foreground/60 italic">{commentPart}</span>
        )}
      </>
    );
  };

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#090a0c] overflow-hidden shadow-2xl font-mono text-xs transition-all duration-300",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {/* 1. Authentic macOS / Linux Terminal Window Titlebar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/90 dark:bg-[#121316] select-none">
        {/* Left: macOS Traffic Light Window Controls */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 inline-block shadow-sm" />
        </div>

        {/* Center: Terminal Shell Session / File Name */}
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-foreground/80 truncate max-w-[200px] sm:max-w-md">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{title || "trivio-console.ts — zsh"}</span>
        </div>

        {/* Right: Language Indicator + Non-Overlapping Copy Button */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 text-muted-foreground shadow-sm">
            {language}
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-foreground transition-all active:scale-95 shadow-sm"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Terminal Editor Body with Line Numbers & Vertical Scrollbar */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-4 sm:p-5 font-mono text-xs leading-relaxed selection:bg-foreground selection:text-background terminal-scroll">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-foreground/[0.04] transition-colors rounded">
                <td className="w-9 select-none text-right pr-4 text-muted-foreground/35 font-mono text-[11px] align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono align-top">
                  {renderHighlightedLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Authentic Terminal Bottom Status Bar (tmux / vim style) */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-[#0f1012] text-[10px] font-mono text-muted-foreground select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Ready</span>
          </span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline capitalize">{language}</span>
          <span>Ln {lines.length}, Col 1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foreground/70 font-semibold">Zero-Float Invariant</span>
        </div>
      </div>
    </div>
  );
}
