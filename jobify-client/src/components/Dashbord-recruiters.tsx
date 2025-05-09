// Mise à jour de src/components/Dashbord-recruiters.tsx
import React, { useState, useEffect } from 'react';
import '../Styles/Dashbord-recuiters.css';
import Sidebar from './SideBar';
import { Bell } from 'lucide-react';
import { jobService, applicationService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  interface Job {
    _id: string;
    title: string;
    location?: string;
    createdAt: string;
    status: string;
  }

  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
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

  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les offres du recruteur
        const jobsResponse = await jobService.getMyJobs();
        setActiveJobs(jobsResponse.data.jobs);
        
        // Récupérer les candidatures récentes
        // Note: Dans une implémentation réelle, il faudrait un endpoint pour obtenir toutes les candidatures d'un recruteur
        // Pour l'instant, on va juste récupérer les candidatures de la première offre s'il y en a
        if (jobsResponse.data.jobs.length > 0) {
          const applicationResponse = await applicationService.getJobApplications(jobsResponse.data.jobs[0]._id);
          setRecentApplications(applicationResponse.data.applications);
        }
      } catch (err) {
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

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="card-title">✅ {activeJobs.filter(job => job.status === 'active').length}</p>
            <p>Offres actives</p>
          </div>
          <div className="stat-card">
            <p className="card-title">👥 {recentApplications.length}</p>
            <p>Candidats reçus</p>
          </div>
          <div className="stat-card">
            <p className="card-title">⚙️ {
              recentApplications.length > 0
                ? Math.round(recentApplications.reduce((acc, app) => acc + (app.aiAnalysis?.score || 0), 0) / recentApplications.length)
                : 0
            }%</p>
            <p>Score moyen IA</p>
          </div>
          <div className="stat-card">
            <p className="card-title">📅 {
              recentApplications.filter(app => app.status === 'approved').length
            }</p>
            <p>Entretiens à organiser</p>
          </div>
        </div>

        {/* Offres et Candidats */}
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

        {/* Compétences + Graphique - Conservé tel quel */}
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
                {recentApplications.slice(0, 5).map((application) => (
                  <tr key={application._id}>
                    <td>{application.candidate.email}</td>
                    <td>
                      {application.job.technicalSkills.join(', ')}
                    </td>
                  </tr>
                ))}
                {recentApplications.length === 0 && (
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
              {/* Ici, vous pourriez intégrer un graphique réel avec une bibliothèque comme Chart.js */}
              <div className="placeholder-chart">Graphique de répartition des scores</div>
            </div>
            <ul>
              <li>🔵 0 – 50%: {recentApplications.filter(app => (app.aiAnalysis?.score || 0) < 50).length}</li>
              <li>🟡 50 – 75%: {recentApplications.filter(app => (app.aiAnalysis?.score || 0) >= 50 && (app.aiAnalysis?.score || 0) < 75).length}</li>
              <li>🟢 75 – 100%: {recentApplications.filter(app => (app.aiAnalysis?.score || 0) >= 75).length}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;