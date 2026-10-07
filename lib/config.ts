import type { BuilderConfig } from "./types";
import { getTool } from "./tools";
import { filterKnownIds } from "./catalog";

const STARTER_SELECTION = ["general-principles", "codestyle-typescript", "testing-general"];

/** Default starting configuration for a first-time visitor. */
export const DEFAULT_CONFIG: BuilderConfig = {
  tool: "commandcode",
  fileOption: 0,
  title: "Project Rules",
  selected: [...STARTER_SELECTION],
  custom: "",
};

/**
 * Coerce loose input into a complete, valid BuilderConfig.
 * Unknown tool ids fall back to the default tool; unknown rule ids are
 * dropped. A zero or missing fileOption index is clamped to the valid range.
 * Explicit selections (including an intentionally empty one) are preserved;
 * only when no selection array exists does the starter set apply.
 */
export function mergeConfig(partial: Partial<BuilderConfig>): BuilderConfig {
  const tool = getTool(partial.tool ?? DEFAULT_CONFIG.tool);
  return {
    tool: tool.id,
    fileOption: Math.min(Math.max(partial.fileOption ?? 0, 0), tool.fileOptions.length - 1),
    title: typeof partial.title === "string" ? partial.title : "",
    selected: Array.isArray(partial.selected) ? filterKnownIds(partial.selected) : [...STARTER_SELECTION],
    custom: typeof partial.custom === "string" ? partial.custom : "",
  };
}
