/// <reference types="vitest/globals" />
import { firestorePaths, storagePaths, requestHistory } from '@/utils/requestHistory';
import type { FirestoreRequest, StorageRequest } from '@/utils/requestHistory';

describe('firestorePaths', () => {
  it('コレクションクエリからコレクションIDを抽出する', () => {
    const request: FirestoreRequest = {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      postData: {
        params: [
          {
            name: 'req0___data__',
            value: encodeURIComponent(
              JSON.stringify({
                addTarget: {
                  query: {
                    structuredQuery: {
                      from: [{ collectionId: 'users' }],
                    },
                    parent: 'projects/my-app/databases/(default)/documents',
                  },
                },
              })
            ),
          },
        ],
      },
    };
    expect(firestorePaths(request)).toBe('users');
  });

  it('親パスとコレクションIDを結合する', () => {
    const request: FirestoreRequest = {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      postData: {
        params: [
          {
            name: 'req0___data__',
            value: encodeURIComponent(
              JSON.stringify({
                addTarget: {
                  query: {
                    structuredQuery: {
                      from: [{ collectionId: 'messages' }],
                    },
                    parent: 'projects/my-app/databases/(default)/documents/rooms/room1',
                  },
                },
              })
            ),
          },
        ],
      },
    };
    expect(firestorePaths(request)).toBe('rooms/room1/messages');
  });

  it('ドキュメントパスを抽出する', () => {
    const request: FirestoreRequest = {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      postData: {
        params: [
          {
            name: 'req0___data__',
            value: encodeURIComponent(
              JSON.stringify({
                addTarget: {
                  documents: {
                    documents: ['projects/my-app/databases/(default)/documents/users/user1'],
                  },
                },
              })
            ),
          },
        ],
      },
    };
    expect(firestorePaths(request)).toBe('users/user1');
  });

  it('postDataがない場合は空文字を返す', () => {
    const request: FirestoreRequest = {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
    };
    expect(firestorePaths(request)).toBe('');
  });

  it('複数のreqパラメータをカンマ区切りで結合する', () => {
    const request: FirestoreRequest = {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      postData: {
        params: [
          {
            name: 'req0___data__',
            value: encodeURIComponent(
              JSON.stringify({
                addTarget: {
                  query: {
                    structuredQuery: { from: [{ collectionId: 'users' }] },
                    parent: 'projects/my-app/databases/(default)/documents',
                  },
                },
              })
            ),
          },
          {
            name: 'req1___data__',
            value: encodeURIComponent(
              JSON.stringify({
                addTarget: {
                  query: {
                    structuredQuery: { from: [{ collectionId: 'posts' }] },
                    parent: 'projects/my-app/databases/(default)/documents',
                  },
                },
              })
            ),
          },
        ],
      },
    };
    expect(firestorePaths(request)).toBe('users, posts');
  });

  it('reqで始まらないパラメータは無視する', () => {
    const request: FirestoreRequest = {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      postData: {
        params: [
          { name: 'count', value: '2' },
          { name: 'ofs', value: '0' },
        ],
      },
    };
    expect(firestorePaths(request)).toBe('');
  });
});

describe('storagePaths', () => {
  it('URLからファイルパスを抽出する', () => {
    const request: StorageRequest = {
      method: 'GET',
      url: 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/images%2Fphoto.jpg',
    };
    expect(storagePaths(request)).toBe('images/photo.jpg');
  });

  it('エンコードされたURLを正しくデコードする', () => {
    const request: StorageRequest = {
      method: 'GET',
      url: 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/uploads%2F2024%2Ffile%20name.pdf',
    };
    expect(storagePaths(request)).toBe('uploads/2024/file%20name.pdf');
  });

  it('/o/がないURLでは空文字を返す', () => {
    const request: StorageRequest = {
      method: 'GET',
      url: 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com',
    };
    expect(storagePaths(request)).toBe('');
  });
});

describe('firestorePaths defensive cases', () => {
  const buildRequest = (paramValue: unknown): FirestoreRequest => ({
    method: 'POST',
    url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
    postData: {
      params: [{ name: 'req0___data__', value: encodeURIComponent(JSON.stringify(paramValue)) }],
    },
  });

  it.each<[string, unknown, string]>([
    ['parent が文字列でない（parent prefix はスキップして collection 単独を返す）', { addTarget: { query: { parent: 123, structuredQuery: { from: [{ collectionId: 'users' }] } } } }, 'users'],
    ['structuredQuery.from が空配列', { addTarget: { query: { structuredQuery: { from: [] }, parent: 'projects/x/databases/(default)/documents' } } }, ''],
    ['documents 内の要素が文字列でない', { addTarget: { documents: { documents: [123] } } }, ''],
    ['parsedValue がプリミティブ', 'just-a-string', ''],
    ['parsedValue が数値', 42, ''],
    ['parsedValue が null', null, ''],
    ['collectionId が文字列でない', { addTarget: { query: { structuredQuery: { from: [{ collectionId: 999 }] } } } }, ''],
  ])('%s のケースで throw せず期待通りの値を返す', (_, paramValue, expected) => {
    const request = buildRequest(paramValue);
    expect(() => firestorePaths(request)).not.toThrow();
    expect(firestorePaths(request)).toBe(expected);
  });
});

describe('requestHistory', () => {
  beforeEach(() => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const firestoreEntry = (startedDateTime: string, collectionId = 'users') => ({
    request: {
      method: 'POST',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      postData: {
        params: [
          {
            name: 'req0___data__',
            value: encodeURIComponent(
              JSON.stringify({
                addTarget: {
                  query: {
                    structuredQuery: { from: [{ collectionId }] },
                    parent: 'projects/my-app/databases/(default)/documents',
                  },
                },
              })
            ),
          },
        ],
      },
    },
    response: { status: 200 },
    startedDateTime,
  });

  it('Firestoreリクエストの構造をrawQueriesに詰める', () => {
    const result = requestHistory([firestoreEntry('2024-01-01T12:00:00.000Z')]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      requestedAt: '12:00:00',
      method: 'POST',
      service: 'firestore',
      status: 200,
      paths: 'users',
    });
    expect(result[0].rawQueries).toHaveLength(1);
    expect(result[0].rawQueries[0]).toMatchObject({
      addTarget: {
        query: {
          structuredQuery: { from: [{ collectionId: 'users' }] },
          parent: 'projects/my-app/databases/(default)/documents',
        },
      },
    });
  });

  it('StorageリクエストはrawQueriesが空配列', () => {
    const result = requestHistory([
      {
        request: {
          method: 'GET',
          url: 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/images%2Fphoto.jpg',
        },
        response: { status: 200 },
        startedDateTime: '2024-01-01T12:00:00.000Z',
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      requestedAt: '12:00:00',
      method: 'GET',
      service: 'storage',
      status: 200,
      paths: 'images/photo.jpg',
      rawQueries: [],
    });
  });

  it('空配列で空配列を返す', () => {
    expect(requestHistory([])).toEqual([]);
  });

  describe('id採番', () => {
    it('異なるstartedDateTimeならsuffixなし', () => {
      const result = requestHistory([
        firestoreEntry('2024-01-01T12:00:00.500Z'),
        firestoreEntry('2024-01-01T12:00:00.400Z'),
        firestoreEntry('2024-01-01T12:00:00.300Z'),
      ]);
      expect(result.map((r) => r.id)).toEqual([
        '2024-01-01T12:00:00.500Z',
        '2024-01-01T12:00:00.400Z',
        '2024-01-01T12:00:00.300Z',
      ]);
    });

    it('同一startedDateTimeが複数あれば古い順（配列末尾側）から連番付与', () => {
      // data は新着先頭なので、配列末尾が一番古い
      const result = requestHistory([
        firestoreEntry('2024-01-01T12:00:00.000Z', 'third'), // newest (3番目に到着)
        firestoreEntry('2024-01-01T12:00:00.000Z', 'second'), // 2番目に到着
        firestoreEntry('2024-01-01T12:00:00.000Z', 'first'), // oldest (1番目に到着)
      ]);
      // 古い順（first→second→third）に採番し元の並びに戻す
      expect(result.map((r) => r.id)).toEqual([
        '2024-01-01T12:00:00.000Z-2', // third (n=2)
        '2024-01-01T12:00:00.000Z-1', // second (n=1)
        '2024-01-01T12:00:00.000Z', // first (n=0, suffixなし)
      ]);
    });

    it('新着を先頭に追加しても既存要素のidが変わらない（回帰テスト）', () => {
      const existing = [
        firestoreEntry('2024-01-01T12:00:00.200Z'),
        firestoreEntry('2024-01-01T12:00:00.100Z'),
      ];
      const before = requestHistory(existing);
      const idsBefore = before.map((r) => r.id);

      // 新着を先頭に追加
      const withNew = [firestoreEntry('2024-01-01T12:00:00.300Z'), ...existing];
      const after = requestHistory(withNew);

      // 既存2件のidは不変（末尾2件を比較）
      expect(after.slice(1).map((r) => r.id)).toEqual(idsBefore);
      // 新着は先頭
      expect(after[0].id).toBe('2024-01-01T12:00:00.300Z');
    });

    it('同一startedDateTime混在時も新着追加で既存idが変わらない', () => {
      const existing = [
        firestoreEntry('2024-01-01T12:00:00.000Z', 'b'),
        firestoreEntry('2024-01-01T12:00:00.000Z', 'a'),
      ];
      const before = requestHistory(existing);
      const idsBefore = before.map((r) => r.id);
      expect(idsBefore).toEqual(['2024-01-01T12:00:00.000Z-1', '2024-01-01T12:00:00.000Z']);

      const withNew = [firestoreEntry('2024-01-01T12:00:00.500Z', 'c'), ...existing];
      const after = requestHistory(withNew);
      expect(after.slice(1).map((r) => r.id)).toEqual(idsBefore);
    });
  });

  describe('JSON.parse失敗時のフォールバック', () => {
    it('parseに失敗したparamはrawQueriesから除外される', () => {
      const entry = {
        request: {
          method: 'POST',
          url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
          postData: {
            params: [{ name: 'req0___data__', value: '%not-a-valid-json' }],
          },
        },
        response: { status: 200 },
        startedDateTime: '2024-01-01T12:00:00.000Z',
      };
      const result = requestHistory([entry]);
      expect(result[0].rawQueries).toEqual([]);
    });

    it('壊れたentryが混在しても他のentryに影響しない', () => {
      const brokenEntry = {
        request: {
          method: 'POST',
          url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
          postData: {
            params: [
              {
                name: 'req0___data__',
                value: encodeURIComponent(JSON.stringify({ addTarget: { query: { parent: 42 } } })),
              },
            ],
          },
        },
        response: { status: 200 },
        startedDateTime: '2024-01-01T12:00:00.100Z',
      };
      const validEntry = firestoreEntry('2024-01-01T12:00:00.200Z', 'users');
      const result = requestHistory([validEntry, brokenEntry]);
      expect(result).toHaveLength(2);
      expect(result[0].paths).toBe('users');
      expect(result[1].paths).toBe('');
    });

    it('成功/失敗paramが混在した際、成功分のrawQueriesが入力順を保持する', () => {
      const validBody1 = encodeURIComponent(JSON.stringify({ addTarget: { tag: 'valid1' } }));
      const invalidBody = '%invalid-json';
      const validBody2 = encodeURIComponent(JSON.stringify({ addTarget: { tag: 'valid2' } }));
      const entry = {
        request: {
          method: 'POST',
          url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
          postData: {
            params: [
              { name: 'req0___data__', value: validBody1 },
              { name: 'req1___data__', value: invalidBody },
              { name: 'req2___data__', value: validBody2 },
            ],
          },
        },
        response: { status: 200 },
        startedDateTime: '2024-01-01T12:00:00.000Z',
      };
      const result = requestHistory([entry]);
      expect(result[0].rawQueries).toEqual([
        { addTarget: { tag: 'valid1' } },
        { addTarget: { tag: 'valid2' } },
      ]);
    });
  });
});
