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

  it('/o/がないURLではundefinedを返す', () => {
    const request: StorageRequest = {
      method: 'GET',
      url: 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com',
    };
    expect(storagePaths(request)).toBeUndefined();
  });
});

describe('requestHistory', () => {
  beforeEach(() => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Firestoreリクエストを正しく変換する', () => {
    const data = [
      {
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
                        structuredQuery: { from: [{ collectionId: 'users' }] },
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
        startedDateTime: '2024-01-01T12:00:00Z',
      },
    ];

    const result = requestHistory(data);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      requestedAt: '12:00:00',
      method: 'POST',
      service: 'firestore',
      status: 200,
      paths: 'users',
    });
    expect(result[0].data).not.toBeNull();
  });

  it('Storageリクエストを正しく変換する', () => {
    const data = [
      {
        request: {
          method: 'GET',
          url: 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/images%2Fphoto.jpg',
        },
        response: { status: 200 },
        startedDateTime: '2024-01-01T12:00:00Z',
      },
    ];

    const result = requestHistory(data);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      requestedAt: '12:00:00',
      method: 'GET',
      service: 'storage',
      status: 200,
      paths: 'images/photo.jpg',
    });
    expect(result[0].data).toBeNull();
  });

  it('空配列で空配列を返す', () => {
    expect(requestHistory([])).toEqual([]);
  });
});
