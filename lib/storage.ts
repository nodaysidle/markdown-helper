import type { SavedConfig } from "./types";

const STORAGE_KEY = "ai-rules-builder:configs";
const MAX_SAVED = 50;

/** Load all saved configurations. Throws on storage/parse failure — caller handles UI. */
export function listSavedConfigs(): SavedConfig[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (entry): entry is SavedConfig =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as SavedConfig).id === "string" &&
      typeof (entry as SavedConfig).name === "string" &&
      typeof (entry as SavedConfig).savedAt === "number" &&
      typeof (entry as SavedConfig).config === "object",
  );
}

/** Persist an entry. Overwrites silently when the id already exists. New entries get a fresh id. */
export function saveConfig(name: string, config: SavedConfig["config"], existingId?: string): SavedConfig[] {
  const list = listSavedConfigs();
  const entry: SavedConfig =
    existingId && list.find((c) => c.id === existingId)
      ? { id: existingId, name, savedAt: Date.now(), config }
      : { id: crypto.randomUUID(), name, savedAt: Date.now(), config };

  const next = [entry, ...list.filter((c) => c.id !== entry.id)].slice(0, MAX_SAVED);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteConfig(id: string): SavedConfig[] {
  const list = listSavedConfigs();
  const next = list.filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
