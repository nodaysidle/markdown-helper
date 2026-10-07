import type { BuilderConfig } from "./types";
import { getOutputFile, getTool } from "./tools";
import { RULE_SETS, getRuleSet } from "./catalog";

const CUSTOM_RULES_HEADING = "## Custom Rules";

function rulesToBullets(rules: string[]): string {
  return rules.map((rule) => `- ${rule}`).join("\n");
}

/** Flatten one rule set to markdown (heading + bullets). Used by the API too. */
export function ruleSetToMarkdown(set: { name: string; rules: string[] }): string {
  return `## ${set.name}\n${rulesToBullets(set.rules)}`;
}

function cursorMdcFrontmatter(title: string): string {
  const description = title.trim() || "Project rules generated with AI Rules Builder";
  return [
    "---",
    `description: ${description}`,
    "globs: ",
    "alwaysApply: true",
    "---",
    "",
  ].join("\n");
}

/**
 * Compose the final file content the user copies/downloads:
 * optional H1 title, one section per selected rule set (catalog order),
 * then the user's custom markdown.
 */
export function composeMarkdown(config: BuilderConfig): string {
  const tool = getTool(config.tool);
  const selected = config.selected
    .map((id) => getRuleSet(id))
    .filter((set): set is NonNullable<typeof set> => Boolean(set));

  const lines: string[] = [];

  const title = config.title.trim();
  if (title) lines.push(`# ${title}`, "");

  for (const set of selected) {
    if (lines.length > 0) lines.push("");
    lines.push(ruleSetToMarkdown(set));
  }

  const custom = config.custom.trim();
  if (custom) {
    if (lines.length > 0) lines.push("");
    lines.push(CUSTOM_RULES_HEADING);
    lines.push("");
    lines.push(custom);
  }

  let body = lines.join("\n").trim() + "\n";
  if (body === "\n") body = "";

  if (tool.format === "cursor-mdc") {
    const frontmatter = cursorMdcFrontmatter(title);
    return body ? frontmatter + "\n" + body : frontmatter;
  }

  return body;
}

/** True when the composed document has no useful content. */
export function isEmptyComposition(config: BuilderConfig): boolean {
  const body = composeMarkdown({ ...config });
  const tool = getTool(config.tool);
  if (tool.format === "cursor-mdc") return false;
  return body.trim().length === 0;
}

/** Output identity for the current tool + file option. */
export function describeOutput(config: BuilderConfig) {
  const tool = getTool(config.tool);
  const option = getOutputFile(tool, config.fileOption);
  const path = option.folder ? `${option.folder}/${option.fileName}` : option.fileName;
  const formatLabel =
    tool.format === "agents" ? "Markdown" : tool.format === "cursor-mdc" ? "MDC (frontmatter)" : "Plain Markdown";
  return { tool, option, path, formatLabel };
}

/** Stats shown in the preview header. */
export function computeStats(markdown: string) {
  const chars = markdown.length;
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const lines = markdown === "" ? 0 : markdown.split("\n").length;
  const roughTokens = Math.ceil(chars / 4);
  return { chars, words, lines, roughTokens };
}

/** Rule set count helper for saved-config summaries. */
export function countSelectedRules(config: BuilderConfig): number {
  const perSet = config.selected
    .map((id) => RULE_SETS.find((r) => r.id === id)?.rules.length ?? 0)
    .reduce((a, b) => a + b, 0);
  const customLines = config.custom.split("\n").filter((l) => l.trim().length > 0).length;
  return perSet + customLines;
}
