import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext(null);

const INITIAL = {
  screen: 'home',
  room: null,
  myIdx: -1,
  myRole: null,
  resultData: null,
  error: null,
  reconnecting: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':       return { ...state, screen: action.screen, error: null };
    case 'SET_ROOM':         return { ...state, room: action.room };
    case 'SET_MY_IDX':       return { ...state, myIdx: action.idx };
    case 'SET_MY_ROLE':      return { ...state, myRole: action.role };
    case 'SET_RESULT':       return { ...state, resultData: action.data };
    case 'SET_ERROR':        return { ...state, error: action.error };
    case 'SET_RECONNECTING': return { ...state, reconnecting: action.value };
    case 'RESET':            return { ...INITIAL };
    default:                 return state;
  }
}

// Save session to localStorage for reconnection
function saveSession(code, playerName, playerIdx) {
  try {
    localStorage.setItem('ii_session', JSON.stringify({ code, playerName, playerIdx, ts: Date.now() }));
  } catch(e) {}
}

function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem('ii_session') || 'null');
    if (!s) return null;
    // Expire after 3 hours
    if (Date.now() - s.ts > 3 * 60 * 60 * 1000) {
      localStorage.removeItem('ii_session');
      return null;
    }
    return s;
  } catch(e) { return null; }
}

function clearSession() {
  try { localStorage.removeItem('ii_session'); } catch(e) {}
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { socket, connected } = useSocket();
  const stateRef = useRef(state);
  stateRef.current = state;
  const reconnectAttempted = useRef(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('room:update', (room) => {
      dispatch({ type: 'SET_ROOM', room });
      const phaseToScreen = {
        lobby: 'lobby', playing: 'playing', spinner: 'spinner',
        discuss: 'discuss', vote: 'vote', result: 'result', leaderboard: 'leaderboard',
      };
      const newScreen = phaseToScreen[room.phase];
      if (newScreen) dispatch({ type: 'SET_SCREEN', screen: newScreen });
    });

    socket.on('game:role', (role) => {
      dispatch({ type: 'SET_MY_ROLE', role });
    });

    socket.on('game:exit', () => {
      localStorage.removeItem('ii_session');
      dispatch({ type: 'RESET' });
    });

    socket.on('game:result', (data) => {
      dispatch({ type: 'SET_RESULT', data });
    });

    return () => {
      socket.off('room:update');
      socket.off('game:role');
      socket.off('game:result');
      socket.off('game:exit');
    };
  }, [socket]);

  // Auto-reconnect on connect if session exists
  useEffect(() => {
    if (!socket || !connected || reconnectAttempted.current) return;
    if (stateRef.current.room) return; // already in game

    const session = loadSession();
    if (!session) return;

    reconnectAttempted.current = true;
    dispatch({ type: 'SET_RECONNECTING', value: true });

    socket.emit('room:reconnect', { code: session.code, playerName: session.playerName }, (res) => {
      dispatch({ type: 'SET_RECONNECTING', value: false });
      if (res.ok) {
        dispatch({ type: 'SET_MY_IDX', idx: res.playerIdx });
        dispatch({ type: 'SET_ROOM', room: res.room });
        const phaseToScreen = {
          lobby: 'lobby', playing: 'playing', spinner: 'spinner',
          discuss: 'discuss', vote: 'vote', result: 'result', leaderboard: 'leaderboard',
        };
        const screen = phaseToScreen[res.room.phase] || 'lobby';
        dispatch({ type: 'SET_SCREEN', screen });
        saveSession(session.code, session.playerName, res.playerIdx);
      } else {
        clearSession();
      }
    });
  }, [socket, connected]);

  const actions = {
    goHome: () => {
      clearSession();
      reconnectAttempted.current = false;
      dispatch({ type: 'RESET' });
    },

    createRoom: (hostName, cfg, cb) => {
      socket.emit('room:create', { hostName, cfg }, (res) => {
        if (!res.ok) return dispatch({ type: 'SET_ERROR', error: res.error });
        dispatch({ type: 'SET_MY_IDX', idx: res.playerIdx });
        dispatch({ type: 'SET_ROOM', room: res.room });
        dispatch({ type: 'SET_SCREEN', screen: 'lobby' });
        saveSession(res.code, hostName, res.playerIdx);
        cb && cb(res);
      });
    },

    joinRoom: (code, playerName, cb) => {
      socket.emit('room:join', { code, playerName }, (res) => {
        if (!res.ok) return dispatch({ type: 'SET_ERROR', error: res.error });
        dispatch({ type: 'SET_MY_IDX', idx: res.playerIdx });
        dispatch({ type: 'SET_ROOM', room: res.room });
        dispatch({ type: 'SET_SCREEN', screen: 'lobby' });
        saveSession(code, playerName, res.playerIdx);
        cb && cb(res);
      });
    },

    removePlayer: (playerIdx) => socket.emit('room:remove_player', { playerIdx }),
    startGame:    (cb) => socket.emit('game:start', {}, (res) => { if (res && !res.ok) dispatch({ type: 'SET_ERROR', error: res.error }); cb && cb(res); }),
    moveToSpinner: () => socket.emit('game:spinner'),
    moveToDiscuss: () => socket.emit('game:discuss'),
    moveToVote:    () => socket.emit('game:vote'),
    castVote:      (votedIdx) => socket.emit('game:cast_vote', { votedIdx }),
    lockVotes:     () => socket.emit('game:lock_votes'),
    imposterWon:   () => socket.emit('game:imposter_won'),
    nextRound:     (cb) => socket.emit('game:next_round', {}, (res) => { if (res && !res.ok) dispatch({ type: 'SET_ERROR', error: res.error }); cb && cb(res); }),
    goLeaderboard: () => socket.emit('game:leaderboard'),
    playAgain:     () => { clearSession(); socket.emit('game:play_again'); },
    exitGame: () => {
      socket.emit('game:exit');
      localStorage.removeItem('ii_session');
      reconnectAttempted.current = false;
      dispatch({ type: 'RESET' });
    },

    clearError:    () => dispatch({ type: 'SET_ERROR', error: null }),
  };

  return (
    <GameContext.Provider value={{ ...state, ...actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
