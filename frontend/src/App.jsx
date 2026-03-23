import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Boards from './pages/Boards';
import Match from './pages/Match';
import AISearch from './pages/AISearch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/match" element={<Match />} />
        <Route path="/search" element={<AISearch />} />
      </Routes>
    </Router>
  );
}

export default App;
