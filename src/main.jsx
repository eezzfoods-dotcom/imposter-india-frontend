import React from 'react';
import ReactDOM from 'react-dom/client';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import { OfflineProvider } from './context/OfflineContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <GameProvider>
        <OfflineProvider>
          <App />
        </OfflineProvider>
      </GameProvider>
    </SocketProvider>
  </React.StrictMode>
);
