#!/bin/sh
# Script to copy custom git hooks into the .git/hooks directory

# Get the absolute path of the git root directory
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "❌ Error: Not in a git repository. Please run this script from within a git repository."
  exit 1
fi

HOOKS_DIR="$GIT_ROOT/.git/hooks"
# Define the source directory for custom hooks relative to the script location
SCRIPT_DIR=$(dirname "$0")
SCRIPT_DIR=$(cd "$SCRIPT_DIR" && pwd)  # Convert to absolute path
CUSTOM_HOOKS_DIR="$SCRIPT_DIR/custom-hooks"

# Check if the custom hooks directory exists
if [ ! -d "$CUSTOM_HOOKS_DIR" ]; then
  echo "❌ Error: Custom hooks directory not found"
  exit 1
fi

if [ ! -d "$GIT_ROOT/.git" ]; then
  echo "❌ Error: Git repository not properly initialized"
  exit 1
fi

# Create hooks directory if it doesn't exist
if [ ! -d "$HOOKS_DIR" ]; then
  mkdir -p "$HOOKS_DIR"
fi

# Copy hooks and make them executable
# Copy only the pre-push hook
if [ -f "$CUSTOM_HOOKS_DIR/pre-push" ]; then
    cp "$CUSTOM_HOOKS_DIR/pre-push" "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push"
    echo "ℹ️  Copied pre-push hook."
else
    echo "⚠️  Warning: pre-push hook not found in $CUSTOM_HOOKS_DIR"
fi

echo "✅ Git hooks setup complete!"
exit 0 