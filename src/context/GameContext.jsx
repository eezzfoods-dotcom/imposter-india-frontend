import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext(null);

const INITIAL = {
  screen: 'home',        // home | host_setup | join | lobby | playing | spinner | discuss | vote | result | leaderboard
  room: null,            // full room state from server
  myIdx: -1,
  myRole: null,          // { isImp, round, resolvedClue, locList, impIdxs, partnerIdx }
  resultData: null,      // { eliminatedIdx, impCaught, imposterRevealed, impIdxs, tally }
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':    return { ...state, screen: action.screen, error: null };
    case 'SET_ROOM':      return { ...state, room: action.room };
    case 'SET_MY_IDX':    return { ...state, myIdx: action.idx };
    case 'SET_MY_ROLE':   return { ...state, myRole: action.role };
    case 'SET_RESULT':    return { ...state, resultData: action.data };
    case 'SET_ERROR':     return { ...state, error: action.error };
    case 'RESET':         return { ...INITIAL };
    default:              return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { socket } = useSocket();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!socket) return;

    // Server broadcasts new room state
    socket.on('room:update', (room) => {
      dispatch({ type: 'SET_ROOM', room });
      // Sync screen with phase — always update screen on room:update
      const phaseToScreen = {
        lobby:       'lobby',
        playing:     'playing',
        spinner:     'spinner',
        discuss:     'discuss',
        vote:        'vote',
        result:      'result',
        leaderboard: 'leaderboard',
      };
      const newScreen = phaseToScreen[room.phase];
      if (newScreen) {
        dispatch({ type: 'SET_SCREEN', screen: newScreen });
      }
    });

    // Server sends private role
    socket.on('game:role', (role) => {
      dispatch({ type: 'SET_MY_ROLE', role });
    });

    // Result data
    socket.on('game:result', (data) => {
      dispatch({ type: 'SET_RESULT', data });
    });

    return () => {
      socket.off('room:update');
      socket.off('game:role');
      socket.off('game:result');
    };
  }, [socket]);

  // ── ACTIONS ──────────────────────────────────────────────
  const actions = {
    goHome: () => dispatch({ type: 'RESET' }),

    createRoom: (hostName, cfg, cb) => {
      socket.emit('room:create', { hostName, cfg }, (res) => {
        if (!res.ok) return dispatch({ type: 'SET_ERROR', error: res.error });
        dispatch({ type: 'SET_MY_IDX', idx: res.playerIdx });
        dispatch({ type: 'SET_ROOM', room: res.room });
        dispatch({ type: 'SET_SCREEN', screen: 'lobby' });
        cb && cb(res);
      });
    },

    joinRoom: (code, playerName, cb) => {
      socket.emit('room:join', { code, playerName }, (res) => {
        if (!res.ok) return dispatch({ type: 'SET_ERROR', error: res.error });
        dispatch({ type: 'SET_MY_IDX', idx: res.playerIdx });
        dispatch({ type: 'SET_ROOM', room: res.room });
        dispatch({ type: 'SET_SCREEN', screen: 'lobby' });
        cb && cb(res);
      });
    },

    removePlayer: (playerIdx) => {
      socket.emit('room:remove_player', { playerIdx });
    },

    startGame: (cb) => {
      socket.emit('game:start', {}, (res) => {
        if (res && !res.ok) dispatch({ type: 'SET_ERROR', error: res.error });
        cb && cb(res);
      });
    },

    moveToSpinner: () => socket.emit('game:spinner'),
    moveToDiscuss: () => socket.emit('game:discuss'),
    moveToVote:    () => socket.emit('game:vote'),

    castVote: (votedIdx) => socket.emit('game:cast_vote', { votedIdx }),

    lockVotes: () => socket.emit('game:lock_votes'),

    imposterWon: () => socket.emit('game:imposter_won'),

    nextRound: (cb) => {
      socket.emit('game:next_round', {}, (res) => {
        if (res && !res.ok) dispatch({ type: 'SET_ERROR', error: res.error });
        cb && cb(res);
      });
    },

    goLeaderboard: () => socket.emit('game:leaderboard'),

    playAgain: () => socket.emit('game:play_again'),

    clearError: () => dispatch({ type: 'SET_ERROR', error: null }),
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
