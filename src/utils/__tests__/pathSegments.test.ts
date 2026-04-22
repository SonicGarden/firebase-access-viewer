/// <reference types="vitest/globals" />
import { splitPathSegments } from '@/utils/pathSegments';

describe('splitPathSegments', () => {
  it('空文字の場合は空配列を返す', () => {
    expect(splitPathSegments('')).toEqual([]);
  });

  it('単一セグメントはcollectionとして返す', () => {
    expect(splitPathSegments('users')).toEqual([{ role: 'collection', text: 'users' }]);
  });

  it('collection/id の2セグメントはスラッシュを挟んで返す', () => {
    expect(splitPathSegments('users/abc')).toEqual([
      { role: 'collection', text: 'users' },
      { role: 'slash', text: '/' },
      { role: 'id', text: 'abc' },
    ]);
  });

  it('collection/id/collection の3セグメントを交互に分類する', () => {
    expect(splitPathSegments('users/abc/notes')).toEqual([
      { role: 'collection', text: 'users' },
      { role: 'slash', text: '/' },
      { role: 'id', text: 'abc' },
      { role: 'slash', text: '/' },
      { role: 'collection', text: 'notes' },
    ]);
  });

  it('4セグメントは collection/id/collection/id の交互になる', () => {
    expect(splitPathSegments('a/b/c/d')).toEqual([
      { role: 'collection', text: 'a' },
      { role: 'slash', text: '/' },
      { role: 'id', text: 'b' },
      { role: 'slash', text: '/' },
      { role: 'collection', text: 'c' },
      { role: 'slash', text: '/' },
      { role: 'id', text: 'd' },
    ]);
  });

  it('スラッシュ区切りなしのファイル名でもcollection扱いとする', () => {
    expect(splitPathSegments('cover.jpg')).toEqual([{ role: 'collection', text: 'cover.jpg' }]);
  });
});
