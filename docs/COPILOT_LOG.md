# Copilot Log

## Request

The user asked for a short `.github/copilot-instructions.md` proposal based on `CLAUDE.md`, with code and documentation in English and explanations to the team in Turkish. The proposal had to distinguish current features from planned features, and the file was not to be created until the user approved it.

The user then asked to:

1. Check Git status and create a `codex/copilot-instructions` branch while preserving uncommitted changes.
2. Replace the broad external-service rule with guidance to keep application review inference local through Ollama, require explicit approval before introducing cloud inference, and never include secrets or confidential client code in external AI prompts.
3. Explain that the prompt-injection guard is a heuristic used in the Ollama review path and may produce false positives or miss attacks.
4. Create `.github/copilot-instructions.md` with correctly closed Markdown code blocks.
5. Record this request, the proposal summary, and the review corrections in this log in English.
6. Inspect the diff and explain the result without committing or pushing.

## Proposal summary

The instructions describe Prism's current FastAPI, frontend, fake-model, Ollama, validation, dashboard, test, and CI behavior. They explicitly state that GitHub API integration is not implemented. They also define the English-for-code/documentation and simple-Turkish-for-team-explanations convention, repository boundaries, API-contract caution, safety requirements, and focused validation commands.

## Review corrections applied

- Scoped the inference rule to local Ollama use and added the explicit-approval requirement for cloud inference.
- Added the prohibition on putting secrets or confidential client code in external AI prompts.
- Documented the Ollama-path prompt-injection guard as heuristic, including both false positives and missed attacks.
- Kept the GitHub integration limitation explicit so planned or absent behavior is not presented as current functionality.
- Used a complete fenced shell code block for the validation commands.

## Verification

- `git status --short --branch` was run before creating the branch; the working tree was clean on `main`.
- The `codex/copilot-instructions` branch was created successfully.
- The diff was inspected after the files were added.
- No commit or push was made.
- Tests were not run as part of this change.
