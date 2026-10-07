"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { composeMarkdown, computeStats, describeOutput, isEmptyComposition } from "@/lib/markdown";
import { getTool } from "@/lib/tools";
import { cn } from "@/lib/cn";
import {
  CodeIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  LinkIcon,
} from "@/components/icons";
import type { BuilderConfig } from "@/lib/types";

interface PreviewProps {
  config: BuilderConfig;
  onCopy: (text: string) => Promise<boolean>;
  onDownload: () => void;
  onShare: () => Promise<boolean>;
}

type ViewMode = "rendered" | "source";

export default function Preview({ config, onCopy, onDownload, onShare }: PreviewProps) {
  const [mode, setMode] = useState<ViewMode>("rendered");
  const [copied, setCopied] = useState<"none" | "copy" | "link">("none");

  const tool = getTool(config.tool);
  const output = describeOutput(config);
  const markdown = composeMarkdown(config);
  const stats = computeStats(markdown);
  const empty = isEmptyComposition(config);

  const handleCopy = async () => {
    const ok = await onCopy(markdown);
    if (ok) {
      setCopied("copy");
      window.setTimeout(() => setCopied("none"), 1500);
    }
  };

  const handleShare = async () => {
    const ok = await onShare();
    if (ok) {
      setCopied("link");
      window.setTimeout(() => setCopied("none"), 1500);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm" aria-label="Preview and export">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-surface-muted/60 px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-mono text-xs font-medium text-foreground">{output.path}</span>
          <span className="text-[11px] text-muted-fg">
            {stats.chars.toLocaleString()} chars · {stats.words.toLocaleString()} words · ≈
            {stats.roughTokens.toLocaleString()} tokens
          </span>
        </div>
        <div
          className="flex rounded-lg border border-border bg-background p-0.5"
          role="group"
          aria-label="Preview mode"
        >
          <button
            type="button"
            onClick={() => setMode("rendered")}
            aria-pressed={mode === "rendered"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mode === "rendered" ? "bg-accent text-accent-foreground" : "text-muted-fg hover:text-foreground",
            )}
          >
            <EyeIcon className="size-3.5" aria-hidden />
            Rendered
          </button>
          <button
            type="button"
            onClick={() => setMode("source")}
            aria-pressed={mode === "source"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mode === "source" ? "bg-accent text-accent-foreground" : "text-muted-fg hover:text-foreground",
            )}
          >
            <CodeIcon className="size-3.5" aria-hidden />
            Source
          </button>
        </div>
      </header>

      <div className="max-h-[26rem] overflow-y-auto px-4 py-4 lg:max-h-[calc(100dvh-14rem)]">
        <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-fg">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">{tool.label}</kbd>
          <span>{output.formatLabel}</span>
        </div>

        {empty ? (
          <p className="py-10 text-center text-sm text-muted-fg">
            Nothing to render yet — toggle rule sets on the left or write custom rules.
          </p>
        ) : mode === "source" ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-foreground">
            {markdown}
          </pre>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-code:font-mono prose-code:text-[.9em] prose-pre:bg-background prose-pre:border prose-pre:border-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap gap-2 border-t border-border bg-surface-muted/60 px-4 py-3">
        <ActionButton
          onClick={handleCopy}
          icon={copied === "copy" ? <CheckIcon className="size-4 text-emerald-500" aria-hidden /> : <CopyIcon className="size-4" aria-hidden />}
          label={copied === "copy" ? "Copied!" : "Copy to clipboard"}
          primary
        />
        <ActionButton onClick={onDownload} icon={<DownloadIcon className="size-4" aria-hidden />} label="Download file" />
        <ActionButton
          onClick={handleShare}
          icon={copied === "link" ? <CheckIcon className="size-4 text-emerald-500" aria-hidden /> : <LinkIcon className="size-4" aria-hidden />}
          label={copied === "link" ? "Link copied!" : "Share link"}
        />
      </footer>
    </section>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  primary = false,
}: {
  onClick: () => void | Promise<void>;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        primary
          ? "bg-accent text-accent-foreground hover:bg-accent-strong"
          : "border border-border bg-background text-foreground hover:border-accent/60",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
