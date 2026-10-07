You are an expert full-stack web developer specializing in developer tools. Build a complete, production-quality web application called "AI Rules Builder" that helps developers create, edit, and share "rules for AI" in Markdown format, optimized for tools like Cursor cli, agy, commandcode.ai, deepseek-harness, codex.cli.

## Core Features (Required)

1. **Interactive Rule Builder**
   - Allow users to select a target AI tool from a dropdown; adjust output format to match that tool's conventions (e.g., `AGENTS.md`, `.cursorrules` ).
   - Provide a curated, editable list of pre-built rule sets (coding style, testing, security, documentation, framework-specific, etc.) that users can toggle on/off.
   - Custom rule editor with live preview side-by-side (editor left, rendered Markdown right).

2. **Live Markdown Preview & Export**
   - Render generated Markdown in real time as the user edits.
   - One-click "Copy to Clipboard" button with visual confirmation (toast/snackbar).
   - "Download as File" button that produces a file with the correct name and extension for the selected tool.

3. **Project File Analysis**
   - Drag-and-drop or file-picker upload for `package.json` and/or `requirements.txt`.
   - Parse uploaded files client-side to detect dependencies, frameworks, and tooling (e.g., React, Next.js, Django, FastAPI, pytest, ESLint).
   - Auto-suggest relevant rule sets based on detected dependencies. Show suggestions clearly and let the user accept/dismiss each one.

4. **Save & Share**
   - Let users save rule configurations to `localStorage` with a name.
   - Generate a shareable URL containing an encoded (base64 or compressed) version of the rule config so others can open the exact same configuration.

5. **Programmatic API**
   - Expose a simple JSON endpoint (e.g., `/api/rules` and `/api/rules/:id`) that returns the available rule sets and individual rule content. This must be usable by AI tools to fetch rules automatically.
   - Document the API in a `/api` info page inside the app.

## UX & Design Requirements

- Modern, polished UI with a clean typography scale, consistent spacing, and a neutral color palette plus one accent color.
- Fully responsive layout that works on mobile, tablet, and desktop.
- Smooth interactions: hover states, focus rings, loading indicators, and transition animations.
- Use a component-based frontend framework (React with Vite is preferred, or Next.js if SSR/API routes are beneficial).
- Style with Tailwind CSS or CSS modules. Keep the bundle small and fast.
- Accessible: semantic HTML, keyboard navigation, ARIA labels on interactive controls.

## Technical Requirements

- Work fully deployed on Vercel.
- Persist user state in `localStorage`; no backend database required for the core experience.
- Keep dependencies minimal and well-known.
- Include a `README.md` with setup instructions, feature overview, and API documentation.
- Use the latest stable versions of any frameworks/libraries. Reference current online documentation when needed.

## Output Format

- Provide the full project structure as a file tree, then the complete contents of every file needed to run the app.
- Group files logically: configuration, components, pages/routes, utilities, styles, and static assets.
- After the code, include a short "How to Run" section and an "API Reference" section.

## Boundaries

- Do not invent fictional APIs or libraries; if a specific library is unavailable, use the closest real alternative and note it.
- Do not include placeholder code like `// TODO` in critical paths; everything must be functional.
- Do not skip error handling on file uploads, clipboard operations, or URL parsing.
