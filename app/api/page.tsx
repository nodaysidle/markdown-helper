import type { Metadata } from "next";
import Link from "next/link";
import { RULE_SETS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "API",
  description: "Read-only JSON API for fetching rule sets and tool conventions programmatically.",
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="scroll-slim overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-[12.5px] leading-6 text-foreground">
      {children}
    </pre>
  );
}

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/rules",
    description: "List target tools and all rule sets (metadata only, no rule bodies).",
  },
  {
    method: "GET",
    path: "/api/rules/{id}",
    description: "One rule set with its rules array and ready-to-use markdown `content`.",
  },
];

export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">JSON API</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-fg">
          A small, read-only API so AI tools and scripts can fetch rule sets the same way the builder UI
          does. No authentication. CORS is enabled (<code className="font-mono">*</code>), responses are
          cached on the CDN for five minutes, and everything is JSON (<code className="font-mono">application/json</code>).
        </p>
      </div>

      <section aria-labelledby="endpoints-heading" className="mb-10">
        <h2 id="endpoints-heading" className="text-base font-semibold text-foreground">
          Endpoints
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-fg">
                <th scope="col" className="px-4 py-2.5 font-semibold">Method</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Path</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Returns</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((endpoint) => (
                <tr key={endpoint.path} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 align-top">
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs font-medium">{endpoint.method}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs align-top">{endpoint.path}</td>
                  <td className="px-4 py-2.5 text-muted-fg align-top">{endpoint.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="examples-heading" className="mb-10">
        <h2 id="examples-heading" className="text-base font-semibold text-foreground">List rule sets</h2>
        <p className="mt-1 text-sm text-muted-fg">
          <code className="font-mono">GET /api/rules</code> returns tool conventions and metadata for every
          curated rule set.
        </p>
        <div className="mt-3"><CodeBlock>{`{
  "name": "AI Rules Builder",
  "endpoints": { "list": "GET /api/rules", "ruleSet": "GET /api/rules/{id}", "docs": "GET /api (HTML)" },
  "tools": [
    { "id": "commandcode", "label": "Command Code", "files": ["AGENTS.md"] },
    { "id": "cursor", "label": "Cursor CLI", "files": [".cursor/rules/ai-rules.mdc", ".cursorrules"] }
    …
  ],
  "ruleSets": [
    { "id": "codestyle-typescript", "name": "TypeScript Style", "category": "Code Style",
      "description": "Strict typing, unions over flags, and lean exports.", "signals": ["typescript"], "ruleCount": 9 }
    …
  ]
}`}</CodeBlock></div>
      </section>

      <section aria-labelledby="single-heading" className="mb-10">
        <h2 id="single-heading" className="text-base font-semibold text-foreground">Fetch one rule set</h2>
        <p className="mt-1 text-sm text-muted-fg">
          <code className="font-mono">GET /api/rules/codestyle-typescript</code> returns the full rule set.
          The <code className="font-mono">content</code> field is markdown built to be appended to your
          rules file. Unknown ids return <code className="font-mono">404</code> with the list of available
          ids.
        </p>
        <div className="mt-3 space-y-3">
          <CodeBlock>{`{
  "id": "codestyle-typescript",
  "name": "TypeScript Style",
  "category": "Code Style",
  "description": "Strict typing, unions over flags, and lean exports.",
  "signals": ["typescript", "tslib", "swc"],
  "ruleCount": 9,
  "rules": [
    "Keep \`strict\` TypeScript enabled; the build must pass with zero type errors.",
    "Avoid \`any\` — use \`unknown\` at system boundaries and narrow it deliberately."
    …
  ],
  "content": "## TypeScript Style\n- Keep \`strict\` TypeScript enabled; the build must pass with zero type errors.\n- …"
}`}</CodeBlock>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-fg">404 shape</p>
            <CodeBlock>{`{ "error": "Rule set \"nonexistent\" not found", "available": ["general-principles", …] }`}</CodeBlock>
          </div>
        </div>
      </section>

      <section aria-labelledby="usage-heading" className="mb-10">
        <h2 id="usage-heading" className="text-base font-semibold text-foreground">Usage from CLI tools</h2>
        <p className="mt-1 text-sm text-muted-fg">
          Point <code className="font-mono">BASE</code> at your deployed URL, then append rule sets to an
          <code className="font-mono"> AGENTS.md</code>:
        </p>
        <div className="mt-3"><CodeBlock>{`BASE="https://your-app.vercel.app"

# Inspect the catalog
curl -s "$BASE/api/rules" | jq -r '.ruleSets[].id'

# Append a rule set to your rules file
curl -s "$BASE/api/rules/security-web" | jq -r '.content' >> AGENTS.md`}</CodeBlock></div>
      </section>

      <section aria-labelledby="ids-heading" className="mb-4">
        <h2 id="ids-heading" className="text-base font-semibold text-foreground">Available ids</h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {RULE_SETS.map((set) => (
            <li key={set.id}>
              <Link
                href={`/api#${set.id}`}
                title={`${set.name} — ${set.description}`}
                className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-foreground transition-colors hover:border-accent/60 hover:text-accent"
              >
                {set.id}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
