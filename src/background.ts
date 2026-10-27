import type { MessageHandler } from '@/types';
import { isSuccessfulStatus } from '@/utils';

const sleep = async (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

const showBadge = async (requests: { response: { status: number } }[]) => {
  const [request] = requests;
  const color = isSuccessfulStatus(request.response.status) ? '#00ff00' : '#ff0000';
  const text = requests.length < 100 ? requests.length.toString() : ':D';
  await chrome.action.setBadgeBackgroundColor({ color });
  await chrome.action.setBadgeText({ text });
  await sleep(100);
  await chrome.action.setBadgeText({ text: '' });
};

let processing = false;
let pending: { response: { status: number } }[] | null = null;

const msgRequestFinishedHandler: MessageHandler = async ({ data: requests }) => {
  if (processing) {
    pending = requests;
    return;
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
};

const handleMessage: MessageHandler = (message, sender, sendResponse) => {
  const handler = {
    'request-finished': msgRequestFinishedHandler,
  }[message.msg as string];
  handler?.(message, sender, sendResponse);
};

chrome.action.setBadgeText({ text: '' });

chrome.runtime.onMessage.addListener(handleMessage);
