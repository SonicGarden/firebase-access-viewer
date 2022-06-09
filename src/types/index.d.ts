export type Message = {
  msg: 'request-finished' | 'get-requests' | (string & {});
  data?: any;
};

export type MessageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => Promise<boolean>;
