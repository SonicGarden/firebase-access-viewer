---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript Rules

## Project-specific patterns

- `MessageHandler` - Chrome拡張メッセージ用の共通ハンドラ型（`Promise<boolean>`を返す）
- `Message = { msg: 'request-finished' | 'get-requests' | (string & {}); data?: any }` - 拡張間メッセージの共通型（`string & {}`で文字列リテラル補完を残す）
- `FirestoreRequest` / `StorageRequest` - DevTools networkリクエストの解析対象型
- `FirebaseServiceName = (typeof firebaseServices)[number]['name']` - `as const`配列から派生したservice名union型（stringly-typedを避ける）
- `isSuccessfulStatus(status: number) => boolean` - 2xxステータス判定（`{ response: { status } }`のラッパーではなくflat `number`を受ける）
- `toggleInSet<T>(set: Set<T>, value: T): Set<T>` - 新しい`Set`を返すimmutableトグル（`React.useState<Set<T>>`向け）
- `Request.id` 採番ロジック - `[...data].reverse()` → 同`startedDateTime`連番マップで採番 → `.reverse()`で復帰（新着先頭追加でも既存idがshiftしない）
- `pathFromParsedQuery(parsedValue)` - 未知形状の`unknown`を`typeof === 'string'`ガードで段階的にnarrowしつつ外側をtry/catchで囲む防御的パーサ
- `splitPathSegments(path: string): PathSegment[]` - `collection/id/collection/...`形式のパスを `{ role: 'collection' | 'id' | 'slash'; text: string }[]` に分割（`role: 'collection' | 'id' | 'slash'`のdiscriminated union、区切り`/`も明示的に要素化してレンダリング時のwhitespace崩れを避ける）

## Examples
When in doubt: ./typescript.examples.md
