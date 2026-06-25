#!/usr/bin/env bash
# Refresh per-client methodology files from the ai-marketing-agency repo
# into data/clients/<slug>/ so they bundle with the Vercel deployment.
#
# Why this exists: the embeddable chat widget loads per-client systemPrompts
# at runtime. Methodology source files live in
# ../ai-marketing-agency/clients/<slug>/ but that sibling directory does
# not exist in Vercel's serverless function bundle, so we copy them into
# THIS project's data/clients/<slug>/ where they get bundled and shipped.
#
# Re-run whenever a client's source methodology changes, then commit the
# updated data/clients/<slug>/*.md files and deploy.
#
#   ./scripts/sync-clients.sh                # syncs all registered clients
#   ./scripts/sync-clients.sh virtus         # syncs just one client

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AGENCY_ROOT="$PROJECT_ROOT/../ai-marketing-agency/clients"

# Registered client slugs. Add new ones here when registering them in
# src/lib/clients/registry.ts.
ALL_CLIENTS=(virtus)

# Filter by arg if provided
if [ "$#" -gt 0 ]; then
  CLIENTS=("$@")
else
  CLIENTS=("${ALL_CLIENTS[@]}")
fi

FILES=(methodology.md anti-methodology.md brand-voice.md compliance-rules.md)

for client in "${CLIENTS[@]}"; do
  src_dir="$AGENCY_ROOT/$client"
  dest_dir="$PROJECT_ROOT/data/clients/$client"

  if [ ! -d "$src_dir" ]; then
    echo "Error: source $src_dir not found"
    continue
  fi

  mkdir -p "$dest_dir"
  echo "Syncing $client..."

  for f in "${FILES[@]}"; do
    if [ ! -f "$src_dir/$f" ]; then
      echo "  WARN $f missing in source, skipping"
      continue
    fi
    cp "$src_dir/$f" "$dest_dir/$f"
    echo "  ok   $f ($(wc -l < "$src_dir/$f" | tr -d ' ') lines)"
  done

  echo ""
done

echo "Done. Commit data/clients/ changes to deploy."
