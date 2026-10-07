import type { BuilderConfig } from "./types";
import { mergeConfig } from "./config";

/**
 * Share links carry the whole builder state as base64url-encoded JSON in the
 * `share` query parameter: ?share=<base64url>{"v":1,...}>
 */

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  // btoa is available in every browser and in Node >= 16 (global).
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");
  const padding = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(padding);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeConfigToParam(config: BuilderConfig): string {
  const json = JSON.stringify({ ...config, v: 1 });
  return bytesToBase64Url(new TextEncoder().encode(json));
}

/** Returns null when the payload is missing/mangled/invalid. Caller decides UX. */
export function decodeConfigFromParam(value: string): BuilderConfig | null {
  if (!value || value.length > 64_000) return null;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(value));
    const data = JSON.parse(json) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const raw = data as Record<string, unknown>;

    if (
      typeof raw.tool !== "string" ||
      typeof raw.selected !== "object" ||
      raw.selected === null ||
      !(raw.selected as unknown[]).every((x) => typeof x === "string") ||
      typeof raw.custom !== "string" ||
      typeof raw.title !== "string"
    ) {
      return null;
    }

    return mergeConfig({
      tool: raw.tool,
      fileOption: typeof raw.fileOption === "number" ? raw.fileOption : 0,
      title: String(raw.title).slice(0, 120),
      selected: (raw.selected as string[]).map(String),
      custom: String(raw.custom).slice(0, 100_000),
    });
  } catch {
    return null;
  }
}

export function buildShareUrl(origin: string, pathname: string, param: string): string {
  return `${origin}${pathname}?share=${param}`;
}
