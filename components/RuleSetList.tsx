"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, RULE_SETS, type RuleSet } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { SearchIcon } from "@/components/icons";

interface RuleSetListProps {
  selected: string[];
  onToggle: (id: string) => void;
  onClearAll: () => void;
}

export default function RuleSetList({ selected, onToggle, onClearAll }: RuleSetListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RULE_SETS;
    return RULE_SETS.filter(
      (set) =>
        set.name.toLowerCase().includes(q) ||
        set.description.toLowerCase().includes(q) ||
        set.category.toLowerCase().includes(q) ||
        set.signals.some((signal) => signal.includes(q)),
    );
  }, [query]);

  const byCategory = useMemo(() => {
    const groups: Array<{ category: string; sets: RuleSet[] }> = CATEGORIES.map((category) => ({
      category,
      sets: [],
    }));
    for (const set of filtered) {
      const group = groups.find((g) => g.category === set.category);
      if (group) group.sets.push(set);
    }
    return groups.filter((g) => g.sets.length > 0);
  }, [filtered]);

  const selectedCount = selected.length;

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-label="Rule sets">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Rule sets</h2>
        <div className="flex items-center gap-2">
          <span
            className="text-xs text-muted-fg"
            aria-live="polite"
          >
            {selectedCount} selected
          </span>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-accent transition-colors hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-3">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-fg" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter rule sets…"
          aria-label="Filter rule sets"
          className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-fg/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div className="mt-2 space-y-4">
        {byCategory.map((group) => (
          <div key={group.category}>
            <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-fg">
              {group.category}
            </h3>
            <ul className="mt-1.5 space-y-1.5">
              {group.sets.map((set) => {
                const checked = selected.includes(set.id);
                return (
                  <li key={set.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                        checked
                          ? "border-accent/60 bg-accent/10"
                          : "border-border bg-background hover:border-accent/40",
                        "has-focus-visible:ring-2 has-focus-visible:ring-accent/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(set.id)}
                        className="mt-0.5 size-4 shrink-0 accent-accent"
                      />
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-foreground">{set.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-fg">{set.rules.length} rules</span>
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted-fg">
                          {set.description}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {byCategory.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-muted-fg">No rule sets match “{query}”.</p>
        )}
      </div>
    </section>
  );
}
