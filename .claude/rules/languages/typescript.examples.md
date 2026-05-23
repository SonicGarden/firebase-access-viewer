# TypeScript Rules - Examples

## Principles Examples

### 型定義は`type`のみ
**Good:**
```ts
export type Request = {
  requestedAt: string;
  method: string;
  service: string;
  status: number;
  paths: string;
  data: ModalData;
};
```
**Bad:**
```ts
export interface Request {
  requestedAt: string;
  method: string;
  service: string;
  status: number;
  paths: string;
  data: ModalData;
}
```

### シングルクォート統一
**Good:**
```ts
import { Button } from '@/components/Button';
const service = 'firestore';
```
**Bad:**
```ts
import { Button } from "@/components/Button";
const service = "firestore";
```

### パスエイリアス優先
**Good:**
```ts
import type { MessageHandler } from '@/types';
import { isSuccessfulRequest } from '@/utils';
import { requestHistory } from '@/utils/requestHistory';
```
**Bad:**
```ts
import type { MessageHandler } from '../../types';
import { isSuccessfulRequest } from '../utils';
```

### アロー関数 + `const`で定義
**Good:**
```ts
const sleep = async (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

export const firestorePaths = (request: FirestoreRequest) => {
  // ...
};
```
**Bad:**
```ts
async function sleep(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

export function firestorePaths(request: FirestoreRequest) {
  // ...
}
```

### FPスタイル
**Good:**
```ts
export const firebaseServices = [
  { name: 'firestore', match: (url: string) => url.match(/firestore/) },
  { name: 'storage', match: (url: string) => url.match(/firebasestorage/) },
];
```
**Bad:**
```ts
class FirebaseServiceMatcher {
  private services = [/* ... */];
  match(url: string) { /* ... */ }
}
```

### 型インポートは`import type`で分離
**Good:**
```ts
import { memo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Request, ModalData } from '@/hooks/useRequestsHistory';
```
**Bad:**
```ts
import { memo, useCallback, ReactNode } from 'react';
import { Request, ModalData } from '@/hooks/useRequestsHistory';
```

## Project-specific Examples

### `MessageHandler`
```ts
import type { MessageHandler } from '@/types';

const msgRequestFinishedHandler: MessageHandler = async ({ data: requests }) => {
  // ... バッジ更新など
  return true;
};

const handleMessage: MessageHandler = async (message, sender, sendResponse) => {
  const handler = { 'request-finished': msgRequestFinishedHandler }[message.msg as string];
  return await handler?.(message, sender, sendResponse) || true;
};

chrome.runtime.onMessage.addListener(handleMessage);
```

### `Message`
```ts
import type { Message } from '@/types';

const handleMessage = ({ msg, data }: Message) => {
  if (msg !== 'request-finished') return true;
  const reqs = requestHistory(data);
  setRequests(reqs);
  return true;
};
```

### `FirestoreRequest` / `StorageRequest`
```ts
export type FirestoreRequest = {
  method: string;
  url: string;
  postData?: { params: { name: string; value: string }[] };
};

export const firestorePaths = (request: FirestoreRequest) => {
  const { postData } = request;
  return (postData?.params || [])
    .filter(({ name }) => name.startsWith('req'))
    // ...
};
```

### `FirebaseServiceName = (typeof firebaseServices)[number]['name']`
```ts
// src/utils/index.ts
export const firebaseServices = [
  { name: 'firestore', match: (url: string) => url.match(/firestore/) },
  { name: 'storage', match: (url: string) => url.match(/firebasestorage/) },
] as const;

export type FirebaseServiceName = (typeof firebaseServices)[number]['name'];
// → 'firestore' | 'storage'

// 利用側: stringly-typed を排除
export type Request = {
  service: FirebaseServiceName | '';
  // ...
};

const TONE_BY_SERVICE: Record<FirebaseServiceName, string> = {
  firestore: 'bg-orange-100 text-orange-800',
  storage: 'bg-sky-100 text-sky-800',
};
```
- `as const` を付けないと `name` が `string` に widened されて union 型にならない
- サービス追加時は `firebaseServices` に追記するだけで union 型と `Record` のキー必須性が自動追従

### `isSuccessfulStatus(status: number) => boolean`
```ts
// src/utils/index.ts
export const isSuccessfulStatus = (status: number) => Math.floor(status / 100) === 2;

// 呼び出し側: flat number を渡す
const errorCount = requests.filter((r) => !isSuccessfulStatus(r.status)).length;
```
- かつて `isSuccessfulRequest({ response: { status } })` というラッパー形式だったが、利用側がネストを組み立てるコストが高く、flat `number` に統一した
- `chrome.devtools.network.Request` と自前の `Request` 型の両方に渡しやすい

### `toggleInSet<T>(set: Set<T>, value: T): Set<T>`
```ts
// src/utils/toggleInSet.ts
export const toggleInSet = <T>(set: Set<T>, value: T): Set<T> => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

// 利用側（useState<Set<T>> トグル）
const toggleRequest = (id: string) => setExpandedRequestIds((prev) => toggleInSet(prev, id));
const togglePath = (path: string) => setExpandedPaths((prev) => toggleInSet(prev, path));
```
- `Set` をmutableに変更せず新しい `Set` を返すので `useState` に安全
- 展開状態（`expandedRequestIds` / `expandedPaths`）のトグルで共通利用

### `Request.id` 採番ロジック
```ts
// src/utils/requestHistory.ts
export const requestHistory = (data: RawEntry[]) => {
  const list = data || [];
  const counters = new Map<string, number>();
  // 新着先頭順の data を古い順にひっくり返し
  const oldestFirst = [...list].reverse();
  const withIdsOldestFirst = oldestFirst.map((entry) => {
    const n = counters.get(entry.startedDateTime) ?? 0;
    counters.set(entry.startedDateTime, n + 1);
    // 初回は startedDateTime そのまま、衝突時のみ `-n` を suffix
    const id = n === 0 ? entry.startedDateTime : `${entry.startedDateTime}-${n}`;
    return transformEntry(entry, id);
  });
  // 新着先頭順に戻す
  return withIdsOldestFirst.reverse();
};
```
- 配列位置依存（`${startedDateTime}-${index}`）にすると新着プリペンドで既存 id が shift し、`expandedIds` Set が解除される
- 古い順走査で採番するため、新着追加でも既存の連番は不変 → React 側の展開 state が安定

### `pathFromParsedQuery(parsedValue)`
```ts
const pathFromParsedQuery = (parsedValue: unknown): string | undefined => {
  try {
    const { addTarget } = (parsedValue as { addTarget?: unknown }) ?? {};
    const { query, documents } = (addTarget as { query?: unknown; documents?: unknown }) ?? {};
    const { structuredQuery, parent } =
      (query as { structuredQuery?: unknown; parent?: unknown }) ?? {};
    const { from } = (structuredQuery as { from?: { collectionId?: unknown }[] }) ?? {};
    // 各フィールドで typeof === 'string' ガードし、不正値は undefined に落とす
    const parentStr = typeof parent === 'string' ? parent : undefined;
    const parentPath = parentStr?.split('/documents/')[1];
    const firstCollection = from?.[0]?.collectionId;
    const firstCollectionStr = typeof firstCollection === 'string' ? firstCollection : undefined;
    // ...
    return collectionPath || documentPath;
  } catch {
    return undefined;
  }
};
```
- 外部由来の `unknown` を深くnarrowする際、各段で `typeof` ガードし、全体を try/catch で囲む
- 未知の形状・プリミティブ・null いずれが来ても throw せず `undefined` を返す best-effort 方針

### `splitPathSegments(path: string): PathSegment[]`
```ts
// src/utils/pathSegments.ts
export type PathSegment =
  | { role: 'collection'; text: string }
  | { role: 'id'; text: string }
  | { role: 'slash'; text: '/' };

const namedSegment = (text: string, index: number): PathSegment => ({
  role: index % 2 === 0 ? 'collection' : 'id',
  text,
});

export const splitPathSegments = (path: string): PathSegment[] => {
  if (!path) return [];
  return path
    .split('/')
    .flatMap<PathSegment>((text, index) =>
      index === 0
        ? [namedSegment(text, index)]
        : [{ role: 'slash', text: '/' }, namedSegment(text, index)]
    );
};

// 利用側（PathPretty.tsx）: role で色クラスを出し分け
const SEG_CLASS = {
  collection: 'text-[var(--fg)]',
  id: 'text-[var(--fg-muted)]',
  slash: 'text-[var(--fg-dim)] px-px',
} as const;
{splitPathSegments(path).map((segment, i) => (
  <span key={i} className={SEG_CLASS[segment.role]}>{segment.text}</span>
))}
```
- `role: 'slash'` を明示的に要素化する → JSX間のwhitespace折り畳み・コピー時の`/`欠落を避けられる
- `'collection' | 'id' | 'slash'` のdiscriminated unionにしているため `SEG_CLASS[segment.role]` のキー必須性がコンパイルで保証される
