"use client";

import { useState } from "react";
import { countSelectedRules } from "@/lib/markdown";
import { BookmarkIcon, TrashIcon } from "@/components/icons";
import type { BuilderConfig, SavedConfig } from "@/lib/types";

interface SavedConfigsProps {
  configs: SavedConfig[];
  currentConfig: BuilderConfig;
  onSave: (name: string) => void;
  onLoad: (entry: SavedConfig) => void;
  onDelete: (id: string) => void;
}

export default function SavedConfigs({
  configs,
  currentConfig,
  onSave,
  onLoad,
  onDelete,
}: SavedConfigsProps) {
  const [name, setName] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName("");
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-label="Saved configurations">
      <h2 className="text-sm font-semibold text-foreground">Saved configurations</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-fg">
        Stored in this browser only (localStorage) — nothing is uploaded to a server.
      </p>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. “Frontend React rules”"
          maxLength={60}
          aria-label="Configuration name"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-fg/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <BookmarkIcon className="size-4" aria-hidden />
          Save
        </button>
      </form>

      {configs.length === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-fg">
          Nothing saved yet — save your first configuration above.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {configs.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
            >
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{entry.name}</span>
                <span className="text-[11px] text-muted-fg">
                  {countSelectedRules(entry.config)} rules ·{" "}
                  {new Date(entry.savedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onLoad(entry)}
                  className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Delete ${entry.name}`}
                  className="rounded-md p-1.5 text-muted-fg transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <TrashIcon className="size-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="sr-only" aria-live="polite">
        {currentConfig.selected.length > 0 ? `${currentConfig.selected.length} rule sets active` : ""}
      </div>
    </section>
  );
}
