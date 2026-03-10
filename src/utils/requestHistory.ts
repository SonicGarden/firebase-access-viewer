import { firebaseServices } from '@/utils';

export type FirestoreRequest = {
  method: string;
  url: string;
  postData?: { params: { name: string; value: string }[] };
};

export type StorageRequest = {
  method: string;
  url: string;
};

export const firestorePaths = (request: FirestoreRequest) => {
  const { postData } = request;
  return (postData?.params || [])
    .filter(({ name }) => name.startsWith('req'))
    .map(({ value }) => {
      const decodedValue = decodeURIComponent(value);
      const parsedValue = JSON.parse(decodedValue);
      const { addTarget } = parsedValue;
      const { query, documents } = addTarget || {};
      const { structuredQuery, parent } = query || {};
      const { from } = structuredQuery || {};
      const parentPath = parent && parent.split('/documents/')[1];
      const collectionPath = from && (parentPath ? `${parentPath}/${from[0].collectionId}` : from[0].collectionId);
      const { documents: [document] = [] } = documents || {};
      const documentPath = document && document.split('/documents/')[1];

      return collectionPath || documentPath;
    })
    .filter((_) => _)
    .join(', ');
};

export const storagePaths = (request: StorageRequest) => {
  const { url } = request;
  const { pathname } = new URL(decodeURIComponent(url));
  return pathname.split('/o/')[1];
};

export const requestHistory = (
  data: {
    request: FirestoreRequest | StorageRequest;
    response: { status: number };
    startedDateTime: string;
  }[]
) => {
  return (data || []).map((req) => {
    const { request, response, startedDateTime } = req;
    const { method, url } = request;
    const service = firebaseServices.find(({ match }) => match(url))?.name || '';
    const paths =
      service === 'firestore'
        ? firestorePaths(request)
        : service === 'storage'
          ? storagePaths(request)
          : '';
    const { postData } = request as FirestoreRequest;
    const { params } = postData || {};
    const formattedData = params
      ?.filter(({ name }) => name.startsWith('req'))
      ?.map(({ value }) => {
        const decodedValue = decodeURIComponent(JSON.stringify(value));
        const parsedValue = JSON.parse(decodedValue.slice(1, -1));
        return JSON.stringify(parsedValue, null, 2);
      })
      ?.join(',\n');

    return {
      requestedAt: new Date(startedDateTime).toLocaleTimeString(),
      method,
      service,
      status: response.status,
      paths,
      data: formattedData ? `[${formattedData}]` : null,
    };
  });
};
