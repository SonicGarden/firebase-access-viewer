import { firebaseServices } from '@/utils';

let requests: {}[] = [];
const handleRequestFinished = (request: chrome.devtools.network.Request) => {
  if (firebaseServices.some(({ match }) => match(request.request.url))) {
    requests = [request, ...requests.slice(0, 99)];
    chrome.runtime.sendMessage({ msg: 'request-finished', data: requests });
  }
};
chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished);
chrome.runtime.onMessage.addListener(({ msg }, sender, sendResponse) => {
  if (msg !== 'get-requests') return true;

  sendResponse(requests);
  return true;
});
chrome.runtime.sendMessage({ msg: 'devtools-ready' });
