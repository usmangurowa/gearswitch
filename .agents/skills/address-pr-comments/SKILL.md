---
name: address-pr-comments
description: Fetch PR comments, analyze each for validity, fix real issues, and reply + react to all — by default behind an approval gate (summary table + HTML explainer report, then commit/push/reply only on approval); `submit` skips the gate for autonomous flows
argument-hint: "[PR number or URL] [submit]"
allowed-tools: Bash(gh:*), Bash(git:*), Bash(open:*), Read, Glob, Grep, Task, Edit, Write, AskUserQuestion, WebFetch, WebSearch, TeamCreate, TeamDelete, TaskCreate, TaskUpdate, TaskList, TaskGet, SendMessage, ToolSearch, mcp__*Linear*, mcp__clickhouse-cloud__*
context: fork
---

# Address PR Comments

## Pre-flight Status

**Current branch:** !`git branch --show-current`
**Working tree clean:** !`git status --short | head -10`

Fetch all comments on a pull request, deeply analyze each one using a team of specialized teammates, and present recommendations for human review.

## Your Role: Orchestrator

You run on the session model (the skill no longer pins a model); teammates run on the tiers in the table below. They do the legwork — your job is to judge their output, not just relay it:

- **Push back on weak verdicts.** When a teammate's reasoning is thin, contradicts the decision context, or rests on an unverified claim, do not accept it — re-task that teammate with a sharper prompt, or gather the evidence yourself (code, Linear, pr-context, past PRs, ClickHouse).
- **Settle disagreements with evidence, not escalation.** An ESCALATE verdict is an instruction to you first: try to resolve it with the decision context, a targeted query, or a code read. Only genuine product/scope judgment calls reach the user, each with bounding evidence and a recommended default. The target is zero escalations.
- **Back every claim with data.** Claims about impact, frequency, or scale carry their evidence: a query plus its result, file:line, a Linear scope statement, or a past PR. Anything unverified is labeled unverified — never present a guess as fact, and never invent numbers.

The MCP-backed sources (Linear, ClickHouse) are best-effort: use each one only when its MCP is connected, skip it silently when not, and fall back to git history, pr-context, and code reading.

## Modes

- **Review mode (default):** Analyzes all comments and applies candidate fixes to the **working tree only**, then presents two artifacts — a summary table in chat and an HTML explainer report — and **stops**. Nothing is committed, pushed, replied to, or reacted to until the user approves. Automated analysis can produce incorrect recommendations; the gate is what prevents bad fixes from landing and bad replies from being posted. Rejected edits are reverted before anything ships.
- **Submit mode (`submit`):** Skips the approval gate — applies fixes, commits and pushes, then replies and reacts directly. This exists for autonomous invocations (`/callie-slack-loop`, `/watch-and-address`, scheduled runs) where no human is present to approve; passing `submit` is itself the operator's standing approval. Don't use it interactively.
