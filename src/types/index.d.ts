export type Message = {
  msg: 'request-finished' | 'get-requests' | (string & {});
  data?: any;
};

// リスナーは同期で値を返さない。Chrome 148 以降は Promise を返すと解決値が応答として送られるため
export type MessageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;
