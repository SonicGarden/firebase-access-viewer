import { firebaseServices } from '@/utils';
import type { FirebaseServiceName } from '@/utils';

export type FirestoreRequest = {
  method: string;
  url: string;
  postData?: { params: { name: string; value: string }[] };
};

export type StorageRequest = {
  method: string;
  url: string;
};

export type Request = {
  id: string;
  requestedAt: string;
  method: string;
  service: FirebaseServiceName | '';
  status: number;
  paths: string;
  rawQueries: unknown[];
};

type RawEntry = {
  request: FirestoreRequest | StorageRequest;
  response: { status: number };
  startedDateTime: string;
};

const parseFirestoreReqParams = (request: FirestoreRequest): unknown[] => {
  const params = request.postData?.params || [];
  return params
    .filter(({ name }) => name.startsWith('req'))
    .map(({ value }): unknown => {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.warn('[firebase-access-viewer] failed to parse request value', e);
        return null;
      }
    })
    .filter((v): v is object => v !== null);
};

const pathFromParsedQuery = (parsedValue: unknown): string | undefined => {
  try {
    const { addTarget } = (parsedValue as { addTarget?: unknown }) ?? {};
    const { query, documents } = (addTarget as { query?: unknown; documents?: unknown }) ?? {};
    const { structuredQuery, parent } =
      (query as { structuredQuery?: unknown; parent?: unknown }) ?? {};
    const { from } = (structuredQuery as { from?: { collectionId?: unknown }[] }) ?? {};
    const parentStr = typeof parent === 'string' ? parent : undefined;
    const parentPath = parentStr?.split('/documents/')[1];
    const firstCollection = from?.[0]?.collectionId;
    const firstCollectionStr = typeof firstCollection === 'string' ? firstCollection : undefined;
    const collectionPath =
      firstCollectionStr &&
      (parentPath ? `${parentPath}/${firstCollectionStr}` : firstCollectionStr);
    const { documents: docs } = (documents as { documents?: unknown[] }) ?? {};
    const firstDocument = docs?.[0];
    const firstDocumentStr = typeof firstDocument === 'string' ? firstDocument : undefined;
    const documentPath = firstDocumentStr?.split('/documents/')[1];
    return collectionPath || documentPath;
  } catch {
    return undefined;
  }
};

const joinPaths = (parsedList: unknown[]) =>
  parsedList
    .map((parsed) => pathFromParsedQuery(parsed))
    .filter((_): _ is string => Boolean(_))
    .join(', ');

export const firestorePaths = (request: FirestoreRequest) =>
  joinPaths(parseFirestoreReqParams(request));

export const storagePaths = (request: StorageRequest): string => {
  const { url } = request;
  const { pathname } = new URL(decodeURIComponent(url));
  return pathname.split('/o/')[1] ?? '';
};

const transformEntry = (entry: RawEntry, id: string): Request => {
  const { request, response, startedDateTime } = entry;
  const { method, url } = request;
  const service = (firebaseServices.find(({ match }) => match(url))?.name ?? '') as
    | FirebaseServiceName
    | '';
  const rawQueries =
    service === 'firestore' ? parseFirestoreReqParams(request as FirestoreRequest) : [];
  const paths =
    service === 'firestore'
      ? joinPaths(rawQueries)
      : service === 'storage'
        ? storagePaths(request as StorageRequest)
        : '';

  return {
    id,
    requestedAt: new Date(startedDateTime).toLocaleTimeString(),
    method,
    service,
    status: response.status,
    paths,
    rawQueries,
  };
};

export const requestHistory = (data: RawEntry[]) => {
  const list = data || [];
  const counters = new Map<string, number>();
  const oldestFirst = [...list].reverse();
  const withIdsOldestFirst = oldestFirst.map((entry) => {
    const n = counters.get(entry.startedDateTime) ?? 0;
    counters.set(entry.startedDateTime, n + 1);
    const id = n === 0 ? entry.startedDateTime : `${entry.startedDateTime}-${n}`;
    return transformEntry(entry, id);
  });
  return withIdsOldestFirst.reverse();
};
