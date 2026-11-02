#Requires -Version 5.1
# =============================================================================
# bump-release-version-windows.ps1
#
# Updates the formsflow release version across all project files.
#
# Usage:
#   • Right-click in File Explorer → "Run with PowerShell"
#   • Or from PowerShell: .\scripts\version-bump-cli\bump-release-version-windows.ps1
#   • If blocked by execution policy, run:
#       powershell -ExecutionPolicy Bypass -File .\scripts\version-bump-cli\bump-release-version-windows.ps1
# =============================================================================

param()

# ── Locate repo root (script lives at scripts/version-bump-cli/) ──────────────
$ScriptDir   = $PSScriptRoot
$RepoRoot    = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$VersionFile = Join-Path $RepoRoot 'VERSION'

# ── Helpers ───────────────────────────────────────────────────────────────────
function _info  ($msg) { Write-Host "  $msg" }
function _ok    ($msg) { Write-Host "  v  $msg" -ForegroundColor Green }
function _fail  ($msg) { Write-Host "  x  $msg" -ForegroundColor Red }
function _title ($msg) { Write-Host ""; Write-Host "-- $msg --" }
function _pause {
    Write-Host ""
    Write-Host "Press any key to close..." -NoNewline
    try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch {}
    Write-Host ""
}

# ── Read current version ──────────────────────────────────────────────────────
if (-not (Test-Path $VersionFile)) {
    Write-Host "ERROR: VERSION file not found at $VersionFile" -ForegroundColor Red
    _pause; exit 1
}

$Current = (Get-Content $VersionFile -Raw).Trim() -replace '^v', ''

# ── Prompt for new version ────────────────────────────────────────────────────
$New = ''
try {
    Add-Type -AssemblyName Microsoft.VisualBasic -ErrorAction Stop
    $New = [Microsoft.VisualBasic.Interaction]::InputBox(
        "Current version:  $Current`r`n`r`nEnter new release version:",
        "Formsflow Version Bump",
        $Current
    )
    if ([string]::IsNullOrEmpty($New)) {
        Write-Host "Cancelled."
        _pause; exit 0
    }
} catch {
    # Fallback to console prompt (e.g. when running headless)
    Write-Host "Current version: $Current"
    $New = Read-Host "Enter new version"
}

$New = $New.Trim()

# ── Validate ──────────────────────────────────────────────────────────────────
if ([string]::IsNullOrEmpty($New)) {
    Write-Host "No version entered. Cancelled."
    _pause; exit 0
}

if ($New -notmatch '^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$') {
    Write-Host "ERROR: Invalid version format `"$New`". Expected X.Y.Z or X.Y.Z-rc." -ForegroundColor Red
    _pause; exit 1
}

if ($New -eq $Current) {
    Write-Host "New version equals current ($Current). Nothing to do."
    _pause; exit 0
}

_title "Formsflow Version Bump"
_info "From : $Current"
_info "To   : $New"

# Base versions strip any pre-release suffix (e.g. 8.3.0.dev0 -> 8.3.0).
# Used for the README badge URL which is always vX.Y.Z-<color> not vX.Y.Z-alpha.
$BaseCur = $Current -replace '-.*$', ''
$BaseNew = $New     -replace '-.*$', ''

# ── File registry ─────────────────────────────────────────────────────────────
# GlobalFiles    — every occurrence of the version string is replaced.
# JsonPkgFiles   — only the package's own "version" field is replaced (lines <= 15).
#                  npm dependency versions that coincidentally match are left alone.
# PomFiles       — <version> tag replaced on lines <= 15 only.

$GlobalFiles = @(
    'VERSION'
    'forms-flow-api/setup.cfg'
    'forms-flow-api-utils/setup.py'
    'forms-flow-data-layer/setup.cfg'
    'forms-flow-documents/setup.cfg'
    'jobs/sentiment-analysis/setup.cfg'
    'deployment/docker/docker-compose.yml'
    'deployment/docker/sample.env'
    'forms-flow-web-root-config/docker-compose.yml'
    'forms-flow-web-root-config/sample.env'
    'forms-flow-web-root-config/src/index.ejs'
)

$JsonPkgFiles = @(
    'forms-flow-web/package.json'
    'forms-flow-web/package-lock.json'
    'forms-flow-web-root-config/package.json'
    'forms-flow-web-root-config/package-lock.json'
)

$PomFiles = @(
    'forms-flow-bpm/pom.xml'
    'forms-flow-bpm/pom-default.xml'
    'forms-flow-bpm/forms-flow-bpm-camunda/pom.xml'
    'forms-flow-bpm/forms-flow-bpm-utils/pom.xml'
)

# ── Replace ───────────────────────────────────────────────────────────────────
$Changed = 0
$Failed  = @()
$Skipped = 0

# Pre-escape version strings for use in regex patterns
$EscCur     = [regex]::Escape($Current)
$EscBaseCur = [regex]::Escape($BaseCur)

_title "Global replacement files"
foreach ($rel in $GlobalFiles) {
    $fp = Join-Path $RepoRoot $rel
    if (-not (Test-Path $fp)) {
        _info "SKIP (not found): $rel"; $Skipped++; continue
    }
    $c = [IO.File]::ReadAllText($fp)
    if ($c.IndexOf($Current) -lt 0) {
        _info "SKIP (no match): $rel"; $Skipped++; continue
    }
    try {
        [IO.File]::WriteAllText($fp, ($c -replace $EscCur, $New))
        _ok $rel; $Changed++
    } catch {
        _fail "FAILED: $rel"; $Failed += $rel
    }
}

_title "README  (badge URL uses base version)"
$ReadmePath = Join-Path $RepoRoot 'README.md'
if (-not (Test-Path $ReadmePath)) {
    _info "SKIP (not found): README.md"; $Skipped++
} else {
    $rc = [IO.File]::ReadAllText($ReadmePath)
    if ($rc.IndexOf($BaseCur) -lt 0) {
        _info "SKIP (no match): README.md"; $Skipped++
    } else {
        try {
            [IO.File]::WriteAllText($ReadmePath,
                ($rc -replace "(release-v)${EscBaseCur}(-[a-z]+)", "`${1}${BaseNew}`${2}"))
            _ok "README.md"; $Changed++
        } catch {
            _fail "FAILED: README.md"; $Failed += "README.md"
        }
    }
}

_title "Package JSON files  (version field only, lines <= 15)"
foreach ($rel in $JsonPkgFiles) {
    $fp = Join-Path $RepoRoot $rel
    if (-not (Test-Path $fp)) {
        _info "SKIP (not found): $rel"; $Skipped++; continue
    }
    $lines = [IO.File]::ReadAllLines($fp)
    if (-not ($lines | Select-Object -First 15 | Where-Object { $_.Contains($Current) })) {
        _info "SKIP (no match): $rel"; $Skipped++; continue
    }
    try {
        $out = 0..($lines.Count - 1) | ForEach-Object {
            if ($_ -lt 15) { $lines[$_] -replace "(`"version`":\s*`")${EscCur}(`")", "`${1}${New}`${2}" }
            else            { $lines[$_] }
        }
        [IO.File]::WriteAllLines($fp, [string[]]$out)
        _ok $rel; $Changed++
    } catch {
        _fail "FAILED: $rel"; $Failed += $rel
    }
}

_title "POM files  (lines <= 15 only)"
foreach ($rel in $PomFiles) {
    $fp = Join-Path $RepoRoot $rel
    if (-not (Test-Path $fp)) {
        _info "SKIP (not found): $rel"; $Skipped++; continue
    }
    $lines = [IO.File]::ReadAllLines($fp)
    if (-not ($lines | Select-Object -First 15 | Where-Object { $_.Contains($Current) })) {
        _info "SKIP (no match): $rel"; $Skipped++; continue
    }
    try {
        $out = 0..($lines.Count - 1) | ForEach-Object {
            if ($_ -lt 15) { $lines[$_] -replace $EscCur, $New }
            else            { $lines[$_] }
        }
        [IO.File]::WriteAllLines($fp, [string[]]$out)
        _ok $rel; $Changed++
    } catch {
        _fail "FAILED: $rel"; $Failed += $rel
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
$Total = $GlobalFiles.Count + 1 + $JsonPkgFiles.Count + $PomFiles.Count
Write-Host ""
Write-Host "===================================================="
Write-Host "  Done -- $Changed / $Total file(s) updated  ($Skipped skipped)"
Write-Host "  $Current  -->  $New"
if ($Failed.Count -gt 0) {
    Write-Host ""
    Write-Host "  Failed files:"
    foreach ($f in $Failed) { _fail $f }
}
Write-Host "===================================================="

_pause
