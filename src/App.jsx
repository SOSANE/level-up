import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { usePlayer } from './api/player.jsx';
import Nav from './components/Nav.jsx';
import Story from './pages/Story.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuestTimer from './pages/QuestTimer.jsx';
import Rift from './pages/Rift.jsx';
import Gate from './pages/Gate.jsx';
import Profile from './pages/Profile.jsx';
import Customize from './pages/Customize.jsx';

// Everything past onboarding needs a player with 10+ categories and a character.
function RequirePlayer() {
  const { player } = usePlayer();
  return player.onboarded ? <Outlet /> : <Navigate to="/onboarding" replace />;
}

function WithNav() {
  return (<><Nav /><Outlet /></>);
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Story />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<RequirePlayer />}>
        <Route path="/quest/:id" element={<QuestTimer />} />
        <Route path="/rift" element={<Rift />} />
        <Route element={<WithNav />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gate" element={<Gate />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/customize" element={<Customize />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
