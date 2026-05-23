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
