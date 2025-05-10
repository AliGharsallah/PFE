// src/components/dashbord-condidats.tsx
import React, { useState, useEffect } from 'react';
import '../Styles/dashbord-condidats.css';
import jobify_logo from '../assets/jobify-logo.svg';
import ProfileSettings from '../components/ProfileSettings';
import Profile from '../components/Profile';
import MyApplications from '../components/MyApplications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/api';
import { toast } from 'react-toastify';
import Offers from '../components/Offers';

// Interface pour les offres d'emploi
interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  createdAt: string;
  status: string;
  technicalSkills?: string[];
}

const CandidateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'offers' | 'profile' | 'applications' | 'settings'>('home');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Chargement initial des offres d'emploi
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getAllJobs();
        // Filtrer pour ne garder que les offres actives
        const activeJobs = response.data.jobs.filter((job: Job) => job.status === 'active');
        setJobs(activeJobs);
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        toast.error('Impossible de charger les offres d\'emploi');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleViewJobDetails = (jobId: string) => {
    navigate(`/Offers/${jobId}`);
  };

  // Composant pour afficher les offres d'emploi
  const JobOffers = () => {
    if (loading) {
      return <div className="loading-container">Chargement des offres d'emploi...</div>;
    }

    if (jobs.length === 0) {
      return (
        <div className="no-jobs">
          <h3>Aucune offre d'emploi disponible actuellement</h3>
          <p>Revenez plus tard pour voir de nouvelles opportunités</p>
        </div>
      );
    }

    return (
      <div className="job-cards-container">
        <h2>Offres d'emploi disponibles</h2>
        <div className="job-cards-grid">
          {jobs.map((job) => (
            <div className="job-card" key={job._id}>
              <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className="company-name">{job.company}</span>
              </div>
              <div className="job-card-content">
                <p>
                  {job.description && job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </p>
                <div className="job-details">
                  <span className="job-location">📍 {job.location || 'À distance'}</span>
                  <span className="job-date">📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.technicalSkills && job.technicalSkills.length > 0 && (
                  <div className="job-skills">
                    {job.technicalSkills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {job.technicalSkills.length > 3 && (
                      <span className="more-skills">+{job.technicalSkills.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="job-card-footer">
                <button
                  className="view-job-button"
                  onClick={() => handleViewJobDetails(job._id)}
                >
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Composant pour afficher le tableau de bord principal
  const DashboardHome = () => {
    // Récupérer les 3 dernières offres pour affichage rapide
    const recentJobs = jobs.slice(0, 3);

    return (
      <div className="dashboard-home">
        <div className="welcome-section">
          <h1>Bienvenue sur votre espace candidat</h1>
          <p>Trouvez les meilleures opportunités de carrière adaptées à votre profil</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-box">
            <h3>{jobs.length}</h3>
            <p>Offres disponibles</p>
          </div>
          <div className="stat-box">
            <h3>IA</h3>
            <p>Analyse de CV</p>
          </div>
          <div className="stat-box">
            <h3>Tests</h3>
            <p>Personnalisés</p>
          </div>
        </div>

        <div className="recent-jobs-section">
          <div className="section-header">
            <h2>Offres récentes</h2>
            <button onClick={() => setActiveTab('offers')} className="view-all-button">
              Voir toutes les offres
            </button>
          </div>

          <div className="recent-jobs-list">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div className="recent-job-card" key={job._id}>
                  <div className="job-title-company">
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>
                  <button
                    onClick={() => handleViewJobDetails(job._id)}
                    className="view-job-button-small"
                  >
                    Voir
                  </button>
                </div>
              ))
            ) : (
              <p className="no-recent-jobs">Aucune offre récente disponible</p>
            )}
          </div>
        </div>

        <div className="quick-links">
          <h2>Accès rapides</h2>
          <div className="links-grid">
            <div className="link-box" onClick={() => setActiveTab('profile')}>
              <div className="link-icon">👤</div>
              <div className="link-text">Mon profil</div>
            </div>
            <div className="link-box" onClick={() => setActiveTab('applications')}>
              <div className="link-icon">📋</div>
              <div className="link-text">Mes candidatures</div>
            </div>
            <div className="link-box" onClick={() => setActiveTab('settings')}>
              <div className="link-icon">⚙️</div>
              <div className="link-text">Paramètres</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour rendre le contenu actif
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />;
      case 'offers':
        return <Offers />;
      case 'profile':
        return <Profile />;
      case 'applications':
        return <MyApplications />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard-wrapper-condidate">
      {/* Sidebar */}
      <div className="candidate-sidebar">
        <img src={jobify_logo} className="Jobify-logo-condidate" alt="Jobify Logo" />
        <ul className="sidebar-menu">
          <li onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>
            🏠 Accueil
          </li>
          <li onClick={() => setActiveTab('offers')} className={activeTab === 'offers' ? 'active' : ''}>
            📄 Offres
          </li>
          <li onClick={() => setActiveTab('applications')} className={activeTab === 'applications' ? 'active' : ''}>
            📋 Mes candidatures
          </li>
          <li onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>
            👤 Profil
          </li>
          <li onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>
            ⚙️ Paramètres
          </li>
          <li className="logout" onClick={handleLogout}>
            🚪 Déconnexion
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="topbar-condidate">
          <input type="text" placeholder="Rechercher..." className="search-input" />
          <div className="notification-icon">🔔</div>
        </div>
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;