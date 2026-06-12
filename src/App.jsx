import { useState, useEffect } from 'react';
import { applyTheme, getTheme } from './utils/theme';
import { useGame } from './context/GameContext';
import { useOffline } from './context/OfflineContext';
import {
  HomeScreen, LobbyScreen, PlayingScreen,
  SpinnerScreen, DiscussScreen, VoteScreen,
  ResultScreen, LeaderboardScreen, ReconnectingScreen,
} from './screens';
import {
  OfflineSetupScreen, OfflinePassScreen, OfflineRevealScreen,
  OfflineSpinnerScreen, OfflineDiscussScreen, OfflineVoteScreen,
  OfflineResultScreen, OfflineLeaderboardScreen,
} from './screens/offline';
import { Screen, Btn } from './components/ui';
import { COLORS, EMOJIS } from './components/ui';

// ── MODE SELECT ───────────────────────────────────────────
function ModeSelectScreen({ onSelectOnline, onSelectOffline }) {
  return (
    <Screen center>
      <div className="w-full max-w-sm text-center animate-fade-up">
        {/* Spy icon */}
        <div style={{position:'relative',width:110,height:110,margin:'0 auto 14px',animation:'iconEntrance 1s cubic-bezier(0.34,1.56,0.64,1) 0.3s both'}}>
          {[{inset:-14,border:'1px solid rgba(0,212,255,0.08)'},{inset:-7,border:'1px solid rgba(0,212,255,0.2)'},{inset:0,border:'2px solid rgba(0,212,255,0.5)'}].map((r,i)=>(
            <div key={i} style={{position:'absolute',inset:r.inset,borderRadius:'50%',border:r.border,animation:`ringPulse 2s ease-in-out ${i*0.5}s infinite`}}/>
          ))}
          <div style={{width:110,height:110,borderRadius:'50%',background:'linear-gradient(135deg,#000814,#001233)',border:'2px solid rgba(0,212,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(0,212,255,0.25)',fontSize:'3rem',animation:'spyBlink 4s ease-in-out infinite'}}>🕵️</div>
        </div>

        {/* Title */}
        <div style={{animation:'titleEntrance 0.8s ease 0.8s both'}}>
          <h1 className="font-display cyber-text animate-flicker" style={{fontSize:68,letterSpacing:6,lineHeight:1}}>IMPOSTER</h1>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:6,padding:'3px 14px',borderRadius:4,border:'1px solid rgba(0,212,255,0.3)',background:'rgba(0,212,255,0.06)',marginBottom:28}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:6,color:'rgba(0,212,255,0.7)',textTransform:'uppercase'}}>India Edition</span>
          </div>
        </div>

        {/* Mode cards */}
        <div style={{display:'flex',gap:12,marginBottom:16,animation:'titleEntrance 0.8s ease 1.1s both'}}>
          <button onClick={onSelectOffline} className="btn-press flex-1 rounded-2xl p-5 flex flex-col items-center gap-3"
            style={{background:'rgba(0,18,51,0.9)',border:'1px solid rgba(0,212,255,0.2)',boxShadow:'0 0 20px rgba(0,212,255,0.05)'}}>
            <div style={{fontSize:'2.5rem'}}>📱</div>
            <p className="font-display" style={{fontSize:'1.2rem',color:'white',letterSpacing:'0.06em'}}>OFFLINE</p>
            <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>One device, pass the phone</p>
          </button>
          <button onClick={onSelectOnline} className="btn-press flex-1 rounded-2xl p-5 flex flex-col items-center gap-3"
            style={{background:'linear-gradient(135deg,rgba(0,153,204,0.15),rgba(0,212,255,0.08))',border:'1px solid rgba(0,212,255,0.35)',boxShadow:'0 0 20px rgba(0,212,255,0.1)'}}>
            <div style={{fontSize:'2.5rem'}}>🌐</div>
            <p className="font-display" style={{fontSize:'1.2rem',color:'#00D4FF',letterSpacing:'0.06em'}}>ONLINE</p>
            <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>Each player own device</p>
          </button>
        </div>

        <p style={{fontSize:'0.7rem',color:'rgba(0,212,255,0.25)',fontFamily:"'DM Sans',sans-serif",animation:'titleEntrance 0.8s ease 1.3s both'}}>
          Tamil · Telugu · Hindi · Malayalam · English
        </p>
      </div>
    </Screen>
  );
}

// ── APP ROOT ──────────────────────────────────────────────
export default function App() {
  const { screen: onlineScreen, reconnecting } = useGame();

  useEffect(() => {
    // Apply saved theme on load
    applyTheme(getTheme());

    // Handle invite link ?join=XXXX
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.length === 4) {
      // Remove from URL
      window.history.replaceState({}, '', '/');
      // Store for join screen
      sessionStorage.setItem('auto_join_code', joinCode.toUpperCase());
    }
  }, []);
  const { screen: offlineScreen, reset } = useOffline();
  const [mode, setMode] = useState('select'); // select | online | offline

  // Online screens
  const onlineScreens = {
    home:        null, // not used — we handle mode select separately
    lobby:       <LobbyScreen />,
    playing:     <PlayingScreen />,
    spinner:     <SpinnerScreen />,
    discuss:     <DiscussScreen />,
    vote:        <VoteScreen />,
    result:      <ResultScreen />,
    leaderboard: <LeaderboardScreen />,
  };

  // Offline screens
  const offlineScreens = {
    offline_setup:       <OfflineSetupScreen onBack={()=>{reset();setMode('select');}}/>,
    offline_pass:        <OfflinePassScreen/>,
    offline_reveal:      <OfflineRevealScreen/>,
    offline_spinner:     <OfflineSpinnerScreen/>,
    offline_discuss:     <OfflineDiscussScreen/>,
    offline_vote:        <OfflineVoteScreen/>,
    offline_result:      <OfflineResultScreen/>,
    offline_leaderboard: <OfflineLeaderboardScreen/>,
  };

  if (reconnecting) return <ReconnectingScreen />;

  if(mode==='select') {
    return <ModeSelectScreen
      onSelectOnline={()=>setMode('online')}
      onSelectOffline={()=>setMode('offline')}
    />;
  }

  if(mode==='offline') {
    return offlineScreens[offlineScreen] || <OfflineSetupScreen onBack={()=>{reset();setMode('select');}}/>;
  }

  // Online mode
  if(onlineScreen==='home') {
    return <HomeScreen onBack={()=>setMode('select')}/>;
  }
  return onlineScreens[onlineScreen] || <HomeScreen onBack={()=>setMode('select')}/>;
}
