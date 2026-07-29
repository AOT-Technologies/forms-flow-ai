#!/usr/bin/env bash
# =============================================================================
# bump-release-version-mac.command
#
# Updates the formsflow release version across all project files.
#
# Usage:
#   • Double-click in Finder (opens Terminal with a native macOS dialog)
#   • Or from the terminal: bash scripts/version-bump-cli/bump-release-version-mac.command
# =============================================================================

set -uo pipefail

# ── Locate repo root (script lives at scripts/version-bump-cli/) ──────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION_FILE="$REPO_ROOT/VERSION"

# ── Helpers ───────────────────────────────────────────────────────────────────
_info()  { echo "  $*"; }
_ok()    { echo "  ✓  $*"; }
_fail()  { echo "  ✗  $*" >&2; }
_title() { echo ""; echo "── $* ──"; }
_pause() { echo ""; read -rsp "Press any key to close…" -n1 2>/dev/null || true; echo ""; }

_alert() {
  # Native macOS alert, silent fall-through on non-macOS
  command -v osascript &>/dev/null \
    && osascript -e "display alert \"$1\" message \"$2\" as critical" &>/dev/null || true
}

# ── Read current version ──────────────────────────────────────────────────────
if [[ ! -f "$VERSION_FILE" ]]; then
  echo "ERROR: VERSION file not found at $VERSION_FILE" >&2
  _pause; exit 1
fi

CURRENT="$(tr -d '[:space:]' < "$VERSION_FILE" | sed 's/^v//')"

# ── Prompt for new version ────────────────────────────────────────────────────
NEW=""
if command -v osascript &>/dev/null; then
  # Native macOS dialog — shows current version, user types new one
  NEW="$(osascript 2>/dev/null <<APPLESCRIPT
    set d to display dialog "Current version:  $CURRENT" & return & return & "Enter new release version:" \
      default answer "$CURRENT" \
      with title "Formsflow Version Bump" \
      buttons {"Cancel", "Update"} \
      default button "Update"
    return text returned of d
APPLESCRIPT
  )" || { echo "Cancelled."; _pause; exit 0; }
else
  printf "Current version: %s\nEnter new version: " "$CURRENT"
  read -r NEW
fi

# Strip any accidental whitespace
NEW="${NEW//[[:space:]]/}"

# ── Validate ──────────────────────────────────────────────────────────────────
if [[ -z "$NEW" ]]; then
  echo "No version entered. Cancelled."
  _pause; exit 0
fi

if ! [[ "$NEW" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
  _alert "Invalid version format" "Got: \"$NEW\"  —  Expected: X.Y.Z or X.Y.Z-rc"
  echo "ERROR: Invalid version format \"$NEW\". Expected X.Y.Z or X.Y.Z-rc." >&2
  _pause; exit 1
fi

if [[ "$NEW" == "$CURRENT" ]]; then
  echo "New version equals current ($CURRENT). Nothing to do."
  _pause; exit 0
fi

_title "Formsflow Version Bump"
_info "From : $CURRENT"
_info "To   : $NEW"

# Base versions strip any pre-release suffix (e.g. 8.3.0.dev0 → 8.3.0).
# Used for the README badge URL which is always vX.Y.Z-<color> not vX.Y.Z-alpha.
BASE_CUR="${CURRENT%%-*}"
BASE_NEW="${NEW%%-*}"

# ── File registry ─────────────────────────────────────────────────────────────
# GLOBAL_FILES  — every occurrence of the version string is replaced.
# JSON_PKG_FILES — only the package's own "version" field is replaced (lines ≤ 15).
#                  npm dependency versions that coincidentally match are left alone.

GLOBAL_FILES=(
  "VERSION"
  "forms-flow-api/setup.cfg"
  "forms-flow-api-utils/setup.py"
  "forms-flow-data-layer/setup.cfg"
  "forms-flow-documents/setup.cfg"
  "jobs/sentiment-analysis/setup.cfg"
  "deployment/docker/docker-compose.yml"
  "deployment/docker/sample.env"
  "forms-flow-web-root-config/docker-compose.yml"
  "forms-flow-web-root-config/sample.env"
  "forms-flow-web-root-config/src/index.ejs"
)

# package.json and package-lock.json: the root "version" field appears within
# the first 15 lines; everything beyond that belongs to npm dependency entries.
JSON_PKG_FILES=(
  "forms-flow-web/package.json"
  "forms-flow-web/package-lock.json"
  "forms-flow-web-root-config/package.json"
  "forms-flow-web-root-config/package-lock.json"
)

# pom.xml files: <version> is at line ~9, well within the first 15 lines.
# Dependency <version> tags appear much later and must not be touched.
POM_FILES=(
  "forms-flow-bpm/pom.xml"
  "forms-flow-bpm/pom-default.xml"
  "forms-flow-bpm/forms-flow-bpm-camunda/pom.xml"
  "forms-flow-bpm/forms-flow-bpm-utils/pom.xml"
)

# ── Replace ───────────────────────────────────────────────────────────────────
_title "Updating"

CHANGED=0
FAILED=()
SKIPPED=0

# Export for use inside perl
export FF_CUR="$CURRENT" FF_NEW="$NEW" FF_BASE_CUR="$BASE_CUR" FF_BASE_NEW="$BASE_NEW"

_do_replace() {
  local f="$1" rel="$2" perl_expr="$3"
  if [[ ! -f "$f" ]]; then
    _info "SKIP (not found): $rel"
    SKIPPED=$((SKIPPED + 1))
    return
  fi
  if ! grep -qF "$CURRENT" "$f" 2>/dev/null; then
    _info "SKIP (no match): $rel"
    SKIPPED=$((SKIPPED + 1))
    return
  fi
  if perl -i -pe "$perl_expr" "$f" 2>/dev/null; then
    _ok "$rel"
    CHANGED=$((CHANGED + 1))
  else
    _fail "FAILED: $rel"
    FAILED+=("$rel")
  fi
}

_title "Global replacement files"
for rel in "${GLOBAL_FILES[@]}"; do
  _do_replace "$REPO_ROOT/$rel" "$rel" 's/\Q$ENV{FF_CUR}\E/$ENV{FF_NEW}/g'
done

_title "README  (badge URL uses base version)"
# The shields.io badge is release-vX.Y.Z-<color>; the -<color> suffix means a
# plain CURRENT match (which includes -alpha/-rc) won't hit it.  Match on the
# base X.Y.Z part only so 8.3.0-blue → 8.4.0-blue regardless of pre-release tag.
_README="$REPO_ROOT/README.md"
if [[ ! -f "$_README" ]]; then
  _info "SKIP (not found): README.md"
  SKIPPED=$((SKIPPED + 1))
elif ! grep -qF "$BASE_CUR" "$_README" 2>/dev/null; then
  _info "SKIP (no match): README.md"
  SKIPPED=$((SKIPPED + 1))
elif perl -i -pe \
  's|(release-v)\Q$ENV{FF_BASE_CUR}\E(-[a-z]+)|$1$ENV{FF_BASE_NEW}$2|g' \
  "$_README" 2>/dev/null; then
  _ok "README.md"
  CHANGED=$((CHANGED + 1))
else
  _fail "FAILED: README.md"
  FAILED+=("README.md")
fi

_title "Package JSON files  (version field only, lines ≤ 15)"
for rel in "${JSON_PKG_FILES[@]}"; do
  _do_replace "$REPO_ROOT/$rel" "$rel" \
    's/("version":\s*)"\Q$ENV{FF_CUR}\E"/$1"$ENV{FF_NEW}"/g if $. <= 15'
done

_title "POM files  (lines ≤ 15 only)"
for rel in "${POM_FILES[@]}"; do
  _do_replace "$REPO_ROOT/$rel" "$rel" \
    's/\Q$ENV{FF_CUR}\E/$ENV{FF_NEW}/g if $. <= 15'
done

# ── Summary ───────────────────────────────────────────────────────────────────
TOTAL=$(( ${#GLOBAL_FILES[@]} + 1 + ${#JSON_PKG_FILES[@]} + ${#POM_FILES[@]} ))
echo ""
echo "════════════════════════════════════════════════════"
echo "  Done — $CHANGED / $TOTAL file(s) updated  ($SKIPPED skipped)"
echo "  $CURRENT  →  $NEW"
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo ""
  echo "  Failed files:"
  for f in "${FAILED[@]}"; do _fail "$f"; done
fi
echo "════════════════════════════════════════════════════"

_pause
