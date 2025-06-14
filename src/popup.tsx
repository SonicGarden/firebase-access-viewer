import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from '@/components/pages/Popup';
import '@/styles/tailwind.css';
import '@/styles/popup.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
