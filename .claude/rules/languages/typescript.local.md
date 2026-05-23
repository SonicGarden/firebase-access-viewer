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

## Examples
When in doubt: ./typescript.examples.md
