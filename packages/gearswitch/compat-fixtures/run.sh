#!/usr/bin/env bash
# Compat smoke runner: packs the real gearswitch tarball and installs it
# with npm (not pnpm — workspace-linked resolution would test nothing)
# into a temp dir OUTSIDE the repo, once per supported ai major.
#
# Usage:
#   bash compat-fixtures/run.sh            # run all majors (ai-v5, ai-v6, ai-v7)
#   bash compat-fixtures/run.sh ai-v7      # run a single major
#
# Can be invoked from any cwd; paths are resolved relative to this script.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GEARSWITCH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$GEARSWITCH_DIR/../.." && pwd)"

ALL_MAJORS=(ai-v5 ai-v6 ai-v7)
if [ "$#" -gt 0 ]; then
  MAJORS=("$1")
else
  MAJORS=("${ALL_MAJORS[@]}")
fi

for major in "${MAJORS[@]}"; do
  if [ ! -d "$SCRIPT_DIR/$major" ]; then
    echo "compat-fixtures: unknown fixture '$major' (expected one of: ${ALL_MAJORS[*]})" >&2
    exit 1
  fi
done

echo "compat-fixtures: building gearswitch (pnpm turbo build --filter=gearswitch)..."
(cd "$REPO_ROOT" && pnpm turbo build --filter=gearswitch)

echo "compat-fixtures: packing gearswitch (npm pack)..."
TARBALL_NAME="$(cd "$GEARSWITCH_DIR" && npm pack --silent)"
TARBALL_PATH="$GEARSWITCH_DIR/$TARBALL_NAME"
if [ ! -f "$TARBALL_PATH" ]; then
  echo "compat-fixtures: npm pack did not produce $TARBALL_PATH" >&2
  exit 1
fi
echo "compat-fixtures: packed $TARBALL_PATH"

cleanup_tarball() {
  rm -f "$TARBALL_PATH"
}
trap cleanup_tarball EXIT

for major in "${MAJORS[@]}"; do
  echo "compat-fixtures: --- $major ---"
  fixture_src="$SCRIPT_DIR/$major"
  work_dir="$(mktemp -d "${TMPDIR:-/tmp}/gearswitch-compat-${major}.XXXXXX")"

  cp "$fixture_src/package.json" "$work_dir/package.json"
  cp "$fixture_src/tsconfig.json" "$work_dir/tsconfig.json"
  cp "$fixture_src/smoke.mjs" "$work_dir/smoke.mjs"
  cp "$fixture_src/smoke-types.ts" "$work_dir/smoke-types.ts"

  # Portable in-place sed: GNU sed supports `-i suffix` with no space,
  # BSD/macOS sed requires an explicit (possibly empty) suffix argument.
  if sed --version >/dev/null 2>&1; then
    sed -i "s#file:PLACEHOLDER_TARBALL#file:${TARBALL_PATH}#" "$work_dir/package.json"
  else
    sed -i '' "s#file:PLACEHOLDER_TARBALL#file:${TARBALL_PATH}#" "$work_dir/package.json"
  fi

  if (
    cd "$work_dir" &&
    npm install --no-audit --no-fund &&
    node smoke.mjs &&
    npx tsc --noEmit -p .
  ); then
    echo "compat-fixtures: $major OK"
    rm -rf "$work_dir"
  else
    echo "compat-fixtures: FAILED for $major (left installed fixture at $work_dir for inspection)" >&2
    exit 1
  fi
done

echo "compat-fixtures: all requested majors passed (${MAJORS[*]})"
