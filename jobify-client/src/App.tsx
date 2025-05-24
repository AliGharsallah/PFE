// Mise à jour de src/App.tsx avec les nouveaux composants
import './Styles/App.css';
import JobifyAIHome from './Pages/JobifyAIHome';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Dashboards/Dashbord-recruiters';
import CandidateDashboard from './Dashboards/Dashbord-condidats';
import ProfileSettings from './components/candidate/ProfileSettings';
import ProtectedRoute from './components/ProtectedRoute';
import JobOffers from './components/candidate/Offers';
import JobDetailPage from './Pages/JobDetailsPage';
import CreateJobForm from './components/CreateJobForm';
import EditJobPage from './Pages/EditJobPage'; // Assurez-vous que c'est le bon chemin
import MyApplications from './components/candidate/MyApplications';
import ApplicationDetailPage from './Pages/ApplicationDetailPage'; // Assurez-vous que c'est le bon chemin
import TechnicalTestPage from './Pages/TechnicalTestPage';
import TestResultsPage from './Pages/TestResultPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext'; // Ajout de l'AuthProvider si vous l'utilisez
import AdminDashboard from './Dashboards/Dashboard-admins'; // Assurez-vous que c'est le bon chemin
import PsychologicalTest from './Pages/PsychologicalTest'; // Assurez-vous que c'est le bon chemin


function App() {
  return (
    <AuthProvider> {/* Ajoutez ceci si vous utilisez un AuthProvider */}
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<JobifyAIHome />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/Offers" element={<JobOffers />} />
          <Route path="/Offers/:id" element={<JobDetailPage />} />
          <Route path="/test-psychologique" element={<PsychologicalTest />} />

          {/* Route pour le tableau de bord admin */}   

          <Route
            path="/admin/dashboard"
            element={
               <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
                 </ProtectedRoute>
            }
          />


          {/* Routes protégées pour recruteurs */}
          <Route
            path="/recruiters/*"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/edit-job/:id"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <EditJobPage />
              </ProtectedRoute>
            } />
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
            path="/Condidates/*"
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

          {/* Route pour les pages non trouvées */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;