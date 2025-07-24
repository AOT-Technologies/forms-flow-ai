#!/bin/bash

# Script to install the pre-push hook from git-hooks folder to .git/hooks

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SOURCE_FILE="$SCRIPT_DIR/pre-push"
TARGET_FILE="$HOOKS_DIR/pre-push"

echo "Installing pre-push hook..."

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: Source file $SOURCE_FILE not found"
    exit 1
fi

# Check if .git/hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Error: .git/hooks directory not found at $HOOKS_DIR"
    echo "Make sure you're running this script from a git repository"
    exit 1
fi

# Copy the pre-push file
echo "📋 Copying pre-push hook from $SOURCE_FILE to $TARGET_FILE"
cp "$SOURCE_FILE" "$TARGET_FILE"

# Make it executable
echo "🔧 Making pre-push hook executable"
chmod +x "$TARGET_FILE"

echo "✅ Pre-push hook installed successfully!"
echo "The hook will now run automatically before each git push" 