import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

const EMOJIS = ['😂','😱','🤔','😤','👀','🔥','💀','🫣','😮','🤫'];

export function ReactionBar() {
  const { socket } = useSocket();
  const { screen } = useGame();
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      const id = nextId.current++;
      const left = 5 + (id * 13 + 17) % 80;
      setItems(prev => [...prev, { id, left, emoji: data.emoji, name: data.playerName }]);
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 3000);
    };
    socket.on('game:reaction', handler);
    return () => socket.off('game:reaction', handler);
  }, [socket]);

  const activeScreens = ['discuss', 'vote', 'spinner'];
  if (!activeScreens.includes(screen)) return null;

  const send = (emoji) => {
    if (socket) socket.emit('game:reaction', { emoji });
  };

  return (
    <>
      {/* Floating emojis */}
      {items.map(item => (
        <div key={item.id} style={{
          position: 'fixed',
          bottom: 80,
          left: `${item.left}%`,
          zIndex: 99999,
          pointerEvents: 'none',
          textAlign: 'center',
          animation: 'floatReaction 3s ease-out forwards',
        }}>
          <div style={{ fontSize: 36 }}>{item.emoji}</div>
          <div style={{
            fontSize: 11,
            color: 'white',
            background: 'rgba(0,0,0,0.75)',
            borderRadius: 10,
            padding: '2px 8px',
            marginTop: 2,
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
          }}>{item.name}</div>
        </div>
      ))}

      {/* Bar */}
      <div style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        background: 'rgba(0,10,30,0.97)',
        border: '1.5px solid rgba(0,212,255,0.35)',
        borderRadius: 50,
        padding: '6px 10px',
        gap: 2,
        boxShadow: '0 4px 30px rgba(0,0,0,0.9)',
      }}>
        {EMOJIS.map(e => (
          <button
            key={e}
            onPointerDown={ev => { ev.preventDefault(); send(e); }}
            style={{
              fontSize: 22,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '3px 4px',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >{e}</button>
        ))}
      </div>
    </>
  );
}
