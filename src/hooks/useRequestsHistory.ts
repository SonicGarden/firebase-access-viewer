import { useState, useEffect, useCallback } from 'react';
import { firebaseServices } from '@/utils';
import type { Message } from '@/types';

export type Request = {
  requestedAt: string;
  method: string;
  service: string;
  status: number;
  ids: string;
  data: any;
};

type FirestoreRequest = {
  method: string;
  url: string;
  postData?: { params: { name: string; value: string }[] };
};

type StorageRequest = {
  method: string;
  url: string;
};

const firestoreIds = (request: FirestoreRequest) => {
  const { postData } = request;
  return (postData?.params || [])
    .filter(({ name }) => name.startsWith('req'))
    .map(({ value }) => {
      const decodedValue = decodeURIComponent(value);
      const parsedValue = JSON.parse(decodedValue);
      const { addTarget } = parsedValue;
      const { query, documents } = addTarget || {};
      const { structuredQuery } = query || {};
      const { from } = structuredQuery || {};
      const collectionId = from && from[0].collectionId;
      const { documents: [document] = [] } = documents || {};
      const documentId = document && document.split('/documents/')[1];

      return collectionId || documentId;
    })
    .filter((_) => _)
    .join(', ');
};

const storageIds = (request: StorageRequest) => {
  const { url } = request;
  const { pathname } = new URL(decodeURIComponent(url));
  return pathname.split('/o/')[1];
};

const requestHistory = (
  data: {
    request: FirestoreRequest | StorageRequest;
    response: { status: number };
    startedDateTime: string;
  }[]
) => {
  return data.map((req) => {
    const { request, response, startedDateTime } = req;
    const { method, url } = request;
    const service = firebaseServices.find(({ match }) => match(url))?.name || '';
    const ids =
      {
        firestore: firestoreIds(request),
        storage: storageIds(request),
      }[service] || '';
    const { postData } = request as FirestoreRequest;
    const { params: data } = postData || {};
    const formattedData = data
      ?.filter(({ name }) => name.startsWith('req'))
      ?.map(({ value }) => {
        const decodedValue = decodeURIComponent(JSON.stringify(value));
        const parsedValue = JSON.parse(decodedValue.slice(1, -1));
        return JSON.stringify(parsedValue, null, 2);
      })
      ?.join('\n');

    return {
      requestedAt: new Date(startedDateTime).toLocaleTimeString(),
      method,
      service,
      status: response.status,
      ids,
      data: formattedData && formattedData,
    };
  });
};

export const useRequestsHistory = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reset = useCallback(() => {
    chrome.runtime.sendMessage({ msg: 'clear-requests' });
    setRequests([]);
  }, []);
  const fetchRequests = useCallback(() => {
    chrome.runtime.sendMessage({ msg: 'get-requests' }, (response) => {
      const reqs = requestHistory(response);
      setRequests(reqs);
    });
  }, []);
  const reload = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const handleMessage = ({ msg, data }: Message) => {
      if (msg !== 'request-finished') return true;

      error && setError(null);
      const reqs = requestHistory(data);
      setRequests(reqs);
      return true;
    };

    chrome.runtime.sendMessage({ msg: 'is-devtools-enabled' }, (response) => {
      if (!response) {
        setError('DevTools is disabled');
        return;
      }

      fetchRequests();
    });
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [fetchRequests]);

  return { requests, error, reset, reload };
};
