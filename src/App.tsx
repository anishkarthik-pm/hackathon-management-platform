import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import providers
import { HackathonDataProvider } from './context/HackathonDataContext';
import { Toaster } from './components/ui/sonner';

// Import all pages
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import RegistrationPage from './pages/RegistrationPage';
import JudgeLoginPage from './pages/JudgeLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import TeamFormationPage from './pages/TeamFormationPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import ProblemStatementPage from './pages/ProblemStatementPage';
import SubmissionFormPage from './pages/SubmissionFormPage';
import LeaderboardPage from './pages/LeaderboardPage';
import JudgeDashboard from './pages/JudgeDashboard';
import ScoringInterfacePage from './pages/ScoringInterfacePage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <HackathonDataProvider>
      <Router>
        <div className="min-h-screen bg-navy-primary text-text-primary font-body">
          <Toaster position="top-right" richColors />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Role Selection - Entry point for all users */}
          <Route path="/select-role" element={<RoleSelectionPage />} />
          
          {/* Participant Routes */}
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<RegistrationPage isLogin={true} />} />
          
          {/* Judge Routes */}
          <Route path="/judge-login" element={<JudgeLoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          
          {/* Protected Participant Routes */}
          <Route path="/team-setup" element={<TeamFormationPage />} />
          <Route path="/dashboard" element={<ParticipantDashboard />} />
          <Route path="/problem" element={<ProblemStatementPage />} />
          <Route path="/submit" element={<SubmissionFormPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          
          {/* Protected Judge Routes */}
          <Route path="/judge" element={<JudgeDashboard />} />
          <Route path="/judge/score/:teamId" element={<ScoringInterfacePage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </Router>
    </HackathonDataProvider>
  );
}

export default App;
