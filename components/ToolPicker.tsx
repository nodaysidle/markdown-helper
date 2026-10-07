"use client";

import Link from "next/link";
import { getOutputPath, getTool, TOOLS } from "@/lib/tools";
import type { BuilderConfig } from "@/lib/types";

interface ToolPickerProps {
  config: BuilderConfig;
  onChange: (patch: Partial<BuilderConfig>) => void;
}

export default function ToolPicker({ config, onChange }: ToolPickerProps) {
  const tool = getTool(config.tool);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-label="Target AI tool">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Target AI tool</h2>
        <Link
          href="/api"
          className="text-xs font-medium text-accent transition-colors hover:text-accent-strong"
        >
          Programmatic API →
        </Link>
      </div>

      <label htmlFor="tool-select" className="mt-3 block text-xs font-medium text-muted-fg">
        Tool
      </label>
      <select
        id="tool-select"
        value={tool.id}
        onChange={(e) => onChange({ tool: e.target.value, fileOption: 0 })}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        {TOOLS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <p className="mt-2 text-xs leading-relaxed text-muted-fg">{tool.description}</p>

      {tool.fileOptions.length > 1 ? (
        <fieldset className="mt-4">
          <legend className="text-xs font-medium text-muted-fg">Output file</legend>
          <div className="mt-1 space-y-1.5">
            {tool.fileOptions.map((option, index) => (
              <label
                key={option.label}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-accent/40 has-checked:border-accent has-focus-visible:ring-2 has-focus-visible:ring-accent/40"
              >
                <input
                  type="radio"
                  name="tool-file-option"
                  checked={config.fileOption === index}
                  onChange={() => onChange({ fileOption: index })}
                  className="mt-0.5 size-4 accent-accent"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-fg">{option.note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="mt-3 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted-fg">
          Writes to: {getOutputPath(tool, config.fileOption)}
        </p>
      )}

      <label htmlFor="doc-title" className="mt-4 block text-xs font-medium text-muted-fg">
        Document title <span className="font-normal">(optional)</span>
      </label>
      <input
        id="doc-title"
        type="text"
        value={config.title}
        maxLength={120}
        placeholder={tool.format === "cursor-mdc" ? "Frontmatter description + H1" : "H1 heading, e.g. Project Rules"}
        onChange={(e) => onChange({ title: e.target.value })}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-fg/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
      />

      <p className="mt-3 text-xs leading-relaxed text-muted-fg">
        <span className="font-medium text-foreground">How it loads:</span> {tool.memoryNote}
      </p>
    </section>
  );
}
