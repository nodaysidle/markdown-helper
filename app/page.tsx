"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ToolPicker from "@/components/ToolPicker";
import UploadAnalyzer from "@/components/UploadAnalyzer";
import RuleSetList from "@/components/RuleSetList";
import CustomEditor from "@/components/CustomEditor";
import SavedConfigs from "@/components/SavedConfigs";
import Preview from "@/components/Preview";
import { useToast } from "@/components/ToastProvider";
import { DEFAULT_CONFIG, mergeConfig } from "@/lib/config";
import { composeMarkdown, describeOutput } from "@/lib/markdown";
import { analyzeFile, computeSuggestions } from "@/lib/analyze";
import { decodeConfigFromParam, encodeConfigToParam, buildShareUrl } from "@/lib/share";
import { copyToClipboard } from "@/lib/clipboard";
import { downloadTextFile } from "@/lib/download";
import { listSavedConfigs, saveConfig, deleteConfig } from "@/lib/storage";
import type { BuilderConfig, FileAnalysis, SavedConfig } from "@/lib/types";

const MAX_FILES = 8;
const MAX_FILE_BYTES = 2_000_000;

export default function BuilderPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG);
  const [analyses, setAnalyses] = useState<FileAnalysis[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);

  // Restore shared links and saved configurations after mount (client-only).
  // Reading the URL and localStorage is deliberately a post-hydration step so
  // that the server-rendered output stays deterministic; it cannot be done in
  // the initializer without breaking hydration.
  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("share");
      if (param !== null) {
        const decoded = decodeConfigFromParam(param);
        if (decoded) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from the URL, see comment above
          setConfig(decoded);
          toast("Loaded shared configuration", "info");
        } else {
          toast("That share link could not be decoded — starting fresh.", "error");
        }
      }
      setSavedConfigs(listSavedConfigs());
    } catch {
      toast("Could not restore saved configurations.", "error");
    }
  }, [toast]);

  const patchConfig = useCallback((patch: Partial<BuilderConfig>) => {
    setConfig((prev) => mergeConfig({ ...prev, ...patch }));
  }, []);

  const toggleRuleSet = useCallback((id: string) => {
    setConfig((prev) =>
      mergeConfig({
        ...prev,
        selected: prev.selected.includes(id)
          ? prev.selected.filter((candidate) => candidate !== id)
          : [...prev.selected, id],
      }),
    );
  }, []);

  const acceptSuggestion = useCallback(
    (ruleSetId: string) => {
      toggleRuleSet(ruleSetId);
      toast("Rule set added");
    },
    [toggleRuleSet, toast],
  );

  const dismissSuggestion = useCallback(
    (ruleSetId: string) => {
      setDismissed((prev) => (prev.includes(ruleSetId) ? prev : [...prev, ruleSetId]));
    },
    [],
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.filter((file) => /\.(json|txt)$/i.test(file.name));
      const skipped = files.length - accepted.length;
      if (skipped > 0) {
        toast(`${skipped} file(s) skipped — only package.json or requirements.txt are parsed.`, "info");
      }
      if (accepted.length === 0) {
        if (files.length > 0) {
          toast("Unsupported file type — upload package.json or requirements.txt.", "error");
        }
        return;
      }

      const results: FileAnalysis[] = [];
      for (const file of accepted) {
        if (file.size > MAX_FILE_BYTES) {
          toast(`${file.name} is too large (max 2 MB).`, "error");
          continue;
        }
        try {
          results.push(analyzeFile(file.name, await file.text()));
        } catch {
          toast(`Could not read ${file.name}.`, "error");
        }
      }
      if (results.length === 0) return;

      for (const result of results) {
        if (result.error) toast(result.error, "error");
      }

      setAnalyses((prev) => {
        const byName = new Map(prev.map((a) => [a.fileName, a]));
        for (const result of results) byName.set(result.fileName, result);
        return Array.from(byName.values()).slice(-MAX_FILES);
      });

      if (results.some((r) => !r.error)) toast(`Analyzed ${results.filter((r) => !r.error).length} file(s)`);
    },
    [toast],
  );

  const removeAnalysis = useCallback((fileName: string) => {
    setAnalyses((prev) => prev.filter((a) => a.fileName !== fileName));
  }, []);

  const suggestions = useMemo(() => computeSuggestions(analyses), [analyses]);

  const handleCopy = useCallback(
    async (text: string): Promise<boolean> => {
      const ok = await copyToClipboard(text);
      toast(
        ok ? "Copied to clipboard" : "Clipboard blocked — switch to Source view and copy manually.",
        ok ? "success" : "error",
      );
      return ok;
    },
    [toast],
  );

  const handleShare = useCallback(async (): Promise<boolean> => {
    try {
      const param = encodeConfigToParam(config);
      const url = buildShareUrl(window.location.origin, window.location.pathname, param);
      window.history.replaceState(null, "", url);
      const ok = await copyToClipboard(url);
      toast(
        ok ? "Share link copied — anyone opening it sees this exact configuration" : "Link is live in your address bar but copying was blocked.",
        ok ? "success" : "error",
      );
      return ok;
    } catch {
      toast("Could not create the share link.", "error");
      return false;
    }
  }, [config, toast]);

  const handleDownload = useCallback(() => {
    try {
      const { path } = describeOutput(config);
      const base = path.split("/").pop() ?? "rules.md";
      downloadTextFile(base, composeMarkdown(config));
      toast(`Downloaded ${base}`);
    } catch {
      toast("Download failed.", "error");
    }
  }, [config, toast]);

  const handleSave = useCallback(
    (name: string) => {
      try {
        const existing = savedConfigs.find((entry) => entry.name === name);
        setSavedConfigs(saveConfig(name, config, existing?.id));
        toast(existing ? `Updated “${name}”` : `Saved “${name}”`);
      } catch {
        toast("Saving failed — localStorage may be unavailable in this browser context.", "error");
      }
    },
    [config, savedConfigs, toast],
  );

  const handleLoad = useCallback(
    (entry: SavedConfig) => {
      setConfig(mergeConfig(entry.config));
      toast(`Loaded “${entry.name}”`);
    },
    [toast],
  );

  const handleDelete = useCallback(
    (id: string) => {
      try {
        setSavedConfigs(deleteConfig(id));
        toast("Configuration deleted", "info");
      } catch {
        toast("Deleting from localStorage failed.", "error");
      }
    },
    [toast],
  );

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Build rules for AI coding agents
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-fg">
          Toggle curated rule sets, write your own, analyze a project file, then copy, download or share
          the result — formatted for each tool&rsquo;s conventions.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <ToolPicker config={config} onChange={patchConfig} />
          <UploadAnalyzer
            analyses={analyses}
            suggestions={suggestions}
            selectedIds={config.selected}
            dismissedIds={dismissed}
            onFiles={handleFiles}
            onRemoveFile={removeAnalysis}
            onAcceptSuggestion={acceptSuggestion}
            onDismissSuggestion={dismissSuggestion}
          />
          <RuleSetList selected={config.selected} onToggle={toggleRuleSet} onClearAll={() => patchConfig({ selected: [] })} />
          <CustomEditor value={config.custom} onChange={(custom) => patchConfig({ custom })} />
          <SavedConfigs
            configs={savedConfigs}
            currentConfig={config}
            onSave={handleSave}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        </div>

        <div className="lg:sticky lg:top-[4.5rem]">
          <Preview config={config} onCopy={handleCopy} onDownload={handleDownload} onShare={handleShare} />
          <p className="mt-3 px-1 text-xs leading-relaxed text-muted-fg">
            Everything on this page lives in your browser: saved configs and share links are encoded in the
            URL — no server-side storage, no tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
