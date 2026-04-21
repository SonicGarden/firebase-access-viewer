---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---
# React Rules

## Project-specific patterns

- `useRequestsHistory() → { requests, reset, reload }` - Firebaseリクエスト履歴取得フック（`chrome.runtime`リスナー込み）
- `babel({ presets: [reactCompilerPreset()] })` - React Compiler有効化（`vite.config.ts`、`@vitejs/plugin-react@6.x` + `@rolldown/plugin-babel`）
- `usePrefersDark() => boolean` - `prefers-color-scheme: dark` を購読するフック。effect内で`setIsDark(mql.matches)`を再読込して初期値race回避、clean-upで`removeEventListener`
- `ExpandableRow` - 展開可能行の共有leafコンポーネント。`onToggle: () => void`でid/pathの紐付けは呼び出し側（`TimelineView` / `GroupedView`）がbindして渡す
- `JsonView` - `react-json-view-lite`ラッパー。`'react-json-view-lite/dist/index.css'`をモジュール冒頭でimport必須、`shouldExpandNode`はモジュールトップレベルで`const expandTopLevel = (level: number) => level < 1;`として定義（参照安定化）、`style`は`usePrefersDark()`で`defaultStyles` / `darkStyles`切替
- 展開state分離: `expandedRequestIds: Set<string>` と `expandedPaths: Set<string>` を別 `useState` で持つ（単一Setにprefix namespaceする形は避ける）

## Examples
When in doubt: ./react.examples.md
