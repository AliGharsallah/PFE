// Mise à jour de src/App.tsx avec les nouveaux composants

import './Styles/App.css';
import JobifyAIHome from './Pages/JobifyAIHome';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashbord-recruiters';
import CandidateDashboard from './Pages/dashbord-condidats';
import ProfileSettings from './components/ProfileSettings';
import ProtectedRoute from './components/ProtectedRoute';
import JobOffers from './components/Offers';
import JobDetailPage from './Pages/JobDetailsPage';
import CreateJobForm from './components/CreateJobForm';
import MyApplications from './components/MyApplications';
import ApplicationDetailPage from './Pages/JobDetailsPage';
import TechnicalTestPage from './Pages/TechnicalTestPage';
import TestResultsPage from './Pages/TestResultPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<JobifyAIHome />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/Offers" element={<JobOffers />} />
        <Route path="/Offers/:id" element={<JobDetailPage />} />

        {/* Routes protégées pour recruteurs */}
        <Route
          path="/recruiters"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-job"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <CreateJobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <ApplicationDetailPage />
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
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute requiredRole="candidate">
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technical-test/:id"
          element={
            <ProtectedRoute requiredRole="candidate">
              <TechnicalTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-results/:id"
          element={
            <ProtectedRoute requiredRole="candidate">
              <TestResultsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;