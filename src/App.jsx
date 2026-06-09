import { useGame } from './context/GameContext';
import {
  HomeScreen, LobbyScreen, PlayingScreen,
  SpinnerScreen, DiscussScreen, VoteScreen,
  ResultScreen, LeaderboardScreen,
} from './screens';

export default function App() {
  const { screen } = useGame();

  const screens = {
    home:        <HomeScreen />,
    lobby:       <LobbyScreen />,
    playing:     <PlayingScreen />,
    spinner:     <SpinnerScreen />,
    discuss:     <DiscussScreen />,
    vote:        <VoteScreen />,
    result:      <ResultScreen />,
    leaderboard: <LeaderboardScreen />,
  };

  return screens[screen] || <HomeScreen />;
}
