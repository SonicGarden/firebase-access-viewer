import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from '@/components/Popup';
import 'virtual:windi.css';
import '@/styles/popup.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
