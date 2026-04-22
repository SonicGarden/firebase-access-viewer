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

### TDD適用対象は純粋ロジック
**Good:**
```ts
// 1. まず tests を書いて red を確認（まだ splitPathSegments は未実装）
// src/utils/__tests__/pathSegments.test.ts
describe('splitPathSegments', () => {
  it('空文字の場合は空配列を返す', () => {
    expect(splitPathSegments('')).toEqual([]);
  });
  it('collection/id の2セグメントはスラッシュを挟んで返す', () => {
    expect(splitPathSegments('users/abc')).toEqual([
      { role: 'collection', text: 'users' },
      { role: 'slash', text: '/' },
      { role: 'id', text: 'abc' },
    ]);
  });
  // ...
});

// 2. 実装で green
// src/utils/pathSegments.ts
export const splitPathSegments = (path: string): PathSegment[] => {
  if (!path) return [];
  return path.split('/').flatMap<PathSegment>((text, index) =>
    index === 0
      ? [namedSegment(text, index)]
      : [{ role: 'slash', text: '/' }, namedSegment(text, index)]
  );
};
```
**Bad:**
```tsx
// ビジュアル調整（CSSトークン差替え・JSXレイアウト変更）にユニットテストを要求する
// → 視覚回帰はsnapshotでも拾いづらく、テストのメンテナンスコストに見合わない
test('RequestRowはbg-[var(--bg-expanded)]をクラスに含む', () => {
  // ... ← こういうスタイル表層のassertionは書かない
});
```
- `custom_instructions: "Always use TDD"` は `src/utils/**` の純粋ロジックに適用（`pathSegments`, `requestHistory`, `toggleInSet` 等）
- コンポーネントのビジュアルは `design_handoff_*/` のリファレンスと手動確認で担保（ユニットテスト対象外）
