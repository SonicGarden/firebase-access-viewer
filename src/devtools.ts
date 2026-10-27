import { firebaseServices } from '@/utils';
import type { MessageHandler } from '@/types';

let requests: {}[] = [];

const handleRequestFinished = (request: chrome.devtools.network.Request) => {
  if (firebaseServices.some(({ match }) => match(request.request.url))) {
    requests = [request, ...requests.slice(0, 99)];
    try {
      chrome.runtime.sendMessage({ msg: 'request-finished', data: requests });
    } catch {
      // Extension context invalidated (e.g., extension reloaded while DevTools open).
      // Listener is still attached to the old context; ignore until DevTools is reopened.
    }
  }
};

const msgGetRequestsHandler: MessageHandler = (message, sender, sendResponse) => {
  sendResponse(requests);
};

const msgClearRequestsHandler: MessageHandler = () => {
  requests = [];
};

chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished);
const handleMessage: MessageHandler = (message, sender, sendResponse) => {
  const handler = {
    'get-requests': msgGetRequestsHandler,
    'clear-requests': msgClearRequestsHandler,
  }[message.msg as string];
  handler?.(message, sender, sendResponse);
};

chrome.runtime.onMessage.addListener(handleMessage);
