import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

const REACTION_EMOJIS = ['😂','😱','🤔','😤','👀','🔥','💀','🫣','😮','🤫'];

function FloatingEmoji({ reaction }) {
  const left = 15 + (reaction.id * 7919) % 70; // deterministic spread
  return (
    <div style={{
      position:'fixed',
      bottom:90,
      left:`${left}%`,
      zIndex:9999,
      pointerEvents:'none',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      gap:4,
      animation:'floatReaction 2.5s ease-out forwards',
    }}>
      <span style={{fontSize:'2.2rem'}}>{reaction.emoji}</span>
      <span style={{
        fontSize:'0.65rem',
        color:'white',
        background:'rgba(0,0,0,0.6)',
        padding:'2px 8px',
        borderRadius:10,
        fontFamily:"'DM Sans',sans-serif",
        whiteSpace:'nowrap',
      }}>{reaction.playerName}</span>
    </div>
  );
}

export function ReactionBar() {
  const { socket } = useSocket();
  const { screen } = useGame();
  const [floating, setFloating] = useState([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!socket) return;
    function onReaction(reaction) {
      const id = ++counterRef.current;
      setFloating(f => [...f, { ...reaction, id }]);
      setTimeout(() => setFloating(f => f.filter(r => r.id !== id)), 2600);
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
    <>
      {/* Floating emojis */}
      {floating.map(r => <FloatingEmoji key={r.id} reaction={r} />)}

      {/* Reaction bar */}
      <div style={{
        position:'fixed',
        bottom:16,
        left:'50%',
        transform:'translateX(-50%)',
        zIndex:1000,
        display:'flex',
        gap:4,
        background:'rgba(0,8,20,0.95)',
        border:'1px solid rgba(0,212,255,0.25)',
        borderRadius:40,
        padding:'8px 10px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,255,0.1)',
      }}>
        {REACTION_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onPointerDown={e => { e.preventDefault(); sendReaction(emoji); }}
            style={{
              fontSize:'1.5rem',
              background:'none',
              border:'none',
              cursor:'pointer',
              padding:'4px 5px',
              borderRadius:8,
              lineHeight:1,
              WebkitTapHighlightColor:'transparent',
            }}>
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
