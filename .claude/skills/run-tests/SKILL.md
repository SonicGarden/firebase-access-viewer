---
name: run-tests
description: Run project tests via subagent to keep main context clean
allowed-tools: Agent, Bash(pnpm test*), Bash(git diff *)
---

# Test Runner

## Process

1. Determine test scope:
   - If $ARGUMENTS contains `--base-commit <sha>`: run `git diff --name-only <sha>` to get changed files (includes committed, staged, and unstaged changes)
   - Otherwise: run `git diff --name-only HEAD` to detect changed files (if HEAD is unavailable or no changed files detected, run all tests)
   - Localized changes → run only tests covering changed modules/files
   - Cross-cutting changes (shared utils, config, tsconfig, vite.config, vitest.config) or unsure → run all tests
2. Spawn a subagent (Agent tool) to execute tests
3. Subagent runs the following test commands in order:
   - `pnpm test` (runs `vitest run` — full suite)
   - For scoped runs: `pnpm test <file-path-or-pattern>` (e.g. `pnpm test src/utils/__tests__/requestHistory.test.ts`)
4. Return the subagent's structured summary to the caller

## Subagent Instructions

> Execute the test commands listed above.
> Return a structured summary with one of three statuses:
>
> **Status: SUCCESS**
> - All tests passed
> - Per-command results: command, pass/fail
>
> **Status: TEST_FAILED**
> - Per-command results: command, pass/fail
> - For failures:
>   - Failed test names
>   - Error messages
>   - Relevant code locations (file:line)
>   - Stack trace excerpt (first meaningful lines showing root cause)
> - Keep the summary concise but include enough detail to fix the issue without re-running
>
> **Status: EXECUTION_ERROR**
> - Command that failed to execute
> - Error output
> - This status is for infrastructure/environment errors, not test failures
