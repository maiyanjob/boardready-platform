import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Boards from './pages/Boards';
import Match from './pages/Match';
import AISearch from './pages/AISearch';
import ImportExport from './pages/ImportExport';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

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
        <Route path="/import-export" element={<ImportExport />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
