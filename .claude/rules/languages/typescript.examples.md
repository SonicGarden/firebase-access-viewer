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
