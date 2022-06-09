import type { Message, MessageHandler } from '@/types';

const isSuccessfulRequest = ({ response: { status } }: { response: { status: number } }) =>
  Math.floor(status / 100) === 2;

const sleep = async (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

let processing = false;
const msgRequestFinishedHandler: MessageHandler = async ({ data: requests }) => {
  while (processing) {
    await sleep(100);
  }
  processing = true;
  const [request] = requests;
  const color = isSuccessfulRequest(request) ? '#00ff00' : '#ff0000';
  const text = requests.length < 100 ? requests.length.toString() : ':D';
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text }, () => {
    chrome.action.setBadgeText({ text: '' }, () => (processing = false));
  });
  return true;
};

let devtoolsEnabled = false;
const msgDevToolsReadyHandler: MessageHandler = async () => {
  devtoolsEnabled = true;
  return true;
};

const msgIsDevToolsEnabledHandler: MessageHandler = async (_message, _sender, sendResponse) => {
  sendResponse(devtoolsEnabled);
  return true;
};

const handleMessage: MessageHandler = async (message, sender, sendResponse) => {
  const handler = {
    'request-finished': msgRequestFinishedHandler,
    'devtools-ready': msgDevToolsReadyHandler,
    'is-devtools-enabled': msgIsDevToolsEnabledHandler,
  }[message.msg as string];
  return handler?.(message, sender, sendResponse) || true;
};

chrome.runtime.onMessage.addListener(handleMessage);
