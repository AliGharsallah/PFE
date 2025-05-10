// src/components/Dashbord-recruiters.tsx
import React, { useState, useEffect } from 'react';
import '../Styles/Dashbord-recuiters.css';
import Sidebar from '../components/SideBar';
import { Bell } from 'lucide-react';
import { jobService, applicationService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Define interfaces outside the component
interface Job {
  _id: string;
  title: string;
  location?: string;
  createdAt: string;
  status: string;
}

interface Application {
  _id: string;
  candidate: {
    name: string;
    email: string;
  };
  aiAnalysis?: {
    score?: number;
  };
  status: string;
  job: {
    technicalSkills: string[];
  };
}

const Dashboard: React.FC = () => {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get recruiter's jobs
        const jobsResponse = await jobService.getMyJobs();
        setActiveJobs(jobsResponse.data.jobs);

        // Get recent applications
        if (jobsResponse.data.jobs.length > 0) {
          try {
            const applicationResponse = await applicationService.getJobApplications(jobsResponse.data.jobs[0]._id);
            setRecentApplications(applicationResponse.data.applications);
          } catch (appError) {
            console.error('Error fetching applications:', appError);
            // Don't fail the entire dashboard if just the applications fail
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateJob = () => {
    navigate('/create-job');
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  // Calculate metrics
  const activeJobsCount = activeJobs.filter(job => job.status === 'active').length;
  const candidatesCount = recentApplications.length;

  const averageAIScore = recentApplications.length > 0
    ? Math.round(recentApplications.reduce((acc, app) => acc + (app.aiAnalysis?.score || 0), 0) / recentApplications.length)
    : 0;

  const interviewsCount = recentApplications.filter(app => app.status === 'approved').length;

  // AI score distribution
  const lowScoreCount = recentApplications.filter(app => (app.aiAnalysis?.score || 0) < 50).length;
  const mediumScoreCount = recentApplications.filter(app => (app.aiAnalysis?.score || 0) >= 50 && (app.aiAnalysis?.score || 0) < 75).length;
  const highScoreCount = recentApplications.filter(app => (app.aiAnalysis?.score || 0) >= 75).length;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-container">
        <div className="topbar">
          <input
            type="text"
            placeholder="Rechercher..."
            className="search-input"
          />
          <div className="notification-icon">
            <Bell size={20} />
          </div>
        </div>
        <h1>Overview</h1>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="card-title">✅ {activeJobsCount}</p>
            <p>Offres actives</p>
          </div>
          <div className="stat-card">
            <p className="card-title">👥 {candidatesCount}</p>
            <p>Candidats reçus</p>
          </div>
          <div className="stat-card">
            <p className="card-title">⚙️ {averageAIScore}%</p>
            <p>Score moyen IA</p>
          </div>
          <div className="stat-card">
            <p className="card-title">📅 {interviewsCount}</p>
            <p>Entretiens à organiser</p>
          </div>
        </div>

        {/* Jobs and Candidates */}
        <div className="cards-grid">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Offres d'emploi récentes</h2>
              <button className="simple-button" onClick={handleCreateJob}>Créer une nouvelle</button>
            </div>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Offre d'emploi</th>
                    <th>Location</th>
                    <th>Date création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeJobs.slice(0, 5).map((job) => (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td>{job.location || 'Non spécifié'}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => handleViewJob(job._id)}
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeJobs.length === 0 && (
                    <tr>
                      <td colSpan={4}>Aucune offre d'emploi pour le moment</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Candidats récents</h2>
              <button className="simple-button" onClick={handleCreateJob}>Publier une offre</button>
            </div>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Score IA</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.slice(0, 5).map((application) => (
                    <tr key={application._id}>
                      <td>{application.candidate.name}</td>
                      <td>{application.candidate.email}</td>
                      <td>{application.aiAnalysis?.score || 'N/A'}%</td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => handleViewApplication(application._id)}
                        >
                          👁 Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentApplications.length === 0 && (
                    <tr>
                      <td colSpan={4}>Aucune candidature pour le moment</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="cards-grid">
          <div className="card">
            <h2 className="card-title">Compétences des candidats</h2>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Compétences</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.length > 0 ? (
                  recentApplications.filter(app => app.job && app.job.technicalSkills).slice(0, 5).map((application) => (
                    <tr key={application._id}>
                      <td>{application.candidate.email}</td>
                      <td>
                        {application.job.technicalSkills.join(', ') || 'Aucune compétence spécifiée'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>Aucune candidature pour le moment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="card-title">Répartition des scores IA</h2>
            <div className="pie-chart">
              {/* Graphique */}
              <div className="placeholder-chart">Graphique de répartition des scores</div>
            </div>
            <ul>
              <li>🔵 0 – 50%: {lowScoreCount}</li>
              <li>🟡 50 – 75%: {mediumScoreCount}</li>
              <li>🟢 75 – 100%: {highScoreCount}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
      );
};

      export default Dashboard;