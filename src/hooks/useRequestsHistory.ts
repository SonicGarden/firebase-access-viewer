import { useState, useEffect, useCallback } from 'react';
import { requestHistory } from '@/utils/requestHistory';
import type { Message } from '@/types';

export type ModalData = string | null;

export type Request = {
  requestedAt: string;
  method: string;
  service: string;
  status: number;
  paths: string;
  data: ModalData;
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

    chrome.runtime.onMessage.addListener(handleMessage);
    fetchRequests();

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [fetchRequests]);

  return { requests, reset, reload };
};
