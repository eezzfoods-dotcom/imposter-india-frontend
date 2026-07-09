import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';
import { COLORS } from './ui';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptic';

// Floating chat dock — mounted globally like ReactionBar.
// Visible on in-room screens; button bottom-right so it doesn't clash with the reaction bar.
export function ChatDock() {
  const { socket } = useSocket();
  const { screen, room, myIdx } = useGame();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const openRef = useRef(open);
  openRef.current = open;
  const myIdxRef = useRef(myIdx);
  myIdxRef.current = myIdx;

  // Reset history when we enter a different room
  const code = room?.code;
  useEffect(() => { setMessages([]); setUnread(0); setOpen(false); }, [code]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages(prev => [...prev.slice(-99), msg]);
      if (msg.playerIdx !== myIdxRef.current) {
        sound('chat');
        if (!openRef.current) setUnread(u => u + 1);
      }
    };
    socket.on('room:chat', handler);
    return () => socket.off('room:chat', handler);
  }, [socket]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const activeScreens = ['lobby', 'spinner', 'discuss', 'vote', 'result', 'leaderboard'];
  if (!room || !activeScreens.includes(screen)) return null;

  function send() {
    const t = text.trim();
    if (!t || !socket) return;
    socket.emit('room:chat', { text: t });
    setText('');
    haptic('light');
  }

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => { setOpen(o => !o); setUnread(0); haptic('light'); }}
        style={{position:'fixed',bottom:70,right:12,zIndex:9998,width:46,height:46,borderRadius:'50%',
          background:'rgba(0,10,30,0.97)',border:'1.5px solid rgba(0,212,255,0.35)',cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
          boxShadow:'0 4px 20px rgba(0,0,0,0.8)'}}>
        💬
        {unread > 0 && (
          <span style={{position:'absolute',top:-4,right:-4,minWidth:18,height:18,borderRadius:9,padding:'0 4px',
            background:'#FF3C78',color:'white',fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",
            display:'flex',alignItems:'center',justifyContent:'center'}}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{position:'fixed',bottom:124,right:12,left:12,maxWidth:360,marginLeft:'auto',zIndex:9998,
          background:'rgba(0,10,30,0.98)',border:'1.5px solid rgba(0,212,255,0.35)',borderRadius:16,
          boxShadow:'0 8px 40px rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'8px 14px',borderBottom:'1px solid rgba(0,212,255,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontSize:'0.7rem',letterSpacing:'0.2em',color:'rgba(0,212,255,0.6)',fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>ROOM CHAT</span>
            <button onClick={() => setOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'0.9rem'}}>✕</button>
          </div>

          <div ref={listRef} style={{maxHeight:'32vh',minHeight:80,overflowY:'auto',padding:'10px 12px',display:'flex',flexDirection:'column',gap:6}}>
            {messages.length === 0 && (
              <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.25)',fontFamily:"'DM Sans',sans-serif",textAlign:'center',padding:'12px 0'}}>
                No messages yet — say hi! 👋
              </p>
            )}
            {messages.map(m => {
              const mine = m.playerIdx === myIdx;
              const color = COLORS[m.playerIdx % COLORS.length];
              return (
                <div key={m.id} style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth:'85%'}}>
                  {!mine && <p style={{fontSize:'0.6rem',color,fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:1,marginLeft:8}}>{m.playerName}</p>}
                  <div style={{padding:'6px 12px',borderRadius:12,
                    background: mine ? 'linear-gradient(135deg,rgba(0,153,204,0.35),rgba(0,212,255,0.2))' : 'rgba(0,18,51,0.9)',
                    border:`1px solid ${mine ? 'rgba(0,212,255,0.35)' : color + '30'}`,
                    fontSize:'0.82rem',color:'rgba(255,255,255,0.9)',fontFamily:"'DM Sans',sans-serif",
                    wordBreak:'break-word'}}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{display:'flex',gap:6,padding:10,borderTop:'1px solid rgba(0,212,255,0.15)'}}>
            <input value={text} onChange={e => setText(e.target.value)} maxLength={140}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message…"
              style={{flex:1,background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.25)',borderRadius:10,
                padding:'8px 12px',color:'white',fontFamily:"'DM Sans',sans-serif",fontSize:'0.85rem',outline:'none'}}/>
            <button onClick={send} disabled={!text.trim()}
              style={{padding:'8px 14px',borderRadius:10,border:'none',cursor:'pointer',
                background: text.trim() ? 'linear-gradient(135deg,#0099CC,#00D4FF)' : 'rgba(0,212,255,0.1)',
                color: text.trim() ? '#000814' : 'rgba(0,212,255,0.3)',
                fontFamily:"'Bebas Neue',sans-serif",fontSize:'0.95rem',letterSpacing:'0.08em'}}>SEND ▶</button>
          </div>
        </div>
      )}
    </>
  );
}
