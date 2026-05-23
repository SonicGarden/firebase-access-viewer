# Firebase Access Viewer Project Rules - Examples

## Principles Examples

### コンテキスト間通信は`chrome.runtime.sendMessage({ msg, data })`形式
**Good:**
```ts
chrome.runtime.sendMessage({ msg: 'request-finished', data: requests });
chrome.runtime.sendMessage({ msg: 'clear-requests' });
chrome.runtime.sendMessage({ msg: 'get-requests' }, (response) => { /* ... */ });
```
**Bad:**
```ts
chrome.runtime.sendMessage({ type: 'REQUEST_FINISHED', payload: requests });
chrome.runtime.sendMessage(['request-finished', requests]);
```

### メッセージディスパッチはオブジェクトマップ
**Good:**
```ts
const handleMessage: MessageHandler = async (message, sender, sendResponse) => {
  const handler = {
    'request-finished': msgRequestFinishedHandler,
  }[message.msg as string];
  return await handler?.(message, sender, sendResponse) || true;
};
```
**Bad:**
```ts
const handleMessage: MessageHandler = async (message, sender, sendResponse) => {
  if (message.msg === 'request-finished') {
    return msgRequestFinishedHandler(message, sender, sendResponse);
  }
  return true;
};
```

### Firebaseサービス判定は`firebaseServices`配列経由
**Good:**
```ts
import { firebaseServices } from '@/utils';

if (firebaseServices.some(({ match }) => match(request.request.url))) {
  // ...
}

const service = firebaseServices.find(({ match }) => match(url))?.name || '';
```
**Bad:**
```ts
if (request.request.url.includes('firestore') || request.request.url.includes('firebasestorage')) {
  // ...
}
```

### リクエスト履歴は先頭追加＋`slice(0, 99)`で最大100件
**Good:**
```ts
let requests: {}[] = [];
const handleRequestFinished = (request: chrome.devtools.network.Request) => {
  if (firebaseServices.some(({ match }) => match(request.request.url))) {
    requests = [request, ...requests.slice(0, 99)];
    // ...
  }
};
```
**Bad:**
```ts
const requests: {}[] = [];
requests.push(request);
if (requests.length > 100) requests.shift();
```

### サービスごとの解析関数分離
**Good:**
```ts
// src/utils/requestHistory.ts
export const firestorePaths = (request: FirestoreRequest) => { /* ... */ };
export const storagePaths = (request: StorageRequest) => { /* ... */ };

const paths =
  service === 'firestore'
    ? firestorePaths(request)
    : service === 'storage'
      ? storagePaths(request)
      : '';
```

### パッケージマネージャはpnpm v10
**Good:**
```json
// package.json
{
  "packageManager": "pnpm@10.33.0"
}
```
**Bad:**
```json
// package.json（版数pinなし、yarn/npm想定）
{
  "scripts": {
    "build": "yarn build"
  }
}
```

### pnpm v10はpostinstallスクリプトがデフォルト無効
**Good:**
```json
// package.json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild"
    ]
  }
}
```
**Bad:**
```sh
# postinstall許可なしで install → esbuildのnative binaryが入らずvite buildが失敗
pnpm install
# Warning: Ignored build scripts: esbuild
```
