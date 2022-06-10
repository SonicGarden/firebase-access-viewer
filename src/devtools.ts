import { firebaseServices } from '@/utils';
import type { MessageHandler } from '@/types';

let requests: {}[] = [];
const handleRequestFinished = (request: chrome.devtools.network.Request) => {
  if (firebaseServices.some(({ match }) => match(request.request.url))) {
    requests = [request, ...requests.slice(0, 99)];
    chrome.runtime.sendMessage({ msg: 'request-finished', data: requests });
  }
};
const msgGetRequestsHandler: MessageHandler = async (message, sender, sendResponse) => {
  sendResponse(requests);
  return true;
};
const msgClearRequestsHandler: MessageHandler = async () => {
  requests = [];
  return true;
};

chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished);
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const handler = {
    'get-requests': msgGetRequestsHandler,
    'clear-requests': msgClearRequestsHandler,
  }[message.msg as string];
  return (await handler?.(message, sender, sendResponse)) || true;
});
chrome.runtime.sendMessage({ msg: 'devtools-ready' });
