import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

const REACTION_EMOJIS = ['😂','😱','🤔','😤','👀','🔥','💀','🫣','😮','🤫'];

export function ReactionBar() {
  const { socket } = useSocket();
  const { screen } = useGame();
  const [floating, setFloating] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!socket) return;
    function onReaction(data) {
      const id = ++idRef.current;
      const left = 10 + (id * 37) % 75;
      setFloating(f => [...f, { ...data, id, left }]);
      setTimeout(() => setFloating(f => f.filter(r => r.id !== id)), 3000);
    }
    socket.on('game:reaction', onReaction);
    return () => socket.off('game:reaction', onReaction);
  }, [socket]);

  const showOnScreens = ['discuss', 'vote', 'spinner'];
  if (!showOnScreens.includes(screen)) return null;

  function sendReaction(emoji) {
    if (!socket) return;
    socket.emit('game:reaction', { emoji });
  }

  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:9000}}>
      {/* Floating emojis */}
      {floating.map(r => (
        <div key={r.id} style={{
          position:'absolute',
          bottom:80,
          left:`${r.left}%`,
          pointerEvents:'none',
          animation:'floatReaction 3s ease-out forwards',
          textAlign:'center',
        }}>
          <div style={{fontSize:'2.5rem'}}>{r.emoji}</div>
          <div style={{fontSize:'0.65rem',color:'white',background:'rgba(0,0,0,0.7)',padding:'2px 8px',borderRadius:10,fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap',marginTop:2}}>{r.playerName}</div>
        </div>
      ))}

      {/* Emoji bar */}
      <div style={{
        position:'absolute',
        bottom:16,
        left:'50%',
        transform:'translateX(-50%)',
        pointerEvents:'all',
        display:'flex',
        gap:2,
        background:'rgba(0,8,20,0.95)',
        border:'1px solid rgba(0,212,255,0.3)',
        borderRadius:40,
        padding:'6px 8px',
        boxShadow:'0 4px 30px rgba(0,0,0,0.8)',
      }}>
        {REACTION_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onPointerDown={e => { e.preventDefault(); e.stopPropagation(); sendReaction(emoji); }}
            style={{fontSize:'1.4rem',background:'none',border:'none',cursor:'pointer',padding:'4px 5px',borderRadius:8,WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
