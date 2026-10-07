# Taste

## Workflow & Communication
- Kicks off projects by placing a written spec (e.g. `INSTRUCTIONS.md`) in the workspace and telling the agent to read it and begin — expects fully autonomous execution, from coding all the way through operations (build, verify, deploy): "deploy it yourself and give me the link". No step-by-step check-ins or clarifying questions. Confidence: 0.7
- Deploys web projects to Vercel; project specs call for `/api` serverless endpoints that work there. Expects the agent to run the deployment itself using the machine's existing Vercel login and hand back a working, publicly reachable link (anonymously verified), not manual instructions. Confidence: 0.7

## Tooling & Environment
- This machine's shell has `NODE_ENV=production` set, so npm silently omits devDependencies and reports "up to date" while leaving the dev tree missing — always install with `--include=dev` (or check `node_modules` after install). Confidence: 0.6
- Vercel CLI isn't installed globally, but the account is already authenticated: deploy with `npx --yes vercel deploy --prod --yes`; the token lives in `~/.local/share/com.vercel.cli/auth.json` (account `alanatkotoje-4203`). Confidence: 0.6
- New Vercel projects get Deployment Protection (SSO) enabled by default, which blocks anonymous visitors; to deliver a public link, disable it via `PATCH /v9/projects/:name` with body `{"ssoProtection": null}` (must be exactly `null`, not an object), then smoke-test the URL anonymously. Confidence: 0.6
