import { useQuery } from "@tanstack/react-query";
import { BadgeDollarSign, GitFork } from "lucide-react";
import { z } from "zod";
import {
  APP_COMMIT,
  APP_NAME,
  APP_VERSION,
  GITHUB_API_MAIN_BRANCH,
  PAYPAL_URL,
  REPO_URL,
} from "../lib/constants";

const githubCommitSchema = z.object({
  sha: z.string().min(7),
});

export function AppHeader() {
  const commitQuery = useQuery({
    queryKey: ["github-main-commit"],
    enabled: window.location.hostname.endsWith("github.io"),
    queryFn: async () => {
      const response = await fetch(GITHUB_API_MAIN_BRANCH);
      if (!response.ok) throw new Error("GitHub metadata unavailable");
      const payload = githubCommitSchema.parse(await response.json());
      return payload.sha.slice(0, 12);
    },
  });

  return (
    <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold tracking-normal">{APP_NAME}</h1>
          <p className="text-xs text-white/62">
            v{APP_VERSION} · commit {commitQuery.data ?? APP_COMMIT}
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Project links"
        >
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/18"
          >
            <GitFork size={17} aria-hidden="true" />
            Star on GitHub
          </a>
          <a
            href={PAYPAL_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-200/25 bg-cyan-300/16 px-3 text-sm font-medium text-cyan-50 hover:bg-cyan-300/24"
          >
            <BadgeDollarSign size={17} aria-hidden="true" />
            PayPal
          </a>
        </nav>
      </div>
    </div>
  );
}
