import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Popup from '@/components/pages/Popup';
import '@/styles/tailwind.css';
import '@/styles/popup.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
