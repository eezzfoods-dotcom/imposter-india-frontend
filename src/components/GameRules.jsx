import { useState } from 'react';
import { Btn } from './ui';

export function GameRulesModal({ onClose }) {
  const [page, setPage] = useState(0);

  const rules = [
    {
      icon: '🎬',
      title: 'WELCOME TO\nIMPOSTER INDIA',
      lines: [
        'One player is secretly the IMPOSTER',
        'Everyone else are CREW MEMBERS',
        'Crew knows the Movie/Food/Location',
        'Imposter must blend in without knowing it!',
      ],
    },
    {
      icon: '🃏',
      title: 'YOUR ROLE CARD',
      lines: [
        'Crew: You see the full answer',
        'Imposter: You only get a small clue',
        'Keep your card SECRET from others',
        'Never say the answer out loud!',
      ],
    },
    {
      icon: '💬',
      title: 'DISCUSSION',
      lines: [
        'The spinner picks who speaks first',
        'Each player talks about the topic',
        'Hint without revealing the answer',
        'Watch who seems unsure or vague!',
      ],
    },
    {
      icon: '🗳',
      title: 'VOTING',
      lines: [
        'After discussion everyone votes',
        'Vote for who you think is the Imposter',
        'Voted correctly → +3 points',
        'Voted wrong → -1 point',
      ],
    },
    {
      icon: '🏆',
      title: 'SCORING',
      lines: [
        '✅ Correct vote → +3 pts',
        '❌ Wrong vote → -1 pt',
        '🕵️ Imposter escapes → +4 pts',
        '🎉 Imposter caught → -2 pts',
      ],
    },
    {
      icon: '🕵️',
      title: 'IMPOSTER TIP',
      lines: [
        'Use your clue wisely to bluff',
        'Ask questions instead of answering',
        'If caught early — reveal the answer',
        '"Imposter Revealed" gives you +4 pts!',
      ],
    },
  ];

  const current = rules[page];
  const isLast = page === rules.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'linear-gradient(135deg,#000c28,#001540)',
        border: '1px solid rgba(0,212,255,0.3)',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 0 60px rgba(0,212,255,0.15)',
      }}>
        {/* Progress dots */}
        <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:20}}>
          {rules.map((_,i) => (
            <div key={i} style={{
              width: i===page?20:6, height:6, borderRadius:3,
              background: i===page?'#00D4FF':'rgba(0,212,255,0.2)',
              transition:'all 0.3s',
            }}/>
          ))}
        </div>

        {/* Content */}
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:'3.5rem',marginBottom:12}}>{current.icon}</div>
          <h2 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:'2rem',letterSpacing:'0.06em',
            color:'#00D4FF',marginBottom:16,
            whiteSpace:'pre-line',lineHeight:1.1,
          }}>{current.title}</h2>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {current.lines.map((line,i) => (
              <div key={i} style={{
                background:'rgba(0,212,255,0.06)',
                border:'1px solid rgba(0,212,255,0.12)',
                borderRadius:12, padding:'10px 14px',
                fontSize:'0.85rem',
                color:'rgba(255,255,255,0.8)',
                fontFamily:"'DM Sans',sans-serif",
                textAlign:'left',
              }}>{line}</div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:10}}>
          {page > 0 && (
            <button onClick={() => setPage(p=>p-1)}
              style={{flex:1,padding:'12px',borderRadius:12,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',color:'rgba(0,212,255,0.7)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
              ← BACK
            </button>
          )}
          <button onClick={() => isLast ? onClose() : setPage(p=>p+1)}
            style={{flex:2,padding:'12px',borderRadius:12,background:'linear-gradient(135deg,#0099CC,#00D4FF)',border:'none',color:'#000814',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.1rem',letterSpacing:'0.1em',cursor:'pointer'}}>
            {isLast ? "LET'S PLAY! 🎬" : 'NEXT →'}
          </button>
        </div>

        {page === 0 && (
          <button onClick={onClose} style={{display:'block',width:'100%',marginTop:10,background:'none',border:'none',color:'rgba(0,212,255,0.3)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.78rem',cursor:'pointer'}}>
            Skip — I know the rules
          </button>
        )}
      </div>
    </div>
  );
}
