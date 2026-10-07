import { RULE_SETS } from "@/lib/catalog";
import { TOOLS } from "@/lib/tools";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "public, max-age=300",
};

export function GET() {
  return Response.json(
    {
      name: "AI Rules Builder",
      endpoints: {
        list: "GET /api/rules",
        ruleSet: "GET /api/rules/{id}",
        docs: "GET /api (HTML)",
      },
      tools: TOOLS.map((tool) => ({
        id: tool.id,
        label: tool.label,
        files: tool.fileOptions.map(
          (option) => (option.folder ? `${option.folder}/` : "") + option.fileName,
        ),
      })),
      ruleSets: RULE_SETS.map((set) => ({
        id: set.id,
        name: set.name,
        category: set.category,
        description: set.description,
        signals: set.signals,
        ruleCount: set.rules.length,
      })),
    },
    { headers: CORS_HEADERS },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
