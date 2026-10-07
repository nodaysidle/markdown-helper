export interface ToolFileOption {
  /** Human label, e.g. "AGENTS.md — project root". */
  label: string;
  /** Bare file name used for downloads, e.g. "AGENTS.md". */
  fileName: string;
  /** Optional containing folder for display, e.g. ".cursor/rules". Empty for project root. */
  folder: string;
  /** One-line placement note shown in the UI. */
  note: string;
}

export type ToolFormat = "agents" | "cursor-mdc" | "cursorrules";

export interface ToolProfile {
  id: string;
  label: string;
  description: string;
  docsUrl: string;
  format: ToolFormat;
  fileOptions: ToolFileOption[];
  /**
   * A short, true statement about what the tool reads. Shown under the picker.
   */
  memoryNote: string;
}

export const TOOLS: ToolProfile[] = [
  {
    id: "commandcode",
    label: "Command Code",
    docsUrl: "https://commandcode.ai/docs/memory",
    format: "agents",
    description:
      "AI coding agent CLI that learns your taste and follows memory files on every turn.",
    memoryNote:
      "Reads AGENTS.md from the project root (or .commandcode/AGENTS.md) into the system prompt every request, together with any subdir-level AGENTS.md.",
    fileOptions: [
      {
        label: "AGENTS.md — project root",
        fileName: "AGENTS.md",
        folder: "",
        note: "Team-shared instructions; commit it to git.",
      },
      {
        label: "AGENTS.md — .commandcode/",
        fileName: "AGENTS.md",
        folder: ".commandcode",
        note: "The same file, kept out of the repo root. Command Code checks both, first one present wins.",
      },
    ],
  },
  {
    id: "codex",
    label: "Codex CLI",
    docsUrl: "https://agents.md",
    format: "agents",
    description:
      "OpenAI's terminal coding agent. Convention-driven, no custom format required.",
    memoryNote:
      "Reads AGENTS.md from the repository root on start and from each subdirectory it works in; AGENTS.md is the shared cross-tool convention.",
    fileOptions: [
      {
        label: "AGENTS.md — project root",
        fileName: "AGENTS.md",
        folder: "",
        note: "The agents.md convention, also honored by many other agents.",
      },
    ],
  },
  {
    id: "cursor",
    label: "Cursor CLI",
    docsUrl: "https://cursor.com/docs/context/rules",
    format: "cursor-mdc",
    description:
      "AI-first editor and agent CLI with its own Agent Rules format.",
    memoryNote:
      "Loads .cursor/rules/*.mdc (Agent Rules) always or by glob; the legacy .cursorrules file at the repo root is still honored for compatibility.",
    fileOptions: [
      {
        label: ".cursor/rules/*.mdc — Agent Rules",
        fileName: "ai-rules.mdc",
        folder: ".cursor/rules",
        note: "Current format. YAML frontmatter with description, globs and alwaysApply.",
      },
      {
        label: ".cursorrules — legacy",
        fileName: ".cursorrules",
        folder: "",
        note: "Root-level plain Markdown; simpler, no glob control.",
      },
    ],
  },
  {
    id: "agy",
    label: "agy",
    docsUrl: "https://agents.md",
    format: "agents",
    description:
      "AI coding agent CLI that follows the AGENTS.md convention.",
    memoryNote:
      "Reads AGENTS.md from the project root; keep standing rules there.",
    fileOptions: [
      {
        label: "AGENTS.md — project root",
        fileName: "AGENTS.md",
        folder: "",
        note: "The open agents.md convention.",
      },
    ],
  },
  {
    id: "deepseek-harness",
    label: "deepseek-harness",
    docsUrl: "https://agents.md",
    format: "agents",
    description:
      "Agent harness that consumes the AGENTS.md rules convention.",
    memoryNote:
      "Reads AGENTS.md from the project root on every run.",
    fileOptions: [
      {
        label: "AGENTS.md — project root",
        fileName: "AGENTS.md",
        folder: "",
        note: "The open agents.md convention.",
      },
    ],
  },
];

export const DEFAULT_TOOL_ID = "commandcode";

export function getTool(id: string): ToolProfile {
  return TOOLS.find((t) => t.id === id) ?? TOOLS[0];
}

/** Resolve the concrete output file for a config. Always safe against bad indexes. */
export function getOutputFile(tool: ToolProfile, rawOption: number): ToolFileOption {
  const option = tool.fileOptions[Math.min(Math.max(rawOption, 0), tool.fileOptions.length - 1)];
  return option ?? tool.fileOptions[0];
}

/** e.g. ".cursor/rules/ai-rules.mdc" */
export function getOutputPath(tool: ToolProfile, rawOption: number): string {
  const option = getOutputFile(tool, rawOption);
  return option.folder ? `${option.folder}/${option.fileName}` : option.fileName;
}
