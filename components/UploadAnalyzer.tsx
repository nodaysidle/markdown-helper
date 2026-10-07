"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { getRuleSet } from "@/lib/catalog";
import { FileIcon, UploadIcon, XIcon } from "@/components/icons";
import type { FileAnalysis, Suggestion } from "@/lib/types";

interface UploadedFileProps {
  analyses: FileAnalysis[];
  suggestions: Suggestion[];
  selectedIds: string[];
  dismissedIds: string[];
  onFiles: (files: File[]) => void;
  onRemoveFile: (fileName: string) => void;
  onAcceptSuggestion: (ruleSetId: string) => void;
  onDismissSuggestion: (ruleSetId: string) => void;
}

export default function UploadAnalyzer({
  analyses,
  suggestions,
  selectedIds,
  dismissedIds,
  onFiles,
  onRemoveFile,
  onAcceptSuggestion,
  onDismissSuggestion,
}: UploadedFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pending = suggestions.filter(
    (s) => !selectedIds.includes(s.ruleSetId) && !dismissedIds.includes(s.ruleSetId),
  );

  const detected = Array.from(new Set(analyses.filter((a) => !a.error).flatMap((a) => a.dependencies)));

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-label="Project file analysis">
      <h2 className="text-sm font-semibold text-foreground">Analyze your project</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-fg">
        Drop <code className="font-mono">package.json</code> or{" "}
        <code className="font-mono">requirements.txt</code> — parsing happens in your browser, files never
        leave your machine.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "mt-3 flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
          dragging
            ? "border-accent bg-accent/10"
            : "border-border bg-background hover:border-accent/60 hover:bg-accent/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        )}
      >
        <UploadIcon className="size-5 text-accent" aria-hidden />
        <span className="text-sm font-medium text-foreground">Drop files here</span>
        <span className="text-xs text-muted-fg">or click to browse — .json / .txt</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".json,.txt,application/json,text/plain"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.currentTarget.value = "";
        }}
        className="sr-only"
        aria-label="Upload package.json or requirements.txt"
      />

      {analyses.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {analyses.map((analysis) => (
            <li
              key={analysis.fileName}
              className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <FileIcon className="size-3.5 shrink-0 text-muted-fg" aria-hidden />
                  <span className="truncate">{analysis.fileName}</span>
                </span>
                <span className="text-muted-fg">
                  {analysis.error
                    ? analysis.error
                    : `${analysis.dependencies.length} deps · ${
                        analysis.kind === "npm" ? "package.json" : "requirements.txt"
                      }`}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemoveFile(analysis.fileName)}
                aria-label={`Remove ${analysis.fileName}`}
                className="ml-1 rounded-md p-1 text-muted-fg transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <XIcon className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {detected.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-fg">Detected dependencies</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {detected.slice(0, 20).map((dep) => (
              <li
                key={dep}
                className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-fg"
              >
                {dep}
              </li>
            ))}
            {detected.length > 20 && (
              <li className="self-center text-[11px] text-muted-fg">+{detected.length - 20} more</li>
            )}
          </ul>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-foreground">Suggested rule sets</p>
          <ul className="mt-1.5 space-y-1.5">
            {pending.map((suggestion) => {
              const name = getRuleSet(suggestion.ruleSetId)?.name ?? suggestion.ruleSetId;
              const reasons = suggestion.reasons.slice(0, 2).join(" · ");
              return (
                <li
                  key={suggestion.ruleSetId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2"
                >
                  <div className="min-w-0 text-xs">
                    <span className="font-medium text-foreground">{name}</span>
                    <span className="block truncate text-muted-fg" title={reasons}>
                      {reasons}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onAcceptSuggestion(suggestion.ruleSetId)}
                      className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismissSuggestion(suggestion.ruleSetId)}
                      aria-label={`Dismiss suggestion ${name}`}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted-fg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      <XIcon className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
