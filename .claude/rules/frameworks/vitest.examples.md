# Vitest Rules - Examples

## Principles Examples

### Globalsモードを使用
**Good:**
```ts
/// <reference types="vitest/globals" />
import { firebaseServices } from '@/utils';

describe('firebaseServices', () => {
  it('Firestore URLにマッチする', () => {
    expect(/* ... */).toBe(/* ... */);
  });
});
```
**Bad:**
```ts
import { describe, it, expect } from 'vitest';
import { firebaseServices } from '@/utils';
```

### テスト配置と命名
**Good:**
```
src/utils/requestHistory.ts
src/utils/__tests__/requestHistory.test.ts
```
**Bad:**
```
src/utils/requestHistory.ts
src/utils/requestHistory.test.ts

tests/utils/requestHistory.test.ts
```

### `it()`の説明文は日本語
**Good:**
```ts
describe('firestorePaths', () => {
  it('コレクションクエリからコレクションIDを抽出する', () => { /* ... */ });
  it('親パスとコレクションIDを結合する', () => { /* ... */ });
  it('postDataがない場合は空文字を返す', () => { /* ... */ });
});
```
**Bad:**
```ts
describe('firestorePaths', () => {
  it('should extract collection id from collection query', () => { /* ... */ });
});
```

### パラメトリックテストは`it.each`
**Good:**
```ts
describe('isSuccessfulRequest', () => {
  it.each([200, 201, 204, 299])('ステータス%iでtrueを返す', (status) => {
    expect(isSuccessfulRequest({ response: { status } })).toBe(true);
  });

  it.each([100, 301, 400, 404, 500, 503])('ステータス%iでfalseを返す', (status) => {
    expect(isSuccessfulRequest({ response: { status } })).toBe(false);
  });
});
```
**Bad:**
```ts
it('200でtrueを返す', () => { /* ... */ });
it('201でtrueを返す', () => { /* ... */ });
it('204でtrueを返す', () => { /* ... */ });
```

### 時刻依存のテスト
**Good:**
```ts
describe('requestHistory', () => {
  beforeEach(() => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Firestoreリクエストを正しく変換する', () => {
    // ... requestedAt: '12:00:00' で検証可能
  });
});
```
