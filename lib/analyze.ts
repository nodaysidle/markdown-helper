import type { FileAnalysis, Suggestion } from "./types";
import { RULE_SETS } from "./catalog";

const MAX_DEPENDENCIES = 500;

/** Parse package.json dependency keys (dependencies + devDependencies). */
export function parsePackageJson(text: string, fileName: string): FileAnalysis {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { fileName, kind: "npm", dependencies: [], error: `${fileName} is not valid JSON.` };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { fileName, kind: "npm", dependencies: [], error: `${fileName} is not a package.json object.` };
  }

  const root = parsed as { dependencies?: unknown; devDependencies?: unknown };
  const collect = (block: unknown): string[] => {
    if (typeof block !== "object" || block === null) return [];
    return Object.keys(block as Record<string, unknown>).map((name) => name.toLowerCase());
  };

  const dependencies = Array.from(
    new Set([...collect(root.dependencies), ...collect(root.devDependencies)]),
  ).sort();

  if (dependencies.length === 0) {
    return {
      fileName,
      kind: "npm",
      dependencies: [],
      error: `${fileName} parsed, but no dependencies were found.`,
    };
  }

  return { fileName, kind: "npm", dependencies: dependencies.slice(0, MAX_DEPENDENCIES) };
}

/** Parse requirements.txt style files (PEP 508 tolerant). */
export function parseRequirementsTxt(text: string, fileName: string): FileAnalysis {
  const dependencies = new Set<string>();

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("-")) continue;

    // requirement forms: name, name==1.0, name>=1,<2, name[extra]>=1
    const match = /^([A-Za-z0-9][A-Za-z0-9._-]*)/.exec(line);
    if (match) {
      // PEP 503 normalization: case-insensitive, -_. treated as equal.
      dependencies.add(match[1].toLowerCase().replace(/[-_.]+/g, "-"));
    }
  }

  if (dependencies.size === 0) {
    return {
      fileName,
      kind: "python",
      dependencies: [],
      error: `${fileName} parsed, but no package names were found.`,
    };
  }

  return { fileName, kind: "python", dependencies: [...dependencies].sort(), };
}

/** Route an uploaded file to the right parser by extension/name. */
export function analyzeFile(fileName: string, text: string): FileAnalysis {
  const name = fileName.toLowerCase();
  if (name === "package.json" || name.endsWith("package.json")) {
    return parsePackageJson(text, fileName);
  }
  if (name === "requirements.txt" || name.endsWith("requirements.txt")) {
    return parseRequirementsTxt(text, fileName);
  }
  return {
    fileName,
    kind: "npm",
    dependencies: [],
    error: "Unsupported file — upload package.json or requirements.txt.",
  };
}

/**
 * Match a dependency against a rule-set signal:
 * exact match or substring containment in the package name.
 */
function dependencyMatchesSignal(dep: string, signal: string): boolean {
  return dep.includes(signal);
}

/** Compute suggestions across all analyzed files. */
export function computeSuggestions(analyses: FileAnalysis[]): Suggestion[] {
  const map = new Map<string, Suggestion>();

  const push = (ruleSetId: string, reason: string) => {
    const existing = map.get(ruleSetId);
    if (existing) {
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
    } else {
      map.set(ruleSetId, { ruleSetId, reasons: [reason] });
    }
  };

  for (const analysis of analyses) {
    if (analysis.error || analysis.dependencies.length === 0) continue;

    for (const dep of analysis.dependencies) {
      for (const set of RULE_SETS) {
        for (const signal of set.signals) {
          if (dependencyMatchesSignal(dep, signal)) {
            push(set.id, `${analysis.fileName}: ${dep}`);
          }
        }
      }
    }
  }

  // Python projects almost always want the Python-related rule sets.
  for (const analysis of analyses) {
    if (analysis.kind !== "python" || analysis.error) continue;
    for (const set of RULE_SETS) {
      if (set.signals.includes("python")) {
        push(set.id, `${analysis.fileName}: Python project`);
      }
    }
  }

  return [...map.values()].sort(
    (a, b) => b.reasons.length - a.reasons.length || a.ruleSetId.localeCompare(b.ruleSetId),
  );
}
