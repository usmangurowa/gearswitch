---
name: review-pr
description: Collaborative PR review with specialized reviewer personas, portable orchestration across Claude Code teams, Codex sub-agents, opencode subagents, and sequential fallback, plus debate and validation
---

# Team-Based PR Review

Perform a collaborative code review of a pull request using specialized reviewer personas. When the runtime supports multi-agent orchestration, reviewers work in parallel; when it does not, the lead runs the same reviewer roles as lead-mediated subagent jobs or sequential passes. In every runtime, findings are cross-reviewed and debated before producing a unified, high-quality review.

## Review Philosophy

These principles guide how the team evaluates PRs:

1. **Leave the codebase better than we found it.** The current codebase is a useful data point for understanding patterns and conventions, but it is NOT the ceiling. If existing code has problems (missing tests, poor error handling, unclear abstractions), a PR that touches that area should improve it — not perpetuate the issues. Reviewers should not dismiss findings just because "the rest of the codebase does it that way."

2. **Move quickly, keep PRs focused.** We don't want bloated PRs. Review comments should be proportional to the PR's scope — don't try to turn a focused bug fix into a rewrite. But "keep it small" is not an excuse to skip important things like tests or error handling.

3. **Testing is cheap — test the important things.** With AI coding agents, adding unit tests is fast and inexpensive. We don't care about coverage percentages, but we care deeply about testing critical logic, edge cases, and regression scenarios. "The codebase doesn't have many tests" is not a valid reason to skip testing — it's a reason to start.

4. **Question the fundamentals, not just the details.** Good review doesn't just check code quality — it asks whether this is even the right thing to build, whether the approach is sound, and whether the PR should be merged at all. The team should surface these high-level concerns, not just converge on line-level nitpicks.

5. **Hold the PR to end-to-end ownership.** Beyond code quality, evaluate the PR against AGENTS.md `## Engineering Ownership` (the criteria source — don't restate it). The Architecture Skeptic, Code Quality, Test, Security & Reliability, and Product reviewers apply the lens below and the lead folds the verdicts into the human-reviewer summary:
   - **Right problem solved?** Did the change address the actual problem, or just implement a stated solution? (Architecture Skeptic)
   - **Edge cases & failure modes** — important edge cases covered; external/network failures handled (retry/timeout) rather than assumed away. (Code Quality / Security & Reliability)
   - **Data-flow / migration safety & invariants.** (Code Quality / Security & Reliability)
   - **User & UX impact** — for user-facing changes, does it consider what the user sees and does, and make their experience better (we have no separate design/product team)? (Product; or Code Quality / Architecture Skeptic when Product is skipped, e.g. AI-agent-only or docs/infra PRs)
   - **Verification evidence** — for user-visible changes, is there a screenshot/video, and is the change manually confirmed to work? (Product / Test reviewers; or Code Quality / Architecture Skeptic when both are skipped)
   - **Proud to ship / communication** — does the PR description flag new conventions or behavior changes colleagues need to know?
