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

### Firebaseサービス名のunion型は`firebaseServices` (`as const`)から派生させる
**Good:**
```ts
// src/utils/index.ts
export const firebaseServices = [
  { name: 'firestore', match: (url: string) => url.match(/firestore/) },
  { name: 'storage', match: (url: string) => url.match(/firebasestorage/) },
] as const;

export type FirebaseServiceName = (typeof firebaseServices)[number]['name'];
// → 'firestore' | 'storage'

// キー必須性が自動追従（新service追加忘れをコンパイルエラーにできる）
const TONE_BY_SERVICE: Record<FirebaseServiceName, string> = {
  firestore: 'bg-orange-100 ...',
  storage: 'bg-sky-100 ...',
};
```
**Bad:**
```ts
// stringly-typed: service名を手書きで各所に散らばらせる
export type Request = { service: 'firestore' | 'storage' | ''; /* ... */ };
if (service === 'firestor') { /* typo が通る */ }
```

### 外部由来データのパースはbest-effort方針
**Good:**
```ts
// param 単位でskip、1件壊れても他は生きる
const parseFirestoreReqParams = (request: FirestoreRequest): unknown[] => {
  const params = request.postData?.params || [];
  return params
    .filter(({ name }) => name.startsWith('req'))
    .map(({ value }): unknown => {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.warn('[firebase-access-viewer] failed to parse request value', e);
        return null;
      }
    })
    .filter((v): v is object => v !== null);
};

// 深いnarrowは typeof ガード + 外側 try/catch
const pathFromParsedQuery = (parsedValue: unknown): string | undefined => {
  try {
    const { parent } = (query as { parent?: unknown }) ?? {};
    const parentStr = typeof parent === 'string' ? parent : undefined;
    // ...
    return collectionPath || documentPath;
  } catch {
    return undefined;
  }
};
```
**Bad:**
```ts
// 1件の decodeURIComponent/JSON.parse エラーで requestHistory() 全体が throw し Popup が白画面になる
const parsed = params.map(({ value }) => JSON.parse(decodeURIComponent(value)));

// unknown を as でキャストして型は通るが実行時に undefined.split 等で落ちる
const parent = (parsedValue as any).addTarget.query.parent as string;
const parentPath = parent.split('/documents/')[1];
```

### Dark mode は Tailwind `darkMode: 'media'` + `usePrefersDark`
**Good:**
```js
// tailwind.config.js — OS の prefers-color-scheme と連動
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './devtools.html', './popup.html'],
  // ...
};
```
```tsx
// 利用側は dark: variant を併記
<div className='text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50'>

// JSライブラリは usePrefersDark で state 同期
const isDark = usePrefersDark();
<LiteJsonView style={isDark ? darkStyles : defaultStyles} data={data} />
```
**Bad:**
```js
// class 戦略 → ルート要素に dark クラスをつける JS が必要になる
export default { darkMode: 'class', /* ... */ };
```

### 独自CSSを要求するライブラリは利用コンポーネント冒頭でimport
**Good:**
```tsx
// src/components/JsonView.tsx
import { JsonView as LiteJsonView, defaultStyles, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css'; // ← README 指定、忘れるとスタイル崩れ
import { usePrefersDark } from '@/hooks/usePrefersDark';
```
**Bad:**
```tsx
// import 忘れ → 実行時に崩れるがビルドは通るので気付きにくい
import { JsonView as LiteJsonView } from 'react-json-view-lite';
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

### pnpmの`minimumReleaseAge: 10080`（7日）を`pnpm-workspace.yaml`に設定
**Good:**
```yaml
# pnpm-workspace.yaml
minimumReleaseAge: 10080
```
**Bad:**
```yaml
# 設定なし（公開直後の malicious バージョンを install してしまう可能性）
# pnpm-workspace.yaml が存在しない、または minimumReleaseAge なし
```

### 依存更新の作業ログ・報告書はリポジトリにコミットしない
**Good:**
```sh
# 報告書はローカル作業ログとして保持するがコミットはしない
# （.claude/plans/ と同様の扱い、必要なら .gitignore で docs/dependency-update-*.md を除外）
git add package.json pnpm-lock.yaml pnpm-workspace.yaml
git commit -m "pnpmのminimumReleaseAgeを7日に設定（セキュリティ対策）"
```
**Bad:**
```sh
# 作業ログを本体コミットに同梱（レビューノイズが増え、履歴の意味も薄まる）
git add docs/dependency-update-2026-04-20.md package.json pnpm-lock.yaml
git commit -m "依存更新"
```
