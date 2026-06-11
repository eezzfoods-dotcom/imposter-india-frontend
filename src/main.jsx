import React from 'react';
import ReactDOM from 'react-dom/client';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import { OfflineProvider } from './context/OfflineContext';
import { ReactionBar } from './components/Reactions';
import App from './App';
import './index.css';

function Root() {
  return (
    <>
      <App />
      <ReactionBar />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <GameProvider>
        <OfflineProvider>
          <Root />
        </OfflineProvider>
      </GameProvider>
    </SocketProvider>
  </React.StrictMode>
);
