import { RULE_SETS, getRuleSet } from "@/lib/catalog";
import { ruleSetToMarkdown } from "@/lib/markdown";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "public, max-age=300",
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ruleSet = getRuleSet(id);

  if (!ruleSet) {
    return Response.json(
      {
        error: `Rule set "${id}" not found`,
        available: RULE_SETS.map((set) => set.id),
      },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  return Response.json(
    {
      id: ruleSet.id,
      name: ruleSet.name,
      category: ruleSet.category,
      description: ruleSet.description,
      signals: ruleSet.signals,
      ruleCount: ruleSet.rules.length,
      rules: ruleSet.rules,
      /** Ready-to-append markdown: "## Name\n- rule\n- rule" */
      content: ruleSetToMarkdown(ruleSet),
    },
    { headers: CORS_HEADERS },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
