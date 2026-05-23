/// <reference types="vitest/globals" />
import { firebaseServices, isSuccessfulRequest } from '@/utils';

describe('firebaseServices', () => {
  it('Firestore URLにマッチする', () => {
    const url = 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel';
    const matched = firebaseServices.find(({ match }) => match(url));
    expect(matched?.name).toBe('firestore');
  });

  it('Storage URLにマッチする', () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/images%2Fphoto.jpg';
    const matched = firebaseServices.find(({ match }) => match(url));
    expect(matched?.name).toBe('storage');
  });

  it('無関係なURLにはマッチしない', () => {
    const url = 'https://example.com/api/data';
    const matched = firebaseServices.find(({ match }) => match(url));
    expect(matched).toBeUndefined();
  });

  it('firebasestorageのURLはstorageのみにマッチする', () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/my-app.appspot.com/o/file.txt';
    const matched = firebaseServices.filter(({ match }) => match(url));
    expect(matched).toHaveLength(1);
    expect(matched[0].name).toBe('storage');
  });
});

describe('isSuccessfulRequest', () => {
  it.each([200, 201, 204, 299])('ステータス%iでtrueを返す', (status) => {
    expect(isSuccessfulRequest({ response: { status } })).toBe(true);
  });

  it.each([100, 301, 400, 404, 500, 503])('ステータス%iでfalseを返す', (status) => {
    expect(isSuccessfulRequest({ response: { status } })).toBe(false);
  });
});
