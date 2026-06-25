// Registry of all per-client chat configs. Add a new client by:
//   1. Copying their methodology .md files into data/clients/<slug>/
//      (or run scripts/sync-clients.sh)
//   2. Creating src/lib/clients/<slug>.ts that exports a ClientConfig
//   3. Importing + registering it here under their slug
//
// The chat API looks up the requested client by slug; if not registered,
// the request falls through to Adam's default chat config (which lives
// in chat-prompt.ts and is the existing behaviour for any embed without
// a data-client attribute).

import type { ClientConfig } from "./types";
import { virtusConfig } from "./virtus";

const registry: Record<string, ClientConfig> = {
  [virtusConfig.slug]: virtusConfig,
};

export function getClientConfig(
  slug: string | undefined | null
): ClientConfig | null {
  if (!slug) return null;
  const cleaned = slug.trim().toLowerCase();
  return registry[cleaned] ?? null;
}

export function listClientSlugs(): string[] {
  return Object.keys(registry);
}
