/** Complete, serializable state of the builder. */
export interface BuilderConfig {
  tool: string;
  /** Index into ToolProfile.fileOptions (output file variant, e.g. .mdc vs .cursorrules). */
  fileOption: number;
  /** Optional H1 title for the generated document. */
  title: string;
  /** Selected rule set ids, in display order. */
  selected: string[];
  /** Raw markdown pasted by the user. */
  custom: string;
}

export interface SavedConfig {
  id: string;
  name: string;
  savedAt: number;
  config: BuilderConfig;
}

/** Result of analyzing one uploaded project file. */
export interface FileAnalysis {
  fileName: string;
  kind: "npm" | "python";
  dependencies: string[];
  error?: string;
}

export interface Suggestion {
  ruleSetId: string;
  reasons: string[];
}
