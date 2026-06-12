import { useState } from 'react';
import { getCustomRounds, searchDatabase } from '../utils/aiRounds';
import { Btn } from './ui';

const SUGGESTIONS = [
  'Vijay movies', 'Rajinikanth movies', 'Mani Ratnam movies',
  'Kamal Haasan movies', 'Dhanush movies', 'Suriya movies',
  '90s Tamil movies', '2000s blockbusters', 'Horror movies',
  'Romantic movies', 'AR Rahman movies', 'Atlee movies',
  'Telugu action movies', 'Hindi comedy movies', 'Malayalam thrillers',
  'Award winning movies', 'Remake movies', 'Female lead movies',
];

export function CustomRoundsModal({ onStart, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [count, setCount] = useState(5);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const result = await getCustomRounds(query.trim(), count);
      if (!result.rounds.length) {
        setError('No movies found for this topic. Try a different search!');
      } else {
        setPreview(result);
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  function handleStart() {
    if (!preview?.rounds?.length) return;
    onStart(preview.rounds, query);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:9500,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:400,background:'linear-gradient(135deg,#000c28,#001540)',border:'1px solid rgba(0,212,255,0.35)',borderRadius:24,padding:20,marginTop:16}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>AI POWERED</p>
            <p className="font-display" style={{fontSize:'1.8rem',color:'white',letterSpacing:'0.05em'}}>CUSTOM ROUNDS</p>
          </div>
          <div style={{fontSize:'2rem'}}>🤖</div>
        </div>

        {/* Search input */}
        <div style={{marginBottom:12}}>
          <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>What movies do you want to play?</p>
          <div style={{display:'flex',gap:8}}>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleSearch()}
              placeholder="e.g. Vijay movies, 90s Tamil..."
              style={{flex:1,background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.3)',borderRadius:10,padding:'10px 14px',color:'white',fontFamily:"'DM Sans',sans-serif",fontSize:'0.9rem',outline:'none'}}
            />
            <button onClick={handleSearch} disabled={loading||!query.trim()}
              style={{padding:'10px 14px',borderRadius:10,background:'linear-gradient(135deg,#0099CC,#00D4FF)',border:'none',color:'#000814',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.8rem',cursor:'pointer',opacity:loading||!query.trim()?0.5:1,flexShrink:0}}>
              {loading ? '...' : '🔍'}
            </button>
          </div>
        </div>

        {/* Round count */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Rounds:</p>
          <div style={{display:'flex',gap:6}}>
            {[3,5,7,10].map(n=>(
              <button key={n} onClick={()=>setCount(n)}
                style={{width:36,height:36,borderRadius:8,background:count===n?'linear-gradient(135deg,#0099CC,#00D4FF)':'rgba(0,18,51,0.8)',border:`1px solid ${count===n?'rgba(0,212,255,0.5)':'rgba(0,212,255,0.15)'}`,color:count===n?'#000814':'rgba(0,212,255,0.6)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {!preview && !loading && (
          <div style={{marginBottom:14}}>
            <p style={{fontSize:'0.65rem',color:'rgba(0,212,255,0.35)',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.2em',marginBottom:8}}>QUICK PICKS</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {SUGGESTIONS.map(s=>(
                <button key={s} onClick={()=>{setQuery(s);}}
                  style={{padding:'4px 10px',borderRadius:20,background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.15)',color:'rgba(0,212,255,0.6)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.72rem',cursor:'pointer'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:'2rem',animation:'ringPulse 1s ease-in-out infinite',marginBottom:8}}>🤖</div>
            <p style={{fontSize:'0.8rem',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif"}}>Searching database + generating with AI...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{background:'rgba(255,60,120,0.1)',border:'1px solid rgba(255,60,120,0.3)',borderRadius:10,padding:10,marginBottom:12}}>
            <p style={{fontSize:'0.8rem',color:'#FF3C78',fontFamily:"'DM Sans',sans-serif"}}>{error}</p>
          </div>
        )}

        {/* Preview results */}
        {preview && (
          <div style={{marginBottom:14}}>
            {/* Source badge */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{padding:'3px 10px',borderRadius:20,background:preview.source==='database'?'rgba(0,212,100,0.15)':preview.source==='ai'?'rgba(0,150,255,0.15)':'rgba(255,180,0,0.15)',border:`1px solid ${preview.source==='database'?'rgba(0,212,100,0.3)':preview.source==='ai'?'rgba(0,150,255,0.3)':'rgba(255,180,0,0.3)'}`,fontSize:'0.65rem',fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:preview.source==='database'?'#00D478':preview.source==='ai'?'#00AAFF':'#FFB800'}}>
                {preview.source==='database'?'✅ FROM DATABASE':preview.source==='ai'?'🤖 AI GENERATED':'⚡ DB + AI MIXED'}
              </div>
              <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{preview.rounds.length} rounds found</p>
            </div>

            {/* Movie list */}
            <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:220,overflowY:'auto'}}>
              {preview.rounds.map((r,i)=>(
                <div key={i} style={{display:'flex',gap:10,padding:'8px 10px',background:'rgba(0,18,51,0.6)',border:'1px solid rgba(0,212,255,0.1)',borderRadius:10,alignItems:'center'}}>
                  <span style={{fontSize:'1rem',flexShrink:0}}>{r.c==='Movie'?'🎬':r.c==='Food'?'🍛':'📍'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'0.82rem',fontWeight:700,color:'white',fontFamily:"'DM Sans',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.n}</p>
                    <p style={{fontSize:'0.7rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{r.d} {r.y?`· ${r.y}`:''}</p>
                  </div>
                  <span style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.2)',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>{r.l}</span>
                </div>
              ))}
            </div>

            {/* Regenerate */}
            <button onClick={handleSearch} style={{display:'block',width:'100%',marginTop:8,padding:'8px',borderRadius:10,background:'transparent',border:'1px solid rgba(0,212,255,0.15)',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.75rem',cursor:'pointer'}}>
              🔄 Generate Different Movies
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:'11px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',fontWeight:700}}>
            Cancel
          </button>
          {preview && (
            <button onClick={handleStart} style={{flex:2,padding:'11px',borderRadius:12,background:'linear-gradient(135deg,#0099CC,#00D4FF)',border:'none',color:'#000814',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1rem',letterSpacing:'0.1em',cursor:'pointer'}}>
              START WITH THESE ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
