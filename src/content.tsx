import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from '@/components/pages/Popup';
import 'virtual:windi.css';
import '@/styles/popup.css';

const root = document.createElement('div');
root.id = 'crx-root';
document.body.append(root);

ReactDOM.createRoot(document.getElementById('crx-root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
