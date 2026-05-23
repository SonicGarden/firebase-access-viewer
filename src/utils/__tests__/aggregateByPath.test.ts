/// <reference types="vitest/globals" />
import { aggregateByPath } from '@/utils/aggregateByPath';
import type { Request } from '@/utils/requestHistory';

const req = (overrides: Partial<Request> = {}): Request => ({
  id: overrides.id ?? '2024-01-01T12:00:00.000Z',
  requestedAt: overrides.requestedAt ?? '12:00:00',
  method: overrides.method ?? 'POST',
  service: overrides.service ?? 'firestore',
  status: overrides.status ?? 200,
  paths: overrides.paths ?? 'users',
  rawQueries: overrides.rawQueries ?? [],
});

describe('aggregateByPath', () => {
  it('空配列は空配列を返す', () => {
    expect(aggregateByPath([])).toEqual([]);
  });

  it('異なるパスは別エントリになる', () => {
    const requests = [
      req({ id: '1', paths: 'users' }),
      req({ id: '2', paths: 'posts' }),
    ];
    const result = aggregateByPath(requests);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.path).sort()).toEqual(['posts', 'users']);
  });

  it('paths が空文字の行は集計から除外される', () => {
    const requests = [
      req({ id: '1', paths: '' }),
      req({ id: '2', paths: 'users' }),
    ];
    const result = aggregateByPath(requests);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('users');
  });

  it('カンマ区切りの paths はそのまま 1 グループとして扱う', () => {
    const requests = [
      req({ id: '1', paths: 'users, posts' }),
      req({ id: '2', paths: 'users, posts' }),
    ];
    const result = aggregateByPath(requests);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('users, posts');
    expect(result[0].count).toBe(2);
  });

  describe('isNPlusOneSuspect の境界', () => {
    it.each([
      [1, false],
      [4, false],
      [5, true],
      [10, true],
    ])('count=%i のとき isNPlusOneSuspect は %s', (count, expected) => {
      const requests = Array.from({ length: count }, (_, i) =>
        req({ id: `id-${i}`, paths: 'users' })
      );
      const result = aggregateByPath(requests);
      expect(result[0].isNPlusOneSuspect).toBe(expected);
    });
  });

  it('4xx / 5xx が errorCount に加算される', () => {
    const requests = [
      req({ id: '1', paths: 'users', status: 200 }),
      req({ id: '2', paths: 'users', status: 404 }),
      req({ id: '3', paths: 'users', status: 500 }),
      req({ id: '4', paths: 'users', status: 299 }),
    ];
    const result = aggregateByPath(requests);
    expect(result[0].count).toBe(4);
    expect(result[0].errorCount).toBe(2);
  });

  it('並び順は count desc → 最新 requestedAt desc', () => {
    const requests = [
      req({ id: '1', paths: 'users', requestedAt: '12:00:01' }),
      req({ id: '2', paths: 'users', requestedAt: '12:00:02' }),
      req({ id: '3', paths: 'posts', requestedAt: '12:00:05' }),
      req({ id: '4', paths: 'posts', requestedAt: '12:00:06' }),
      req({ id: '5', paths: 'comments', requestedAt: '12:00:09' }),
    ];
    const result = aggregateByPath(requests);
    expect(result.map((r) => r.path)).toEqual(['posts', 'users', 'comments']);
  });

  it('count が同数なら最新 requestedAt desc で並ぶ', () => {
    const requests = [
      req({ id: '1', paths: 'users', requestedAt: '12:00:01' }),
      req({ id: '2', paths: 'posts', requestedAt: '12:00:05' }),
    ];
    const result = aggregateByPath(requests);
    expect(result.map((r) => r.path)).toEqual(['posts', 'users']);
  });

  it('requests はタイムスタンプ降順で並ぶ', () => {
    const requests = [
      req({ id: 'a', paths: 'users', requestedAt: '12:00:01' }),
      req({ id: 'b', paths: 'users', requestedAt: '12:00:05' }),
      req({ id: 'c', paths: 'users', requestedAt: '12:00:03' }),
    ];
    const result = aggregateByPath(requests);
    expect(result[0].requests.map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  describe('services', () => {
    it('重複除去されて firebaseServices 定義順に並ぶ', () => {
      const requests = [
        req({ id: '1', paths: 'users', service: 'storage' }),
        req({ id: '2', paths: 'users', service: 'firestore' }),
        req({ id: '3', paths: 'users', service: 'firestore' }),
      ];
      const result = aggregateByPath(requests);
      expect(result[0].services).toEqual(['firestore', 'storage']);
    });

    it('storage のみ出現時は [storage] のみ（空文字や未定義サービスが混入しない）', () => {
      const requests = [
        req({ id: '1', paths: 'images/a.jpg', service: 'storage' }),
        req({ id: '2', paths: 'images/a.jpg', service: 'storage' }),
      ];
      const result = aggregateByPath(requests);
      expect(result[0].services).toEqual(['storage']);
    });
  });
});
