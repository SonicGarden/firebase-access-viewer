---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---
# Vitest Rules

## Principles

- Globalsモードを使用（`describe`/`it`/`expect`/`vi`を`vitest`からimportしない）
- テストファイル冒頭に`/// <reference types="vitest/globals" />`を記述（型解決のため）
- テストは対象モジュールと同階層の`__tests__/`配下に配置（`*.test.ts`）
- `it()`の説明文は日本語で記述（`describe`は英語の対象名、`it`は日本語の振る舞い説明）
- パラメトリックテストは`it.each`で表現（配列/テンプレートリテラル形式）
- 時刻依存のテストは`vi.spyOn(Date.prototype, 'toLocaleTimeString')`でモックし、`afterEach`で`vi.restoreAllMocks()`

## Examples
When in doubt: ./vitest.examples.md
