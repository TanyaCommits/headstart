import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { clearOldMeetingData } from './utils/clearOldData';

// Clear old meeting data on app startup
clearOldMeetingData();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <BrowserRouter>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </BrowserRouter>
); 