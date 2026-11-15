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
    <div className="relative rounded-lg border border-trivio-border bg-trivio-midnight/95 overflow-hidden shadow-xl font-mono text-xs">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-trivio-border/80 bg-trivio-navy/70 text-gray-400 text-[11px]">
          <span>{title}</span>
          <span className="uppercase text-[10px] text-trivio-cyan font-bold">{language}</span>
        </div>
      )}
      <button
        onClick={copyToClipboard}
        className="absolute right-3 top-3 p-1.5 rounded-md border border-trivio-border bg-trivio-navy/80 text-gray-300 hover:text-white hover:bg-trivio-subtle transition-colors"
        aria-label="Copy code to clipboard"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="p-4 overflow-x-auto text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
