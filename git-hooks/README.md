# Custom Git Hooks

This directory contains custom Git hooks for the forms-flow-ai project and a script to install them.

## Installation

To install the custom hooks into your local `.git/hooks` directory, run the installation script from the **root of the repository**:

```bash
./git-hooks/install-hooks.sh
```

This script will copy all hooks from the `git-hooks/custom-hooks/` directory into your local `.git/hooks/` directory and make them executable.

**Note:** Ensure you run this script from the repository root, not from within the `git-hooks` directory itself.

## Development Notes

### Custom Git Hooks & Alias

This repository includes custom Git hooks located in `git-hooks/custom-hooks/`.

To enable these hooks and create a helpful Git alias for interactive commits, run the installation script:

```bash
sh git-hooks/install-hooks.sh
```

This script does the following:
1.  Installs the hooks to your local `.git/hooks/` directory.
2.  Creates the global Git alias `icommit`.

**Usage:**

Instead of `git commit`, use `git icommit` after staging your changes (`git add`). This command will launch an interactive prompt to help you build a correctly formatted commit message, bypassing the need for a text editor.

```bash
git add .
git icommit
```

## Included Hooks

The following hooks are located in the `custom-hooks/` subdirectory:

### `pre-commit`

*   **Trigger:** Runs automatically when you run `git commit`.
*   **Purpose:** Helps create structured, consistent commit messages following a predefined template.
*   **Recommended Usage:**
    ```bash
    # Stage your changes
    git add .
    
    # Commit without -m flag to use the interactive prompt
    git commit
    ```
    This will guide you through creating a well-structured commit message.
*   **Features:**
    *   Interactive prompts for commit information:
        1.  **Type:** Select from common types (feat, fix, docs, etc.) or specify a custom type
        2.  **Scope:** Optional component/area affected by the change
        3.  **Description:** Main commit message
        4.  **Ticket Number:** Optional ticket reference (auto-detected from branch name if available)
    *   Smart ticket number detection from branch names (e.g., "feature/ABC-123-description")
    *   Uses template from `git-hooks/commit-template.txt`
*   **Message Format:**
    ```
    [ABC-123] feat(auth): add OAuth2 login
    ```
    Where:
    *   `[ABC-123]` - Optional ticket number (auto-detected from branch if available)
    *   `feat` - Type of change (selected from predefined list)
    *   `(auth)` - Optional scope
    *   `add OAuth2 login` - Description

**Benefits of Using the Interactive Prompt:**
*   Ensures consistent commit message format across the team
*   Prevents missing important information
*   Auto-detects ticket numbers from branch names
*   Guides you through selecting appropriate commit types
*   Makes the git history more meaningful and easier to review

**Note:** While you can use `git commit -m "message"` to bypass the interactive prompt, it's recommended to use the hook's guided process to maintain consistency and quality in commit messages.

### `pre-push`

*   **Trigger:** Runs automatically before `git push`.
*   **Purpose:** Checks if the push includes changes within specific project subdirectories and runs relevant checks (linting, tests) for those directories before allowing the push.
*   **Monitored Directories and Checks:**
    *   **`forms-flow-web/`**
        *   **Condition:** Checks are run only if changes are detected within the `forms-flow-web/` directory for the commits being pushed.
        *   **Checks Performed:**
            1.  **Dependency Check:** Verifies if the `forms-flow-web/node_modules` directory exists. If not, the push is aborted with an error message prompting the user to run `npm install` in `forms-flow-web/`.
            2.  **Linting:** Runs `npm run lint` within the `forms-flow-web/` directory. If linting fails, the push is aborted.
            3.  **Testing:** Runs `npm run test` within the `forms-flow-web/` directory. If tests fail, the push is aborted.
        *   **Skipping:** If no changes are detected in `forms-flow-web/`, these checks are skipped for this directory.
        *   **Outcome:** Prevents pushing changes to `forms-flow-web` if its dependencies aren't installed, linting fails, or tests fail. Ensures a baseline quality check for the web frontend before code leaves the local machine.

## Skipping Hooks

You can bypass Git hooks using the `--no-verify` flag:

*   Skip pre-commit hook (bypass commit message formatting):
    ```bash
    git commit -m "your message" --no-verify
    ```

*   Skip pre-push hook (bypass linting and testing):
    ```bash
    git push --no-verify
    ```

**Note:** Use these bypass options with caution, as they skip important quality checks.
