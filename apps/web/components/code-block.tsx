"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "typescript", title }: CodeBlockProps) {
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

  return (
    <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden shadow-sm font-mono text-xs transition-all">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/80 bg-secondary/40 text-muted-foreground text-[11px]">
          <span className="font-sans font-medium text-foreground">{title}</span>
          <span className="uppercase text-[10px] font-semibold text-foreground/80 bg-foreground/10 px-2 py-0.5 rounded-full tracking-wider">
            {language}
          </span>
        </div>
      )}
      <button
        onClick={copyToClipboard}
        className="absolute right-3.5 top-3.5 p-1.5 rounded-full border border-border bg-background/80 hover:bg-secondary text-foreground transition-all shadow-sm active:scale-95"
        aria-label="Copy code to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />}
      </button>
      <pre className="p-5 overflow-x-auto text-foreground/90 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
