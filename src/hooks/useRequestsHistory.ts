import { useState, useEffect } from 'react';
import { requestHistory } from '@/utils/requestHistory';
import type { Message } from '@/types';
import type { Request } from '@/utils/requestHistory';

export type { Request };

export const useRequestsHistory = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const reset = () => {
    try {
      chrome.runtime.sendMessage({ msg: 'clear-requests' });
      setRequests([]);
    } catch (e) {
      console.log(e);
    }
  };
  const reload = () => {
    try {
      chrome.runtime.sendMessage({ msg: 'get-requests' }, (response) => {
        if (chrome.runtime.lastError) return;
        setRequests(requestHistory(response));
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const handleMessage = ({ msg, data }: Message) => {
      if (msg !== 'request-finished') return;
      setRequests(requestHistory(data));
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    reload();

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return { requests, reset, reload };
};
