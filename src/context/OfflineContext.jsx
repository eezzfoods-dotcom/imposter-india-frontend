import { createContext, useContext, useReducer } from 'react';
import { ALL_ROUNDS } from '../data/gameData';

const OfflineContext = createContext(null);

const COLORS = ['#00D4FF','#FF3C78','#00FF94','#FFB800','#C44DFF','#FF6B35','#00E5FF','#FF4081','#69FF47','#FF9100'];
const EMOJIS = ['🎬','🎭','🎥','🍿','🎞','🎦','📽','🎪','🎨','🃏'];

const PTS = { votedRight:3, votedWrong:-1, impEscape:4, impCaught:-2 };

const INITIAL = {
  screen: 'offline_setup',
  players: [],
  cfg: { rounds:5, langs:['Tamil'], cats:['Movies','Foods','Locations'] },
  scores: {},
  roundNum: 0,
  totalRounds: 5,
  usedRounds: [],
  usedImps: [],
  lastImp: -1,
  round: null,
  impIdx: -1,
  firstIdx: 0,
  spinnerSeed: 0,
  locList: [],
  resolvedClue: { label:'', value:'' },
  passIdx: 0,          // which player is currently seeing their card
  passOrder: [],       // shuffled order for card reveal
  votes: {},           // { voterIdx: votedIdx }
  resultData: null,
  roundHistory: [],
};

function pickRound(cfg, usedIndices) {
  const { langs=['Tamil'], cats=['Movies','Foods','Locations'] } = cfg;
  function catOk(r) {
    if(r.c==='Food') return cats.includes('Foods');
    if(r.c==='Location') return cats.includes('Locations');
    if(r.c==='Movie') return cats.includes('Movies');
    return true;
  }
  function langOk(r) { return r.c==='Food'||r.c==='Location'||langs.includes(r.l); }

  let avail = ALL_ROUNDS.map((r,i)=>({r,i})).filter(({r,i})=>!usedIndices.includes(i)&&catOk(r)&&langOk(r));
  if(!avail.length) avail = ALL_ROUNDS.map((r,i)=>({r,i})).filter(({r})=>catOk(r)&&langOk(r));
  if(!avail.length) return null;
  return avail[Math.floor(Math.random()*avail.length)];
}

function resolveClue(round, clueType='director') {
  if(!round) return {label:'Director',value:''};
  if(round.c==='Location') return {label:'',value:''};
  if(round.c==='Food') return {label:'Origin',value:round.d||''};
  const map = {hero:round.hero,heroine:round.heroine,comedian:round.comedian};
  const raw = map[clueType];
  if(!raw||raw==='None'||raw===round.d) return {label:'Director',value:round.d||''};
  return {label:{hero:'Hero',heroine:'Heroine',comedian:'Comedian'}[clueType],value:raw};
}

function pickClueType(round) {
  if(!round||round.l!=='Tamil') return 'director';
  const opts=['director'];
  if(round.hero&&round.hero!=='None'&&round.hero!==round.d) opts.push('hero');
  if(round.heroine&&round.heroine!=='None'&&round.heroine!==round.d) opts.push('heroine');
  if(round.comedian&&round.comedian!=='None'&&round.comedian!==round.d) opts.push('comedian');
  return opts[Math.floor(Math.random()*opts.length)];
}

function genLocList(roundName) {
  const all = ALL_ROUNDS.filter(r=>r.c==='Location').map(r=>r.n);
  const decoys = all.filter(n=>n!==roundName).sort(()=>Math.random()-0.5);
  return [roundName,...decoys.slice(0,14)].sort();
}

function setupRound(state) {
  const picked = pickRound(state.cfg, state.usedRounds);
  if(!picked) return state;
  const { index, r: round } = picked;
  const usedRounds = [...state.usedRounds, index];

  // Pick imposter - round robin
  const n = state.players.length;
  let pool = state.players.map((_,i)=>i).filter(i=>!state.usedImps.includes(i));
  if(!pool.length) pool = state.players.map((_,i)=>i);
  const noRepeat = pool.filter(i=>i!==state.lastImp);
  const finalPool = noRepeat.length ? noRepeat : pool;
  const impIdx = finalPool[Math.floor(Math.random()*finalPool.length)];
  let usedImps = [...state.usedImps, impIdx];
  if(usedImps.length >= n) usedImps = [impIdx];

  // Clue
  const clueType = pickClueType(round);
  const resolvedClue = resolveClue(round, clueType);

  // Location list
  const locList = round.c==='Location' ? genLocList(round.n) : [];

  // First speaker
  const firstIdx = Math.floor(Math.random()*n);
  const spinnerSeed = Math.floor(Math.random()*100000);

  // Shuffle pass order
  const passOrder = [...Array(n).keys()].sort(()=>Math.random()-0.5);

  return {
    ...state,
    round, usedRounds, impIdx, usedImps, lastImp:impIdx,
    resolvedClue, locList, firstIdx, spinnerSeed,
    passOrder, passIdx:0,
    votes:{}, resultData:null,
    screen:'offline_pass',
  };
}

function reducer(state, action) {
  switch(action.type) {

    case 'START_GAME': {
      const cfg = action.cfg;
      const players = action.players;
      const scores = {};
      players.forEach((_,i)=>scores[i]=0);
      const newState = {
        ...INITIAL,
        players, cfg,
        scores,
        totalRounds: cfg.rounds,
        roundNum: 1,
      };
      return setupRound(newState);
    }

    case 'NEXT_PASS':
      return { ...state, passIdx: state.passIdx+1, screen:'offline_pass' };

    case 'SHOW_REVEAL':
      return { ...state, screen:'offline_reveal' };

    case 'SHOW_SPINNER':
      return { ...state, screen:'offline_spinner' };

    case 'SHOW_DISCUSS':
      return { ...state, screen:'offline_discuss' };

    case 'SHOW_VOTE':
      return { ...state, screen:'offline_vote', votes:{} };

    case 'CAST_VOTE':
      return { ...state, votes:{ ...state.votes, [action.voterIdx]:action.votedIdx } };

    case 'LOCK_VOTES': {
      const tally = {};
      Object.values(state.votes).forEach(v=>{ tally[v]=(tally[v]||0)+1; });
      const maxV = Math.max(0,...Object.values(tally));
      const top = Object.keys(tally).filter(k=>tally[k]===maxV).map(Number);
      const eliminatedIdx = top.length===1 ? top[0] : -1;
      const impCaught = eliminatedIdx === state.impIdx;

      const newScores = {...state.scores};
      state.players.forEach((_,i)=>{
        const isImp = i===state.impIdx;
        if(isImp){
          newScores[i] = (newScores[i]||0) + (impCaught ? PTS.impCaught : PTS.impEscape);
        } else {
          const myVote = state.votes[i];
          if(myVote !== undefined){
            const votedCorrectly = myVote === state.impIdx;
            newScores[i] = (newScores[i]||0) + (votedCorrectly ? PTS.votedRight : PTS.votedWrong);
          }
        }
      });

      const resultData = { eliminatedIdx, impCaught, imposterRevealed:false, impIdxs:[state.impIdx], tally };
      const roundHistory = [...state.roundHistory, { name:state.round.n, impIdx:state.impIdx, caught:impCaught }];

      return { ...state, scores:newScores, resultData, roundHistory, screen:'offline_result' };
    }

    case 'IMPOSTER_WON': {
      const newScores = {...state.scores};
      state.players.forEach((_,i)=>{
        const isImp = i===state.impIdx;
        newScores[i] = (newScores[i]||0) + (isImp ? PTS.impEscape : PTS.votedWrong);
      });
      const resultData = { eliminatedIdx:-1, impCaught:false, imposterRevealed:true, impIdxs:[state.impIdx], tally:{} };
      const roundHistory = [...state.roundHistory, { name:state.round.n, impIdx:state.impIdx, caught:false }];
      return { ...state, scores:newScores, resultData, roundHistory, screen:'offline_result' };
    }

    case 'NEXT_ROUND': {
      if(state.roundNum >= state.totalRounds) {
        return { ...state, screen:'offline_leaderboard' };
      }
      return setupRound({ ...state, roundNum:state.roundNum+1 });
    }

    case 'GO_LEADERBOARD':
      return { ...state, screen:'offline_leaderboard' };

    case 'RESET':
      return INITIAL;

    default:
      return state;
  }
}

export function OfflineProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const actions = {
    startGame: (players, cfg) => dispatch({ type:'START_GAME', players, cfg }),
    nextPass:  () => dispatch({ type:'NEXT_PASS' }),
    showReveal:  () => dispatch({ type:'SHOW_REVEAL' }),
    showSpinner: () => dispatch({ type:'SHOW_SPINNER' }),
    showDiscuss: () => dispatch({ type:'SHOW_DISCUSS' }),
    showVote:    () => dispatch({ type:'SHOW_VOTE' }),
    castVote:    (voterIdx, votedIdx) => dispatch({ type:'CAST_VOTE', voterIdx, votedIdx }),
    lockVotes:   () => dispatch({ type:'LOCK_VOTES' }),
    imposterWon: () => dispatch({ type:'IMPOSTER_WON' }),
    nextRound:   () => dispatch({ type:'NEXT_ROUND' }),
    goLeaderboard: () => dispatch({ type:'GO_LEADERBOARD' }),
    reset:       () => dispatch({ type:'RESET' }),
    COLORS, EMOJIS,
  };

  return (
    <OfflineContext.Provider value={{ ...state, ...actions }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
