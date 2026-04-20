import type { MessageHandler } from '@/types';
import { isSuccessfulRequest } from '@/utils';

const sleep = async (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

const showBadge = async (requests: { response: { status: number } }[]) => {
  const [request] = requests;
  const color = isSuccessfulRequest(request) ? '#00ff00' : '#ff0000';
  const text = requests.length < 100 ? requests.length.toString() : ':D';
  await chrome.action.setBadgeBackgroundColor({ color });
  await chrome.action.setBadgeText({ text });
  await sleep(150);
  await chrome.action.setBadgeText({ text: '' });
};

let processing = false;
let pending: { response: { status: number } }[] | null = null;

const msgRequestFinishedHandler: MessageHandler = async ({ data: requests }) => {
  if (processing) {
    pending = requests;
    return true;
  }
  processing = true;
  try {
    await showBadge(requests);
    while (pending) {
      const next = pending;
      pending = null;
      await showBadge(next);
    }
  } finally {
    processing = false;
  }
  return true;
};

const handleMessage: MessageHandler = async (message, sender, sendResponse) => {
  const handler = {
    'request-finished': msgRequestFinishedHandler,
  }[message.msg as string];
  return (await handler?.(message, sender, sendResponse)) || true;
};

chrome.action.setBadgeText({ text: '' });

chrome.runtime.onMessage.addListener(handleMessage);
