# Slide copy: Copilot assistance with human review

## On-slide text

**Copilot helped document the project and probe the original guard**

- GitHub Copilot Chat drafted project instructions and ran six targeted guard scenarios.
- Codex supported prompt preparation and review corrections: privacy scope, Unicode case matching, and guard signals versus final human-review decisions.
- The original guard missed four proposed attacks and flagged two normal technical descriptions.
- Findings were recorded in PR #17 and informed the later guard changes in PR #19.

**Evidence:** [PR #17](https://github.com/SuleymanKilincc/prism-review/pull/17) · [Usage log](https://github.com/SuleymanKilincc/prism-review/blob/main/docs/COPILOT_LOG.md) · [Guard follow-up #19](https://github.com/SuleymanKilincc/prism-review/pull/19)

**Scope:** Six selected cases against the original guard, not an accuracy benchmark or a test of Gemma's responses.

## Visual

Use the saved VS Code screenshot showing “Chat with Copilot”, the attached CLAUDE.md file, and the generated instructions. It supports the instruction-drafting step; it does not show the six-scenario execution. Keep the text readable when cropping it for the team's deck.

## Speaker notes

I used GitHub Copilot Chat to draft project instructions and explore the guard's limits. Codex helped prepare the prompts and review the explanations. We corrected an overly broad privacy rule and distinguished regex matching from the final human-review decision. Copilot then ran six cases against the original guard without calling Gemma. Four attack phrases were missed and two normal descriptions were flagged. We recorded the findings honestly; later backend work addressed these cases. These numbers describe selected historical examples, not the current system's general accuracy.
