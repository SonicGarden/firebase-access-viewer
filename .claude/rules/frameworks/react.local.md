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
- `JsonView` - `react-json-view-lite`ラッパー。`'react-json-view-lite/dist/index.css'`をモジュール冒頭でimport必須、`shouldExpandNode`は用途に応じてlibrary-exportされた定数（`allExpanded` = 全展開、`collapseAllNested` = トップのみ）を使う（参照安定化が保証される、自前`(level) => level < 1`等を書かない）、`style`は`usePrefersDark()`で`defaultStyles` / `darkStyles`切替、syntax色のproject固有カスタマイズは`{ ...base, stringValue: \`${base.stringValue} json-s\`, numberValue: \`${base.numberValue} json-n\`, ... }`のようにstyleキーにクラスを連結し `popup.css` の`.json-s` / `.json-n` / `.json-k` / `.json-b` / `.json-p` 側でOKLCHトークンを適用
- 展開state分離: `expandedRequestIds: Set<string>` と `expandedPaths: Set<string>` を別 `useState` で持つ（単一Setにprefix namespaceする形は避ける）
- `ExpandableRow` の layout-driven props (`headerGridTemplate: string`, `rowHeight: number`) は optional + flex fallback にせず required にする（両callerが常に渡すため、optionalはdead-code fallback）
- `CopyJsonButton` - Clipboard API成功時に"Copied"表示→N ms 後リセットするパターン。`setTimeout`のidは`useRef<ReturnType<typeof window.setTimeout>>`で保持し、`useEffect`のcleanupで`clearTimeout(timerRef.current)`、再クリック時も前回タイマーを`clearTimeout`してから上書き（unmount後のsetState警告・多重発火を防ぐ）
- Popup全体の`/`キーショートカットは `window.keydown` listenerで実装し、`document.activeElement` が`INPUT` / `TEXTAREA` / `SELECT` / `contentEditable` なら素通し（filter入力中の`/`を奪わない）。`FilterInput`内の`Esc`は値クリア + `blur()`
- `manifestVersion` は `chrome.runtime.getManifest()` を呼ぶが、**モジュールスコープのIIFE + try/catch** でフリーズさせる（毎レンダー呼び出さない、extension外プレビュー実行時に壊れない）

## Examples
When in doubt: ./react.examples.md
