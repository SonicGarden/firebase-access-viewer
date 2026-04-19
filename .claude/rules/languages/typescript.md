---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript Rules

## Principles

- 型定義は`type`のみ（`interface`は使わない、union/交差型で合成）
- シングルクォート統一（ダブルクォート/テンプレートリテラルの不要な使用を避ける）
- パスエイリアス優先（`@/*` → `src/*`、相対パス`../../`は避ける）
- アロー関数 + `const`で定義（`function`宣言は使わない）
- FPスタイル（classを使わない、純粋関数で組み立てる）
- 型インポートは`import type`で分離（ランタイム副作用を避ける）

## Examples
When in doubt: ./typescript.examples.md
