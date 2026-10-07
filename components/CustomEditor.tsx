"use client";

interface CustomEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomEditor({ value, onChange }: CustomEditorProps) {
  const lineCount = value.split("\n").length;

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-label="Custom rules">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Custom rules</h2>
        <span className="text-xs text-muted-fg">
          {value.length} chars · {lineCount} lines
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-fg">
        Raw markdown appended as its own section — bullets, headings, fenced code blocks all work.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        spellCheck={false}
        placeholder={"- Always run `pnpm lint` before committing\n- Use feature folders: components/auth/…"}
        aria-label="Custom rules markdown"
        className="mt-3 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-[13px] leading-5 text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-fg/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
    </section>
  );
}
