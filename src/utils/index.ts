export const firebaseServices = [
  {
    name: 'firestore',
    match: (url: string) => url.match(/firestore/),
  },
  {
    name: 'storage',
    match: (url: string) => url.match(/firebasestorage/),
  },
];
