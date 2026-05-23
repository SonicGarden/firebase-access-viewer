---
reviewer: ask-peer
review_iterations: 3
custom_instructions: |
  Always use TDD. Write tests before implementation.
check_commands:
  - pnpm tsc --noEmit
  - pnpm tsc -p tsconfig.node.json --noEmit
test_commands:
  - Skill(run-tests)
self_retrospective:
  feedback: "./.claude/retrospectives"
---

# Dev Workflow Settings

Project-shared settings for `/dev-workflow`. Personal overrides go in `.claude/dev-workflow.local.md` (gitignored).
