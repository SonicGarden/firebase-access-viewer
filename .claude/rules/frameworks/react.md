---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---
# React Rules

## Principles

- メモ化（`memo` / `useCallback` / `useMemo`）は**必要なときのみ**適用する（React公式の方針に従い、早すぎる最適化を避ける）
  - 適用が妥当なケース: 親の再レンダリングが頻繁で子のレンダリングコストが高い、`memo`化された子にpropsとして渡す関数/値、重い計算の再利用
  - 単純な式の派生値やルートで一度しか描画されないページは素のまま書く
- Props型はコンポーネント引数にインラインで記述（単純なもの）。ジェネリクスや`ReactNode`を多数含む複雑なpropsは`type`として切り出して良い
- エクスポート形式は使い分け（再利用コンポーネントは名前付きexport、ページは`export default`）
- エントリファイルは`import { StrictMode } from 'react'`を使用（default importの`import React from 'react'`は新JSX Transform下では不要）
- Hookは`react`から名前付きimport
- スタイリングはTailwindクラスをJSXに直書き（CSS Moduleは使わない）
- 可変なクラス名は`clsx`（必要なら`tailwind-merge`併用）で組み立てる

## Examples
When in doubt: ./react.examples.md
