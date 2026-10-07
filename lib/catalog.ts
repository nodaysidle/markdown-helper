export const CATEGORIES = [
  "General",
  "Code Style",
  "Testing",
  "Security",
  "Documentation",
  "Framework & UI",
  "Backend",
] as const;

export type RuleCategory = (typeof CATEGORIES)[number];

export interface RuleSet {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  /**
   * Package-name fragments (lowercase) that should trigger an "add this rule
   * set" suggestion during project file analysis. Short fragments match as
   * substrings; e.g. "react" matches react, react-dom, @types/react.
   */
  signals: string[];
  rules: string[];
}

/**
 * The curated, editable catalog. Order matters: rule sets render and export in
 * this order, so most important ones come first.
 */
export const RULE_SETS: RuleSet[] = [
  {
    id: "general-principles",
    name: "General Principles",
    category: "General",
    description: "Cross-cutting engineering principles that apply to every change.",
    signals: [],
    rules: [
      "Write code for correctness and clarity first; optimize only after measuring.",
      "Make the smallest change that solves the problem — no drive-by refactors outside the task's scope.",
      "Never leave dead code, commented-out blocks, or speculative abstractions behind; delete them.",
      "Prefer boring, well-understood solutions over clever ones.",
      "When requirements are ambiguous, state your assumptions explicitly; ask before guessing at an interface.",
      "Keep modules focused: one responsibility per file, one concern per commit.",
      "Verify your work before declaring it done: run the tests, the type checker, and the linter.",
    ],
  },
  {
    id: "git-workflow",
    name: "Git & Commit Hygiene",
    category: "General",
    description: "Commit messages, branch etiquette, and review-worthy diffs.",
    signals: ["git"],
    rules: [
      "Use Conventional Commits (`feat:`, `fix:`, `chore:` …) with imperative subjects of 72 characters or fewer.",
      "One logical change per commit; split unrelated cleanup into its own commit.",
      "Never commit secrets, credentials, or build artifacts.",
      "Never force-push or rewrite history on shared branches; amend only unpublished commits.",
      "Write the diff you would want to review: no debug logging, formatting churn, or accidental renames.",
      "Reference the issue or task in the commit body when one exists.",
      "Rebase onto the target branch before opening a PR, and keep PRs small enough to review in one sitting.",
    ],
  },
  {
    id: "codestyle-typescript",
    name: "TypeScript Style",
    category: "Code Style",
    description: "Strict typing, unions over flags, and lean exports.",
    signals: ["typescript", "tslib", "swc"],
    rules: [
      "Keep `strict` TypeScript enabled; the build must pass with zero type errors.",
      "Avoid `any` — use `unknown` at system boundaries and narrow it deliberately.",
      "Rely on inference for locals; annotate every exported function signature.",
      "Model state with discriminated unions instead of boolean flag parameters.",
      "`const` by default; never reassign parameters; prefer pure data flow.",
      "Handle every case in a `switch` over a union type — make impossible states unrepresentable.",
      "Keep exported surfaces small: export only what other modules actually consume.",
      "Prefer `async/await` over raw promises; only catch errors you can handle, otherwise rethrow with added context.",
      "Limit functions to roughly 50 lines; extract helpers only when the extraction improves clarity.",
    ],
  },
  {
    id: "codestyle-javascript",
    name: "JavaScript Style",
    category: "Code Style",
    description: "Modern ES idioms, naming, and dependency discipline.",
    signals: ["javascript", "prettier", "eslint", "oxlint", "biome"],
    rules: [
      "Use ES modules (`import`/`export`); CommonJS only inside build config where it is required.",
      "`const` unless reassignment is required; template literals over string concatenation.",
      "Prefer `async/await` over promise chains; never introduce floating promises.",
      "No synchronous I/O on request paths; keep handlers non-blocking.",
      "Name things plainly: `camelCase` for functions and variables, `PascalCase` for classes and types, `UPPER_SNAKE_CASE` for constants.",
      "Replace magic numbers and repeated strings with named constants.",
      "Throw structured `Error` objects with useful messages, never bare strings.",
      "Reach for the standard library before adding a dependency; justify every new package.",
      "Follow the codebase's existing formatting exactly; never reformat unrelated code, and let the formatter settle style debates.",
    ],
  },
  {
    id: "codestyle-python",
    name: "Python Style",
    category: "Code Style",
    description: "PEP 8 idioms, type hints, and formatting ergonomics.",
    signals: ["python", "black", "ruff", "isort", "mypy", "pydantic"],
    rules: [
      "Follow PEP 8; let `black`, `ruff format`, or the repo's configured formatter decide presentation.",
      "Add type hints to all function signatures; aim for `mypy --strict` cleanliness.",
      "Use f-strings for interpolation and `pathlib` over `os.path` for filesystem work.",
      "Snake_case for functions, modules and variables; PascalCase for classes; UPPER_SNAKE_CASE for module constants.",
      "Prefer comprehensions over loops that just build a list, but bail out to explicit loops when the comprehension stops reading naturally.",
      "No mutable default arguments; use `None` plus an in-body construction.",
      "Catch specific exceptions; bare `except:` swallows bugs and is never acceptable.",
      "Keep modules importable without side effects; guard CLI entry points with `if __name__ == \"__main__\":`.",
    ],
  },
  {
    id: "testing-general",
    name: "Testing Principles",
    category: "Testing",
    description: "What good tests look like, independent of runner.",
    signals: ["test", "ci"],
    rules: [
      "Test behavior through public interfaces, not private implementation details.",
      "Follow Arrange–Act–Assert; one logical assertion per test.",
      "Name tests as specifications: \"returns 404 when the build artifact is missing\".",
      "Every bug fix ships with a regression test that fails without the fix.",
      "Tests must be deterministic: no sleeps, no reliance on wall-clock time or iteration order — inject fakable clocks.",
      "Cover the happy path, edge cases (empty, boundary, invalid), and failure paths.",
      "Keep tests independent — shared mutable fixture state is a bug factory; build fresh state with factories.",
      "Mock only at true boundaries (network, filesystem, clock), never the code under test.",
    ],
  },
  {
    id: "testing-node",
    name: "Node/JS Testing",
    category: "Testing",
    description: "Vitest/Jest conventions and browser-level testing discipline.",
    signals: ["vitest", "jest", "mocha", "playwright", "cypress", "testing-library"],
    rules: [
      "Colocate tests with sources as `foo.test.ts` beside `foo.ts`, unless the repo already uses a `__tests__` layout — then follow it.",
      "Use the repo's established runner (Vitest or Jest) and its config; do not introduce a second runner.",
      "Keep the E2E suite small and critical-path-only (Playwright/Cypress); push detailed coverage into fast component and unit tests.",
      "Never hit a real network in tests — mock at the network layer (MSW, fetch stubs) or the module boundary.",
      "Prefer `toEqual`/`toStrictEqual` over bare truthy assertions; assert on specific values.",
      "Use snapshot tests only for genuinely stable output, and review every changed snapshot.",
      "Keep test output clean: no stray `console.log`, and no skipped tests without an explanatory comment and an issue link.",
      "Coverage is a signal, not a target — chase meaningful assertions, not percentages.",
    ],
  },
  {
    id: "testing-python",
    name: "Python Testing",
    category: "Testing",
    description: "pytest conventions, fixtures, and parametrization.",
    signals: ["pytest", "unittest", "tox", "hypothesis"],
    rules: [
      "Use pytest with plain test functions and `assert` statements; no unittest classes unless the repo already uses them.",
      "Prefer fixtures crafted with the narrowest scope that works; heavy `autouse` fixtures make tests slow and opaque.",
      "Use `pytest.mark.parametrize` instead of loops that generate near-identical tests.",
      "Assert exceptions with `pytest.raises` and pin both type and message fragment.",
      "For async code, use `pytest-asyncio` consistently and never mix event loops in one test run.",
      "Fake the network, filesystem, and time at their boundaries; never hit real services in the default suite.",
      "Keep the default suite fast; mark integration tests (`@pytest.mark.slow`) and exclude them from routine runs.",
      "New features arrive with tests; regressions arrive with a test that documents the bug.",
    ],
  },
  {
    id: "security-web",
    name: "Web Security (OWASP)",
    category: "Security",
    description: "Input validation, injection, headers, and secret hygiene.",
    signals: ["express", "fastify", "next", "hono", "django", "fastapi", "flask", "koa", "nest"],
    rules: [
      "Treat all client-supplied input as untrusted; validate it on the server with a schema (zod, pydantic, etc.) at every trust boundary.",
      "Never build SQL, shell commands, HTML, or URLs by string concatenation with user input — use parameterized queries, templates, and encoding layers.",
      "Sanitize any user-controlled path before it reaches the filesystem (no `..` traversal, resolve and re-check the root).",
      "Secrets live in environment variables injected at runtime; never hardcode them, commit them, or log them.",
      "Check authorization server-side on every request; hiding UI is not access control.",
      "Keep CSRF protection enabled for state-changing endpoints and validate `Origin` where applicable.",
      "Set the security header baseline (HSTS, CSP, `X-Content-Type-Options: nosniff`, frame denial) and understand any exception you make.",
      "Rate-limit and size-limit public endpoints; attach timeouts to all outbound requests.",
      "Log security events without PII or tokens; send generic error messages to clients and keep stack traces on the server.",
      "Pin and audit dependencies (`npm audit`, `pip-audit`) in CI; review updates to auth- and crypto-adjacent packages.",
    ],
  },
  {
    id: "security-general",
    name: "Security Fundamentals",
    category: "Security",
    description: "Cryptography, auth flows, and least privilege.",
    signals: ["oauth", "auth0", "clerk", "jose", "passport", "security"],
    rules: [
      "Apply least privilege to processes, service accounts, database users, and API scopes.",
      "Fail closed: an auth or permission error denies access by default.",
      "Use vetted, standard cryptography only — never hand-roll or re-invent primitives.",
      "Generate tokens, ids, and nonces from the platform CSPRNG (`crypto.randomUUID()`, `secrets`), never from `Math.random()` or time.",
      "Hash passwords with a memory-hard KDF (argon2id or bcrypt + salt); never store or log reversible secrets.",
      "Keep tokens short-lived, store refresh credentials securely, and honor rotation.",
      "No dynamic code execution on untrusted input — no `eval`, `exec`, `os.system`, `new Function`, or raw `innerHTML`.",
      "Treat auth, payment, and upload code as highest-risk; require an explicit review pass over anything touching them.",
    ],
  },
  {
    id: "documentation",
    name: "Documentation",
    category: "Documentation",
    description: "READMEs, examples, changelogs, and truthful comments.",
    signals: ["readme", "docs", "vitepress", "starlight", "mkdocs"],
    rules: [
      "Update documentation in the same PR as the code change; docs that ship later never ship.",
      "Give every public module, endpoint, or CLI flag a one-paragraph summary plus at least one example.",
      "Keep the README runnable: install, build and test commands must work verbatim.",
      "Prefer examples over prose; write short sentences and no marketing fluff.",
      "Document the why and the tradeoffs, not the obvious what — code already shows what it does.",
      "Keep CHANGELOG entries user-focused and loud about breaking changes.",
      "Delete stale comments rather than fixing them into place; a wrong comment is worse than none.",
    ],
  },
  {
    id: "api-design",
    name: "API Design",
    category: "Documentation",
    description: "REST conventions, pagination, errors, and versioning.",
    signals: ["openapi", "swagger", "hono", "fastify", "trpc"],
    rules: [
      "Version public APIs from day one and never remove a field within a version — additive changes only.",
      "Name routes with plural nouns and HTTP verbs; reserve non-verb routes only when a resource-style name won't do.",
      "Use correct status codes: 400 for client errors, 401 vs 403 distinguished, 404 for unknown, 5xx only for server faults.",
      "Return a consistent error envelope: machine-readable `code`, human-readable `message`, optional `details` array.",
      "Make every write endpoint idempotent or provide an idempotency key so client retries are safe.",
      "Paginate every list endpoint by default (cursor pagination preferred) and cap page sizes.",
      "Validate and authorize at the boundary — handlers receive trusted, typed input.",
      "Propagate a request id into logs and error responses so a client report maps to a trace.",
    ],
  },
  {
    id: "react",
    name: "React",
    category: "Framework & UI",
    description: "Hooks discipline, derived state, and rendering rules.",
    signals: ["react", "react-dom", "react-router", "tanstack/store", "react-native"],
    rules: [
      "Function components and hooks only — no class components, no HOCs, no render-prop hierarchies.",
      "Keep components pure with respect to props and state; side effects belong in effects and event handlers.",
      "Derive during render instead of mirroring state; only sync via `useEffect` when talking to something outside React.",
      "Write exhaustive `Effect` dependencies (`react-hooks/exhaustive-deps`); fighting the linter indicates the effect is wrong.",
      "Colocate state at the lowest common ancestor; introduce context or a store only when prop-drilling actually hurts.",
      "Context is a dependency-injection seam, not a global state store.",
      "Use stable, data-identity keys for lists — indexes only for truly static lists.",
      "Memoize (`React.memo`, `useMemo`, `useCallback`) only after profiling shows a real cost; premature memoization is noise.",
      "Extract generic logic into custom hooks (`useX` naming); keep component files single-purpose.",
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "Framework & UI",
    description: "App Router, server-first data flow, and metadata.",
    signals: ["next"],
    rules: [
      "App Router with Server Components by default; mark the minimum interactive subtree with `\"use client\"`.",
      "Fetch and mutate on the server where possible; keep secrets out of client components (only `NEXT_PUBLIC_*` is public).",
      "Route handlers (`route.ts`) for HTTP endpoints; colocate logic that belongs to the app in folders Next does not treat as public.",
      "Use `next/image`, `next/link` and `next/font` instead of raw tags — they carry the performance win.",
      "Define `metadata`/`generateMetadata` per route; add `sitemap.ts`/`robots.ts` for public sites.",
      "Give any segment that can fail an `error.tsx`, and any slow segment a `loading.tsx` skeleton; stream slow data with Suspense boundaries.",
      "Prerender by default (`revalidate`/ISR when data is not per-request); do not force-dynamic pages that don't need it.",
      "Never read `process.env` deep in the tree — read it once in a config module that validates the shape at boot.",
    ],
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Framework & UI",
    description: "Token-driven theming and lean utility composition.",
    signals: ["tailwindcss"],
    rules: [
      "Compose UIs from the tokens already in the theme; if a value repeats, extend the theme instead of scattering arbitrary values.",
      "Keep one class set per component by driving theming through CSS variables (light/dark), not by duplicating `dark:` pairs everywhere.",
      "Do not use `@apply` to re-create components; extract repeated class strings into real components.",
      "Write responsive styles mobile-first: base styles are mobile, enhancements opt in with `sm:` and above.",
      "Keep a consistent, readable utility order per element: layout → spacing → typography → color → misc.",
      "Never ship interactive controls without visible focus: default to `focus-visible:` rings.",
      "Preserve accessibility utilities (`sr-only`, `aria-*` attributes) — they are part of the design, not an afterthought.",
    ],
  },
  {
    id: "accessibility",
    name: "Accessibility",
    category: "Framework & UI",
    description: "Semantic HTML, keyboard support, and ARIA done right.",
    signals: ["radix-ui", "headlessui", "react-aria", "a11y"],
    rules: [
      "Reach for semantic HTML first (`nav`, `main`, `button`, `a`, `label`); reach for div-role improvisation only when nothing fits.",
      "Every interactive control is keyboard reachable, operable, and shows a visible focus indicator.",
      "Every input has a real label (associated `<label>` or `aria-label`); placeholder text is never the label.",
      "Meet WCAG AA contrast; never communicate state with color alone — pair it with text or an icon.",
      "Informative images get meaningful `alt`; decorative images get empty `alt`.",
      "Announce async and toast updates with an `aria-live` region; manage focus when routes or modals change.",
      "Keep heading levels in order and give each page one unique `main` landmark.",
      "Respect `prefers-reduced-motion`; gate all nonessential animation.",
      "Verify major flows with keyboard-only navigation and a screen reader spot check (NVDA or VoiceOver).",
    ],
  },
  {
    id: "performance-web",
    name: "Web Performance",
    category: "Framework & UI",
    description: "Bundle discipline, rendering cost, and real metrics.",
    signals: ["vite", "webpack", "webpack-bundle-analyzer", "lighthouse", "rspack"],
    rules: [
      "Keep the initial bundle lean: dynamic-import heavy paths and don't fill the server bundle with client-only libraries.",
      "Cache and memoize deliberately, but only after profiling shows the cost is real.",
      "Avoid N+1 data access; batch repeated queries into a single request.",
      "Virtualize or paginate long lists; never render hundreds of complex nodes at once unguarded.",
      "Serve images compressed and responsive (`next/image` or equivalent); set `width`/`height` to prevent layout shift.",
      "Defer non-critical data fetching so the visible shell paints first.",
      "Track real metrics — LCP, INP, CLS — before and after performance changes; claim only what you measured.",
    ],
  },
  {
    id: "node-backend",
    name: "Node Backend",
    category: "Backend",
    description: "Express/Fastify/Hono layers, logging, and lifecycle.",
    signals: ["express", "fastify", "hono", "nestjs", "prisma", "drizzle-orm", "kysely", "pg"],
    rules: [
      "Route handlers stay thin: parse, delegate to a service, return a response — no business logic inline.",
      "Validate request bodies and queries with a schema at the boundary; reject early with 400/422.",
      "Everything async; offload CPU-heavy work from the event loop (worker threads, external jobs).",
      "Log structured JSON with request id, level, and context; no bare `console.log` in committed code.",
      "Validate configuration at boot from the environment and fail fast on missing values.",
      "Handle SIGTERM with a graceful shutdown: stop accepting connections, drain in-flight requests, close DB clients.",
      "Bound every resource: connection pool caps, request sizes, and per-request timeouts on DB and HTTP calls.",
      "Expose `/healthz` (liveness) and a separate readiness check that reflects real dependencies.",
      "Map known errors to 4xx responses and log unknown errors with context before returning a generic 5xx — never leak internals.",
    ],
  },
  {
    id: "django",
    name: "Django",
    category: "Backend",
    description: "ORM discipline, views, and settings hygiene.",
    signals: ["django"],
    rules: [
      "Follow Django's own conventions and structure; use managed migrations for every model change and never edit an applied migration.",
      "Keep views thin; put business logic in model methods, service modules, or forms.",
      "Use the ORM (or `.raw()` with parameters when required) — string-formatted SQL with user input is banned.",
      "Validate input at forms/serializer boundaries; do not trust `request.POST` directly.",
      "Keep secrets and environment-specific values out of settings.py — load them from the environment.",
      "Wrap multi-write flows in `transaction.atomic` and use `select_for_update` when races matter.",
      "Eliminate N+1 queries in list views with `select_related`/`prefetch_related`.",
      "Use `TextChoices` and settings flags instead of magic values throughout.",
      "Never strip CSRF middleware; apply `login_required`/permission decorators to everything except intentional exceptions.",
    ],
  },
  {
    id: "fastapi",
    name: "FastAPI",
    category: "Backend",
    description: "Pydantic edges, dependencies, and async rules.",
    signals: ["fastapi", "sqlmodel"],
    rules: [
      "Define request and response shapes with Pydantic models and `response_model`; no untyped dict I/O.",
      "Use `def` endpoints when a call blocks on CPU or sync I/O (FastAPI runs them on the threadpool) and `async def` when it is pure async I/O.",
      "Share auth, sessions, and DB setup through `Depends` providers, not module-level globals.",
      "Raise `HTTPException` with precise status codes for expected failures; keep a single handler for unexpected 500s with logged detail.",
      "Run startup/shutdown work in the lifespan context manager, not deprecated `on_event` hooks.",
      "One session per request via dependencies; never share a mutable session across requests.",
      "Load configuration with pydantic-settings; avoid module-level side effects at import time.",
      "Test with `TestClient` (or `httpx.AsyncClient`) with dependency overrides for DB and external services.",
    ],
  },
];

export const RULE_SET_MAP = new Map<string, RuleSet>(RULE_SETS.map((r) => [r.id, r]));

export function getRuleSet(id: string): RuleSet | undefined {
  return RULE_SET_MAP.get(id);
}

/** Drop ids that are not in the catalog, preserving the requested order. */
export function filterKnownIds(ids: string[]): string[] {
  const known = new Set(RULE_SETS.map((r) => r.id));
  return ids.filter((id) => known.has(id));
}
