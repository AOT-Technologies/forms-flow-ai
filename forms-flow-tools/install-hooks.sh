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
# TEMPLATE_FILE="$SCRIPT_DIR/commit-template.txt" - REMOVED

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

# if [ ! -f "$TEMPLATE_FILE" ]; then
#   echo "❌ Error: Commit template file not found"
#   exit 1
# fi

# Copy hooks and make them executable
# cp "$CUSTOM_HOOKS_DIR"/* "$HOOKS_DIR"/ >/dev/null 2>&1
# Copy only the pre-push hook
if [ -f "$CUSTOM_HOOKS_DIR/pre-push" ]; then
    cp "$CUSTOM_HOOKS_DIR/pre-push" "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push"
    echo "ℹ️  Copied pre-push hook."
else
    echo "⚠️  Warning: pre-push hook not found in $CUSTOM_HOOKS_DIR"
fi

# Copy commit template - REMOVED
# cp "$TEMPLATE_FILE" "$HOOKS_DIR"/ >/dev/null 2>&1

# Create the git ffcommit alias globally
echo "ℹ️  Setting up 'git ffcommit' alias..."
# We need the absolute path to the script for the alias
INTERACTIVE_COMMIT_SCRIPT="$CUSTOM_HOOKS_DIR/interactive-commit.sh"
# Ensure the path in the alias command uses forward slashes, even on Windows (Git Bash handles this)
INTERACTIVE_COMMIT_SCRIPT_GIT_PATH=$(echo "$INTERACTIVE_COMMIT_SCRIPT" | sed 's_\\_/_g')

git config --global alias.ffcommit "!sh \"$INTERACTIVE_COMMIT_SCRIPT_GIT_PATH\""
if [ $? -eq 0 ]; then
    echo "✅ 'git ffcommit' alias created successfully!"
else
    echo "⚠️  Warning: Failed to create 'git ffcommit' alias. You may need to create it manually:"
    echo "   git config --global alias.ffcommit '!sh \"$INTERACTIVE_COMMIT_SCRIPT_GIT_PATH\"'"
fi

echo "✅ Git hooks and alias setup complete!"
exit 0 