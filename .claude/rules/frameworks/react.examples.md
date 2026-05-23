# React Rules - Examples

## Principles Examples

### メモ化は必要なときのみ適用する

**Good: 親の再レンダリングが頻繁で、行コンポーネントの描画コストが高いケースで`memo`**
```tsx
const RequestRow = memo(({ request, onDataClick }: { request: Request; onDataClick: (data: ModalData) => void }) => {
  // ... 100件分ループで描画される
});
```

**Good: `memo`化された子にpropsで渡す関数は`useCallback`**
```tsx
const handleDataClick = useCallback((data: ModalData) => {
  setModalData(data);
  setShowsModal(true);
}, []);

return <RequestRow request={request} onDataClick={handleDataClick} />;
```

**Good: 重い計算のみ`useMemo`**
```tsx
const sortedRequests = useMemo(
  () => [...requests].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
  [requests],
);
```

**Bad: 単純な式に`useMemo`（過剰最適化）**
```tsx
const requestCount = useMemo(() => (requests || []).length, [requests]);
const count = useMemo(() => (requestCount < 100 ? requestCount.toString() : ':D'), [requestCount]);
```
→ こう書く:
```tsx
const requestCount = (requests || []).length;
const count = requestCount < 100 ? requestCount.toString() : ':D';
```

**Bad: `memo`化されていない子に渡す関数を`useCallback`（意味がない）**
```tsx
const handleClick = useCallback(() => setOpen(true), []);
return <button onClick={handleClick}>Open</button>; // buttonはmemoではない
```

**Good: React Compiler有効下の新規コードは素のまま書く（Compilerが自動メモ化）**
```tsx
const Popup = () => {
  const { requests, reset, reload } = useRequestsHistory();
  const handleDataClick = (data: ModalData) => {
    setModalData(data);
    setShowsModal(true);
  };
  // `useCallback` を巻かなくてもCompilerが必要に応じてメモ化する
  return <RequestRow onDataClick={handleDataClick} />;
};
```

**Bad: Compiler導入を理由に既存の`memo` / `useCallback`を機械的に剥がす**
```tsx
// 既存コードはそのまま保持する。剥がす場合は別タスクで個別判断
const RequestRow = ({ request, onDataClick }: { /* ... */ }) => { /* ... */ };
```

### Props型はシンプルならインライン、複雑なら切り出す

**Good: シンプルなpropsはインライン**
```tsx
export const Button = ({ children, onClick, className }: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  // ...
};
```

**Good: 複雑なら`type`で切り出す**
```tsx
type ModalProps = {
  title: string;
  body: ReactNode;
  show: boolean;
  onClickClose: () => void;
};

export const Modal = ({ title, body, show, onClickClose }: ModalProps) => {
  // ...
};
```

### エクスポート形式の使い分け
**Good:**
```tsx
// src/components/Button.tsx - 再利用コンポーネント
export const Button = (/* ... */) => { /* ... */ };

// src/components/pages/Popup.tsx - ページ
const Popup = () => { /* ... */ };
export default Popup;
```
**Bad:**
```tsx
// src/components/Button.tsx
const Button = (/* ... */) => { /* ... */ };
export default Button;
```

### エントリは`StrictMode`を名前付きimport、他はHookを名前付きimport
**Good:**
```tsx
// src/popup.tsx (エントリ)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Popup from '@/components/pages/Popup';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);

// src/components/pages/Popup.tsx
import { useState, useCallback } from 'react';
```
**Bad:**
```tsx
// エントリ: 新JSX Transform下では不要なdefault import
import React from 'react';
import ReactDOM from 'react-dom/client';

// 他ファイル: default importを混ぜる
import React, { useState, useCallback } from 'react';
```

### 可変なクラス名は`clsx`で組み立てる
**Good:**
```tsx
import clsx from 'clsx';

<th className={clsx('text-left overflow-auto max-w-md', request.data && 'cursor-pointer')}>
<button className={clsx('p-1 bg-gray-200 border border-black border-solid rounded-md', className)}>
```
**Bad:**
```tsx
// 条件分岐が増えるとネストが深くなり可読性が落ちる
<th className={`text-left overflow-auto max-w-md ${request.data ? 'cursor-pointer' : ''}`}>
<button className={`p-1 bg-gray-200 border border-black border-solid rounded-md ${className || ''}`}>
```

## Project-specific Examples

### `useRequestsHistory() → { requests, reset, reload }`
```tsx
const Popup = () => {
  const { requests, reset, reload } = useRequestsHistory();
  // requests: Request[] | undefined
  // reset: () => void  （chrome runtime経由でクリア要求）
  // reload: () => void （chrome runtime経由で再取得）
  return (
    <>
      <Button onClick={reload}>Reload</Button>
      <Button onClick={reset}>Clear</Button>
      {/* ... */}
    </>
  );
};
```

### `usePrefersDark() => boolean`
```ts
// src/hooks/usePrefersDark.ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

export const usePrefersDark = () => {
  const [isDark, setIsDark] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    // init時点とeffectマウント時点で値がズレうる（StrictModeの二重mount等）ため再読込
    setIsDark(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mql.addEventListener('change', handler);
    return () => {
      mql.removeEventListener('change', handler);
    };
  }, []);

  return isDark;
};
```
- `useState` のinitializerで初期値を取るが、effect内で `mql.matches` を再読込して race を避ける
- Chrome extension popup は寿命が短いためrootへliftするほどの効果はなく、利用箇所（`JsonView`）から直接呼んでよい

### `ExpandableRow`
```tsx
// src/components/ExpandableRow.tsx — 展開可能行の共有leaf
type ExpandableRowProps = {
  expanded: boolean;
  onToggle: () => void;   // ← id/path bind は呼び出し側
  header: ReactNode;
  body?: ReactNode;
  disabled?: boolean;
  headerClassName?: string;
};

export const ExpandableRow = ({ expanded, onToggle, header, body, disabled, headerClassName }: ExpandableRowProps) => {
  const interactive = !disabled;
  // role='button' / tabIndex / aria-expanded / Enter|Space keydown を付与
  // ...
};

// 呼び出し側（TimelineView）で id をbindして渡す
<ExpandableRow
  expanded={expandedIds.has(request.id)}
  onToggle={() => onToggle(request.id)}
  header={<RequestHeaderCells request={request} />}
  body={<JsonView data={request.rawQueries} />}
/>

// 呼び出し側（GroupedView）で path をbindして渡す
<ExpandableRow
  expanded={expandedPaths.has(group.path)}
  onToggle={() => onTogglePath(group.path)}
  header={<GroupHeaderCells group={group} />}
  body={<NestedRequestList requests={group.requests} />}
/>
```
- `onToggle: () => void` に統一することで leaf を id / path の意味論から decouple
- `RequestRow` / `GroupRow` どちらの container も同じ leaf を再利用できる

### `JsonView`
```tsx
// src/components/JsonView.tsx
import {
  JsonView as LiteJsonView,
  defaultStyles,
  darkStyles,
  allExpanded, // ← library export (module-level constant)
} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css'; // ← 必須
import { usePrefersDark } from '@/hooks/usePrefersDark';

// syntax色のオーバーライドは base style の classNameに独自クラスを連結する
const withSyntaxColors = (base: typeof defaultStyles) => ({
  ...base,
  label: `${base.label} json-k`,
  stringValue: `${base.stringValue} json-s`,
  numberValue: `${base.numberValue} json-n`,
  booleanValue: `${base.booleanValue} json-b`,
  nullValue: `${base.nullValue} json-b`,
  undefinedValue: `${base.undefinedValue} json-b`,
  otherValue: `${base.otherValue} json-b`,
  punctuation: `${base.punctuation} json-p`,
});
const lightStyles = withSyntaxColors(defaultStyles);
const darkStylesTokens = withSyntaxColors(darkStyles);

export const JsonView = ({ data }: { data: unknown }) => {
  const isDark = usePrefersDark();
  return (
    <LiteJsonView
      data={data as object}
      style={isDark ? darkStylesTokens : lightStyles}
      shouldExpandNode={allExpanded} // 全展開を要求する場合はlibrary export定数を使う
    />
  );
};
```
- CSS を import しないと崩れる（README 指定）
- `shouldExpandNode` は目的に応じてlibrary exportの定数を使う: `allExpanded`（全展開） / `collapseAllNested`（トップレベルのみ展開）。自前で `(level) => level < 1` などを書くと毎レンダで新しい参照になる
- syntax色の上書きはstyle propの各キー（`stringValue`/`numberValue`/`punctuation`等）に `popup.css` で定義した`.json-s` / `.json-n` / `.json-p`等を連結し、色は OKLCHトークン（`var(--json-string)`等）側で管理する
- dark切替は `prefers-color-scheme` media query 経由（Tailwind の `darkMode: 'media'` と揃える）

### 展開state分離: `expandedRequestIds` / `expandedPaths`
**Good:**
```tsx
const [expandedRequestIds, setExpandedRequestIds] = useState<Set<string>>(new Set());
const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

const toggleRequest = (id: string) => setExpandedRequestIds((prev) => toggleInSet(prev, id));
const togglePath = (path: string) => setExpandedPaths((prev) => toggleInSet(prev, path));

const reset = () => {
  setExpandedRequestIds(new Set());
  setExpandedPaths(new Set());
  resetRequests();
};
```
**Bad:**
```tsx
// 単一Setにprefix namespaceすると groupKey() ヘルパーが必要になり、片方だけクリアする操作がしづらい
const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
const groupKey = (kind: 'req' | 'path', value: string) => `${kind}:${value}`;
// ...
setExpandedIds((prev) => toggleInSet(prev, groupKey('req', id)));
```
- requests と paths では semantic が異なり、`reset` 時に両方独立にクリアできるほうが素直
- TypeScript 側で id / path の型を混同しないためにも分離が明確

### `babel({ presets: [reactCompilerPreset()] })`
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), crx({ manifest })],
});
```
- `@vitejs/plugin-react@6.x` は oxc/rolldown ベースで Babel 統合を持たないため、`@rolldown/plugin-babel` を別プラグインとして追加し、そこに `reactCompilerPreset()` を渡す
- `react()` と `babel()` は独立したプラグインとして `plugins` 配列に並べる
- React 19 では `react-compiler-runtime` が組込まれるため追加の依存は不要（React 17/18 を対象にする場合のみ `reactCompilerPreset({ target: '17' })` 等を指定）
- `devDependencies` に `babel-plugin-react-compiler` / `@rolldown/plugin-babel` を追加（`@rolldown/plugin-babel` は `@vitejs/plugin-react@6.x` の peer dependency 扱い）

### `ExpandableRow`の`headerGridTemplate` / `rowHeight`はrequired
```tsx
// src/components/ExpandableRow.tsx
type ExpandableRowProps = {
  expanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  body?: ReactNode;
  disabled?: boolean;
  headerClassName?: string;
  headerGridTemplate: string; // ← optional + flex fallback にしない
  rowHeight: number;          // ← 両callerとも固定高さを渡す
};

// 両callerが常に明示的に渡している（dead-codeのfallback不要）
// RequestRow: GRID_TEMPLATE = '68px 44px 84px 1fr auto 14px' / rowHeight={30}
// GroupRow:   別のgrid template / rowHeight は group行固有
```
- 「optional + fallback」にしない理由: 使われない分岐は保守時に実装意図を曖昧にし、外部仕様として後方互換を保つ必要が生まれる。callerが全部埋めているならrequiredのほうが明快

### `CopyJsonButton` - `setTimeout` cleanup パターン
```tsx
const COPY_FEEDBACK_MS = 1200;

const CopyJsonButton = ({ data }: { data: unknown }) => {
  const [copied, setCopied] = useState(false);
  // ブラウザ/Node 両対応の番号型
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);

  // unmount時に pending timer をキャンセル（setState警告防止）
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation(); // 親のtoggleを奪わない
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      clearTimeout(timerRef.current); // 再クリック時の旧タイマーを破棄
      timerRef.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch (err) {
      console.warn('[firebase-access-viewer] copy failed', err);
    }
  };
  // ...
};
```

### `/` ショートカットと`Esc`クリア
```tsx
// src/components/pages/Popup.tsx — `/`で filter focus
const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el.isContentEditable;
};

useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== '/') return;
    if (isTypingTarget(document.activeElement)) return; // 入力中は素通し
    e.preventDefault();
    filterRef.current?.focus();
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, []);

// src/components/FilterInput.tsx — Escで値クリア + blur
onKeyDown={(e) => {
  if (e.key === 'Escape') {
    onChange('');
    e.currentTarget.blur();
  }
}}
```

### `manifestVersion` は module-scope IIFEでfreeze
```tsx
// src/components/pages/Popup.tsx
const MANIFEST_VERSION = (() => {
  try {
    return chrome?.runtime?.getManifest?.().version ?? '1.1.0';
  } catch {
    return '1.1.0';
  }
})();

const Popup = () => {
  // ... 毎レンダで chrome.runtime.getManifest() を呼ばない
  return <footer>... v{MANIFEST_VERSION}</footer>;
};
```
- extension外の単体プレビュー（`chrome`が未定義）でも壊れない（optional chaining + try/catch）
- module scope で一度だけ評価 → 描画のたびに IPC 相当のAPIを叩かない
