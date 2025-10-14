# Custom Git Hooks

This directory contains custom Git hooks and scripts for the forms-flow-ai project.

## Installation

To install the custom pre-push hook, run the installation script from the **root of the repository**:

```bash
sh forms-flow-tools/install-hooks.sh
```

This script will:
1. Copy the `pre-push` hook from `forms-flow-tools/custom-hooks/` into your local `.git/hooks/` directory.
2. Make the `pre-push` hook executable.

**Note:** Ensure you run this script from the repository root, not from within the `forms-flow-tools` directory itself.

## Development Tools & Usage

### Pre-push Hook

*   **Trigger:** Runs automatically before `git push` (installed by the script).
*   **Purpose:** Performs checks before allowing code to be pushed to the remote repository.
*   **Checks Performed:**
    1.  **Changelog Check:**
        *   **Condition:** Checks if `CHANGELOG.md` has been modified in the commits being pushed.
        *   **Action:** If `CHANGELOG.md` was *not* modified, it displays a warning and asks for confirmation to proceed with the push.
        *   **Outcome:** Helps remind developers to update the changelog before pushing significant changes.
    2.  **Web Directory Checks (`forms-flow-web/`):
        *   **Condition:** These checks run only if changes are detected within the `forms-flow-web/` directory for the commits being pushed.
        *   **Confirmation:** Asks the user if they want to run the web checks before proceeding.
        *   **Checks (if confirmed):**
            *   **Dependency Check:** Verifies if `forms-flow-web/node_modules` exists. Aborts push if not found, prompting `npm install`.
            *   **Linting:** Runs `npm run lint`. Aborts push on failure.
            *   **Testing:** Runs `npm run test`. Aborts push on failure.
        *   **Outcome:** Ensures a baseline quality check (dependencies, linting, tests) for the web frontend if changes are present and the user opts to run the checks.

## Skipping Hooks

You can bypass the pre-push hook using the `--no-verify` flag:

*   Skip pre-push hook (bypass changelog check, linting, and testing):
    ```bash
    git push --no-verify
    ```

**Note:** Use this bypass option with caution, as it skips important quality checks.
