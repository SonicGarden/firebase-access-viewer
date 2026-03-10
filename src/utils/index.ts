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

export const isSuccessfulRequest = ({ response: { status } }: { response: { status: number } }) =>
  Math.floor(status / 100) === 2;
