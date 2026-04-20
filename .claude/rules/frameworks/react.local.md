---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---
# React Rules

## Project-specific patterns

- `useRequestsHistory() → { requests, reset, reload }` - Firebaseリクエスト履歴取得フック（`chrome.runtime`リスナー込み）
- `babel({ presets: [reactCompilerPreset()] })` - React Compiler有効化（`vite.config.ts`、`@vitejs/plugin-react@6.x` + `@rolldown/plugin-babel`）

## Examples
When in doubt: ./react.examples.md
