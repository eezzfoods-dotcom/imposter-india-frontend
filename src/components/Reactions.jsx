import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

const REACTION_EMOJIS = ['😂','😱','🤔','😤','👀','🔥','💀','🫣','😮','🤫'];

function FloatingEmoji({ reaction }) {
  const left = 10 + Math.random() * 80;
  return (
    <div style={{
      position:'fixed', bottom:80, left:`${left}%`, zIndex:9999,
      fontSize:'2rem', animation:'floatReaction 2.5s ease-out forwards',
      pointerEvents:'none', display:'flex', flexDirection:'column',
      alignItems:'center', gap:2,
    }}>
      <span>{reaction.emoji}</span>
      <span style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.7)',background:'rgba(0,0,0,0.5)',padding:'1px 6px',borderRadius:10,fontFamily:"'DM Sans',sans-serif",whiteSpace:'nowrap'}}>
        {reaction.playerName}
      </span>
    </div>
  );
}

export function ReactionBar() {
  const { socket } = useSocket();
  const { screen } = useGame();
  const [floating, setFloating] = useState([]);

  // ⚠️ Hooks must be called before any early return
  useEffect(() => {
    if (!socket) return;
    function onReaction(reaction) {
      const id = reaction.id || Date.now() + Math.random();
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
      {floating.map(r => <FloatingEmoji key={r.id} reaction={r} />)}
      <div style={{
        position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)',
        zIndex:1000, display:'flex', gap:6,
        background:'rgba(0,8,20,0.92)', border:'1px solid rgba(0,212,255,0.2)',
        borderRadius:40, padding:'8px 12px', boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
      }}>
        {REACTION_EMOJIS.map(emoji => (
          <button key={emoji}
            onClick={() => sendReaction(emoji)}
            onTouchEnd={e => { e.preventDefault(); sendReaction(emoji); }}
            style={{fontSize:'1.4rem',background:'none',border:'none',cursor:'pointer',padding:'2px 4px',borderRadius:8}}>
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
