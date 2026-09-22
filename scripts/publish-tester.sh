#!/usr/bin/env bash
# Publishes the tester-only build of deals-step-one to AndrewMaloneBM/deals-test
# (GitHub Pages, root of the main branch). Builds with TESTER_MODE=true so the
# output contains only this prototype: no hub, no other prototypes, no source.
set -euo pipefail

REPO="AndrewMaloneBM/deals-test"
BRANCH="main"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> Building tester mode (baseURL /deals-test/)…"
cd "$ROOT"
# The untracked hub auth gate (app/middleware/hub-auth.global.ts) must not run
# during the tester prerender — it rewrites "/" into a /share/backfunds
# redirect. Set it aside for the build, restore right after.
MIDWASMOVED=0
if [ -d app/middleware ]; then mv app/middleware "$WORK/middleware-backup" && MIDWASMOVED=1; fi
TESTER_MODE=true NUXT_APP_BASE_URL=/deals-test/ npx nuxt generate
if [ "$MIDWASMOVED" = "1" ]; then mv "$WORK/middleware-backup" app/middleware; fi

echo "==> Auditing output for hub references…"
MATCHES=$(grep -rIl -E "BackMarket-SellerXP|SellerXP|Prototype Hub|Rethinking the seller Back Office|BackFunds|Risk Model|Support AI|Deals Adoption|Listing Page explorations|Home explorations|money-tab|tier-dashboard|support-ai|deals-adoption|listing-page-explorations|home-explorations|prototypes/" .output/public || true)
if [ -n "$MATCHES" ]; then
  echo "ERROR: hub references found in tester output:"
  echo "$MATCHES"
  exit 1
fi
echo "    clean — zero hub references."

if ! gh repo view "$REPO" > /dev/null 2>&1; then
  echo "==> Creating repo $REPO..."
  gh repo create "$REPO" --public
fi

echo "==> Staging static output…"
cd "$WORK"
git init -q -b "$BRANCH"
git config user.email "andrew.malone@backmarket.com"
git config user.name "Andrew Malone"
cp -R "$ROOT/.output/public/." .
git add -A
git commit -qm "Tester build $(date -u '+%Y-%m-%d %H:%M UTC')"

echo "==> Force-pushing to $REPO..."
git push -q --force "https://github.com/$REPO.git" "$BRANCH"

echo "==> Ensuring GitHub Pages is enabled (branch: $BRANCH, root)…"
gh api -X POST "repos/$REPO/pages" -f "source[branch]=$BRANCH" -f "source[path]=/" > /dev/null 2>&1 || true

echo "==> Done: https://andrewmalonebm.github.io/deals-test/"
