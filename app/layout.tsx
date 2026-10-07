import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { BrandMark } from "@/components/BrandMark";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Rules Builder",
    template: "%s · AI Rules Builder",
  },
  description:
    "Create, preview, and share rules-for-AI files (AGENTS.md, .cursorrules, .mdc) for tools like Command Code, Codex CLI and Cursor — with curated rule sets, project analysis and a programmatic API.",
  keywords: ["AGENTS.md", "cursorrules", "AI rules", "coding agent", "rules builder"],
};

const NAV_LINK = "rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-fg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <ToastProvider>
          <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <BrandMark className="size-6" />
                <span className="text-sm font-semibold tracking-tight text-foreground">AI Rules Builder</span>
              </Link>
              <nav aria-label="Main" className="flex items-center gap-1">
                <Link href="/" className={NAV_LINK}>
                  Builder
                </Link>
                <Link href="/api" className={NAV_LINK}>
                  API
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

          <footer className="border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-fg sm:px-6">
              Runs entirely in your browser — rule sets are served read-only by the JSON{" "}
              <Link href="/api" className="underline decoration-border underline-offset-2 hover:text-foreground">
                API
              </Link>
              .
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
