import { getStats, getAchievements } from '../utils/stats';

export function StatsModal({ onClose }) {
  const s = getStats();
  const achievements = getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const escapeRate = s.timesImp > 0 ? Math.round((s.escapes / s.timesImp) * 100) : 0;
  const accuracy = (s.correctVotes + s.wrongVotes) > 0
    ? Math.round((s.correctVotes / (s.correctVotes + s.wrongVotes)) * 100) : 0;

  const statRows = [
    { label: 'Games Played', value: s.games, emoji: '🎮' },
    { label: 'Games Won', value: s.wins, emoji: '🏆' },
    { label: 'Rounds Played', value: s.rounds, emoji: '🔄' },
    { label: 'Times Imposter', value: s.timesImp, emoji: '🕵️' },
    { label: 'Escape Rate', value: s.timesImp ? `${escapeRate}%` : '—', emoji: '😈' },
    { label: 'Vote Accuracy', value: (s.correctVotes + s.wrongVotes) ? `${accuracy}%` : '—', emoji: '🔍' },
  ];

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{width:'100%',maxWidth:340,maxHeight:'85vh',overflowY:'auto',background:'#000c28',border:'1px solid rgba(0,212,255,0.3)',borderRadius:20,padding:20}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <p className="font-display" style={{fontSize:'1.6rem',color:'#00D4FF',letterSpacing:'0.06em'}}>📊 MY STATS</p>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'1.2rem',cursor:'pointer'}}>✕</button>
        </div>

        {/* Stats grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
          {statRows.map(r => (
            <div key={r.label} style={{padding:'10px 12px',borderRadius:12,background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.12)'}}>
              <p style={{fontSize:'0.62rem',color:'rgba(0,212,255,0.45)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.05em',marginBottom:2}}>{r.emoji} {r.label.toUpperCase()}</p>
              <p className="font-display" style={{fontSize:'1.5rem',color:'white',lineHeight:1}}>{r.value}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <p style={{fontSize:'0.7rem',letterSpacing:'0.25em',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>ACHIEVEMENTS</p>
          <span style={{fontSize:'0.7rem',color:'rgba(0,212,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>{unlockedCount}/{achievements.length}</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {achievements.map(a => (
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:12,
              background: a.unlocked ? 'rgba(0,212,255,0.08)' : 'rgba(0,18,51,0.5)',
              border: `1px solid ${a.unlocked ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
              opacity: a.unlocked ? 1 : 0.45}}>
              <span style={{fontSize:'1.4rem',filter:a.unlocked?'none':'grayscale(1)'}}>{a.emoji}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:'0.8rem',fontWeight:700,color:a.unlocked?'white':'rgba(255,255,255,0.5)',fontFamily:"'DM Sans',sans-serif"}}>{a.name}</p>
                <p style={{fontSize:'0.65rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{a.desc}</p>
              </div>
              {a.unlocked && <span style={{color:'#00D478',fontSize:'0.9rem'}}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
