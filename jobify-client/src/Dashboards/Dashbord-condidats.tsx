import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Home, 
  Briefcase, 
  ClipboardList,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Info,
  MapPin,
  Calendar,
  Eye,
  Plus,
  Menu,
  X
} from 'lucide-react';
import '../Styles/dashbord-condidats.css';
import ProfileSettings from '../components/candidate/ProfileSettings';
import Profile from '../components/candidate/Profile';
import Offers from '../components/candidate/Offers';
import MyApplications from '../components/candidate/MyApplications';

import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/api';
import jobify_logo from '../assets/jobify-logo.svg';
import { toast } from 'react-toastify';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const navigate = useNavigate();
  const { logout, user, refreshUserData } = useAuth();

  // Debug: afficher les informations utilisateur dans la console
  useEffect(() => {
    console.log('Candidate user data:', user);
    if (user?.role === 'candidate') {
      console.log('Profile image path:', user?.profileImage);
      console.log('Candidate name:', user?.name);
    }
  }, [user]);

  // Rafraîchir les données utilisateur si nécessaire
  useEffect(() => {
    if (user?.isAuthenticated && (!user.name || !user.email)) {
      console.log('Candidate data incomplete, refreshing...');
      refreshUserData?.();
    }
  }, [user, refreshUserData]);

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    
    // Si l'image commence par http, c'est déjà une URL complète
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si le chemin commence par '/uploads/', c'est un chemin relatif depuis le serveur
    if (imagePath.startsWith('/uploads/')) {
      const API_BASE_URL = 'http://localhost:5000';
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Si c'est juste un nom de fichier
    const API_BASE_URL = 'http://localhost:5000';
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // Données du candidat
  const candidateImage = getImageUrl(user?.profileImage);
  const candidateName = user?.name || "Candidat";

  // Debug: afficher l'image finale
  useEffect(() => {
    console.log('Final candidate image URL:', candidateImage);
    console.log('Candidate name displayed:', candidateName);
    console.log('Image error state:', imageError);
  }, [candidateImage, candidateName, imageError]);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Gestion d'erreur d'image
  const handleImageError = () => {
    console.log('Candidate image failed to load:', candidateImage);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Candidate image loaded successfully:', candidateImage);
    setImageError(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{jobs.length}</h3>
              <div style={{ 
                background: 'rgba(79, 70, 229, 0.1)', 
                borderRadius: '12px', 
                padding: '12px',
                color: '#4f46e5' 
              }}>
                <Briefcase size={24} />
              </div>
            </div>
            <p>Offres disponibles</p>
          </div>
          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>IA</h3>
              <div style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                borderRadius: '12px', 
                padding: '12px',
                color: '#6366f1' 
              }}>
                <User size={24} />
              </div>
            </div>
            <p>Analyse de CV</p>
          </div>
          <div className="stat-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Tests</h3>
              <div style={{ 
                background: 'rgba(79, 70, 229, 0.1)', 
                borderRadius: '12px', 
                padding: '12px',
                color: '#4f46e5' 
              }}>
                <ClipboardList size={24} />
              </div>
            </div>
            <p>Personnalisés</p>
          </div>
        </div>

        <div className="recent-jobs-section">
          <div className="section-header">
            <h2>Offres récentes</h2>
            <button 
              onClick={() => setActiveTab('offers')} 
              className="view-all-button"
            >
              Voir toutes les offres
              <ChevronRight size={16} />
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
                    <Eye size={16} />
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
              <div className="link-icon">
                <User size={24} />
              </div>
              <div className="link-text">Mon profil</div>
            </div>
            <div className="link-box" onClick={() => setActiveTab('applications')}>
              <div className="link-icon">
                <ClipboardList size={24} />
              </div>
              <div className="link-text">Mes candidatures</div>
            </div>
            <div className="link-box" onClick={() => setActiveTab('settings')}>
              <div className="link-icon">
                <Settings size={24} />
              </div>
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
    <div className={`dashboard-wrapper-condidate ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Mobile menu toggle bouton - uniquement visible sur petits écrans */}
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <Menu size={24} />
      </div>
      
      {/* Sidebar */}
      <div className={`candidate-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Bouton de fermeture pour mobile */}
        {mobileMenuOpen && (
          <button 
            className="close-mobile-menu" 
            onClick={toggleMobileMenu}
            aria-label="Fermer le menu"
          >
            <X size={24} color="#fff" />
          </button>
        )}
        
        <div className="sidebar-content">
          <img src={jobify_logo} className="Jobify-logo-condidate" alt="Jobify Logo" />
          
          <ul className="sidebar-menu">
            <li 
              onClick={() => {
                setActiveTab('home');
                if (mobileMenuOpen) toggleMobileMenu();
              }} 
              className={activeTab === 'home' ? 'active' : ''}
            >
              <Home size={20} /> <span>Accueil</span>
            </li>
            <li 
              onClick={() => {
                setActiveTab('offers');
                if (mobileMenuOpen) toggleMobileMenu();
              }} 
              className={activeTab === 'offers' ? 'active' : ''}
            >
              <Briefcase size={20} /> <span>Offres</span>
            </li>
            <li 
              onClick={() => {
                setActiveTab('applications');
                if (mobileMenuOpen) toggleMobileMenu();
              }} 
              className={activeTab === 'applications' ? 'active' : ''}
            >
              <ClipboardList size={20} /> <span>Mes candidatures</span>
            </li>
            <li 
              onClick={() => {
                setActiveTab('profile');
                if (mobileMenuOpen) toggleMobileMenu();
              }} 
              className={activeTab === 'profile' ? 'active' : ''}
            >
              <User size={20} /> <span>Profil</span>
            </li>
            <li 
              onClick={() => {
                setActiveTab('settings');
                if (mobileMenuOpen) toggleMobileMenu();
              }} 
              className={activeTab === 'settings' ? 'active' : ''}
            >
              <Settings size={20} /> <span>Paramètres</span>
            </li>
          </ul>
        </div>

        {/* Footer avec info candidat et déconnexion */}
        <div className="candidate-sidebar-footer">
          <div className="candidate-info">
            <div className="candidate-avatar-container">
              {candidateImage && !imageError ? (
                <img
                  src={candidateImage}
                  alt={`Photo de ${candidateName}`}
                  className="candidate-avatar"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                // Fallback avec icône utilisateur
                <div className="candidate-avatar-fallback">
                  <User size={24} color="#666" />
                </div>
              )}
            </div>
            <div className="candidate-details">
              <span className="candidate-name" title={candidateName}>
                {candidateName}
              </span>
              <span className="candidate-role">
                Candidat
              </span>
            </div>
          </div>
          <button className="candidate-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="topbar-condidate">
          <div className="search-wrapper">
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="search-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div className="notification-icon">
            <Bell size={20} />
          </div>
        </div>
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;