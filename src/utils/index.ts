export const firebaseServices = [
  {
    name: 'firestore',
    match: (url: string) => url.match(/firestore/),
  },
  {
    name: 'storage',
    match: (url: string) => url.match(/firebasestorage/),
  },
] as const;

export type FirebaseServiceName = (typeof firebaseServices)[number]['name'];

export const isSuccessfulStatus = (status: number) => Math.floor(status / 100) === 2;
