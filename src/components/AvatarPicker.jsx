import { useState } from 'react';
import { COLORS, AVATAR_CATEGORIES, ALL_AVATARS } from './ui';

export function AvatarPickerModal({ currentEmoji, currentColor, onSave, onClose }) {
  const [selEmoji, setSelEmoji] = useState(currentEmoji || '🎬');
  const [selColor, setSelColor] = useState(currentColor || COLORS[0]);
  const [tab, setTab] = useState('Cinema');

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:9500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:360,background:'linear-gradient(135deg,#000c28,#001540)',border:'1px solid rgba(0,212,255,0.35)',borderRadius:24,padding:20,boxShadow:'0 0 60px rgba(0,212,255,0.15)'}}>

        {/* Preview */}
        <div style={{textAlign:'center',marginBottom:16}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:10}}>YOUR AVATAR</p>
          <div style={{position:'relative',display:'inline-block'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:`${selColor}18`,border:`3px solid ${selColor}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',boxShadow:`0 0 30px ${selColor}40`,margin:'0 auto'}}>
              {selEmoji}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{display:'flex',gap:6,marginBottom:12,overflowX:'auto'}}>
          {Object.keys(AVATAR_CATEGORIES).map(cat => (
            <button key={cat} onClick={()=>setTab(cat)}
              style={{padding:'5px 12px',borderRadius:20,background:tab===cat?'linear-gradient(135deg,#0099CC,#00D4FF)':'rgba(0,18,51,0.8)',border:`1px solid ${tab===cat?'rgba(0,212,255,0.5)':'rgba(0,212,255,0.15)'}`,color:tab===cat?'#000814':'rgba(0,212,255,0.6)',fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer',flexShrink:0}}>
              {cat}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:16,padding:'10px',background:'rgba(0,12,40,0.6)',borderRadius:14,border:'1px solid rgba(0,212,255,0.1)'}}>
          {AVATAR_CATEGORIES[tab].map(emoji => (
            <button key={emoji} onClick={()=>setSelEmoji(emoji)}
              style={{width:'100%',aspectRatio:'1',borderRadius:12,background:selEmoji===emoji?`${selColor}22`:'transparent',border:`2px solid ${selEmoji===emoji?selColor:'transparent'}`,fontSize:'1.6rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',boxShadow:selEmoji===emoji?`0 0 12px ${selColor}40`:'none'}}>
              {emoji}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <p style={{fontSize:'0.65rem',letterSpacing:'0.2em',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:8}}>COLOUR</p>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {COLORS.map(color => (
            <button key={color} onClick={()=>setSelColor(color)}
              style={{width:32,height:32,borderRadius:'50%',background:color,border:`3px solid ${selColor===color?'white':'transparent'}`,cursor:'pointer',boxShadow:selColor===color?`0 0 12px ${color}80`:'none',transition:'all 0.15s'}}>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose}
            style={{flex:1,padding:'11px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',fontWeight:700}}>
            Cancel
          </button>
          <button onClick={()=>{
            localStorage.setItem('ii_avatar', selEmoji);
            localStorage.setItem('ii_color', selColor);
            onSave(selEmoji, selColor);
          }} style={{flex:2,padding:'11px',borderRadius:12,background:'linear-gradient(135deg,#0099CC,#00D4FF)',border:'none',color:'#000814',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1rem',letterSpacing:'0.1em',cursor:'pointer'}}>
            SAVE AVATAR ▶
          </button>
        </div>
      </div>
    </div>
  );
}
