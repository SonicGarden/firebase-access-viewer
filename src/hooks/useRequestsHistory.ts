import { useState, useEffect, useCallback } from 'react';
import { firebaseServices } from '@/utils';
import type { Message } from '@/types';

export type Request = {
  requestedAt: string;
  method: string;
  service: string;
  status: number;
  paths: string;
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

const firestorePaths = (request: FirestoreRequest) => {
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

const storagePaths = (request: StorageRequest) => {
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
  return (data || []).map((req) => {
    const { request, response, startedDateTime } = req;
    const { method, url } = request;
    const service = firebaseServices.find(({ match }) => match(url))?.name || '';
    const paths =
      {
        firestore: firestorePaths(request),
        storage: storagePaths(request),
      }[service] || '';
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
      data: formattedData && `[${formattedData}]`,
    };
  });
};

export const useRequestsHistory = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const reset = useCallback(() => {
    try {
      chrome.runtime.sendMessage({ msg: 'clear-requests' });
      setRequests([]);
    } catch (e) {
      console.log(e);
    }
  }, []);
  const fetchRequests = useCallback(() => {
    try {
      chrome.runtime.sendMessage({ msg: 'get-requests' }, (response) => {
        const reqs = requestHistory(response);
        setRequests(reqs);
      });
    } catch (e) {
      console.log(e);
    }
  }, []);
  const reload = useCallback(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const handleMessage = ({ msg, data }: Message) => {
      if (msg !== 'request-finished') return true;

      const reqs = requestHistory(data);
      setRequests(reqs);
      return true;
    };

    fetchRequests();
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [fetchRequests]);

  return { requests, reset, reload };
};
