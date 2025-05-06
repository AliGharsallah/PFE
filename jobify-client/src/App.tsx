import './Styles/App.css';
import JobifyAIHome from './components/JobifyAIHome';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashbord-recruiters';
import CandidateDashboard from './components/dashbord-condidats';
import ProfileSettings from './components/ProfileSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<JobifyAIHome />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Routes protégées pour recruteurs */}
        <Route
          path="/recruiters"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Routes protégées pour candidats */}
        <Route
          path="/Condidates"
          element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Candidate-settings"
          element={
            <ProtectedRoute requiredRole="candidate">
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;