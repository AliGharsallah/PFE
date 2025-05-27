// src/Pages/Dashbord-recruiters.tsx
import React, { useState, useEffect } from 'react';
import '../Styles/Dashbord-recuiters.css';
// Importer les composants nécessaires pour chaque onglet
import OverviewContent from '../components/recruiter/OverviewContent';
import JobsContent from '../components/recruiter/JobsContent';
import CandidatesContent from '../components/recruiter/CandidatesContent';
import StatisticsContent from '../components/recruiter/StatisticsContent';
import SettingsContent from '../components/recruiter/SettingsContent';

// Icônes
import {
  Bell,
  Home,
  Briefcase,
  UserCheck,
  Settings,
  BarChart3,
  LogOut,
  X,
  Menu,
  Building2 // Icône par défaut pour l'entreprise
} from 'lucide-react';

import { jobService, applicationService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import jobify_logo from '../assets/jobify-logo.svg';

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

type TabType = 'overview' | 'jobs' | 'candidates' | 'statistics' | 'settings';

const Dashboard: React.FC = () => {
  // État pour les données
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // État pour la navigation
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { logout, user, refreshUserData } = useAuth();

  // Debug: afficher les informations utilisateur dans la console
  useEffect(() => {
    console.log('Auth user data:', user);
    if (user?.role === 'recruiter') {
      console.log('Company logo path:', user?.companyInfo?.companyLogo);
      console.log('Profile image path:', user?.profileImage);
      console.log('Company name:', user?.companyInfo?.companyName);
    }
  }, [user]);

  // Rafraîchir les données utilisateur si nécessaire
  useEffect(() => {
    if (user?.isAuthenticated && (!user.name || !user.email)) {
      console.log('User data incomplete, refreshing...');
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
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Si c'est juste un nom de fichier
const API_BASE_URL = 'http://localhost:5000';
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // Fonction pour obtenir l'image appropriée selon le rôle
  const getUserDisplayImage = () => {
    if (user?.role === 'recruiter') {
      // Pour un recruteur, prioriser le logo de l'entreprise
      return user?.companyInfo?.companyLogo || user?.profileImage;
    }
    // Pour un candidat, utiliser l'image de profil
    return user?.profileImage;
  };

  // Données de l'entreprise avec gestion d'image améliorée
  const userDisplayImage = getImageUrl(getUserDisplayImage());
  const companyName = user?.companyInfo?.companyName || user?.name || "Mon Entreprise";
  const userRole = user?.role === 'recruiter' ? "Recruteur" : "Utilisateur";

  // Debug: afficher l'image finale
  useEffect(() => {
    console.log('Final image URL:', userDisplayImage);
    console.log('Company name displayed:', companyName);
    console.log('Image error state:', imageError);
  }, [userDisplayImage, companyName, imageError]);

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

  // Gestion des onglets
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Fermer le menu mobile après sélection d'un onglet
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Gestion d'erreur d'image
  const handleImageError = () => {
    console.log('Image failed to load:', userDisplayImage);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', userDisplayImage);
    setImageError(false);
  };

  // Fonction pour afficher le contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <h1>Tableau de bord</h1>
            <OverviewContent
              activeJobs={activeJobs}
              recentApplications={recentApplications}
              loading={loading}
              navigate={navigate}
            />
          </>
        );
      case 'jobs':
        return (
          <JobsContent
            jobs={activeJobs}
            loading={loading}
            navigate={navigate}
          />
        );
      case 'candidates':
        return (
          <CandidatesContent
            applications={recentApplications}
            loading={loading}
            navigate={navigate}
          />
        );
      case 'statistics':
        return (
          <StatisticsContent
            jobs={activeJobs}
            applications={recentApplications}
            loading={loading}
          />
        );
      case 'settings':
        return (
          <SettingsContent
          />
        );
      default:
        return null;
    }
  };

  // Toggle pour le menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`dashboard-wrapper ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Bouton pour ouvrir le menu mobile */}
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <Menu size={24} />
      </div>

      {/* Sidebar intégrée directement */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Bouton de fermeture pour mobile */}
        {isMobileMenuOpen && (
          <button
            className="close-mobile-menu"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={24} color="#fff" />
          </button>
        )}
        <div>
          {/* Logo */}
          <img
            className="sidebar-logo"
            src={jobify_logo}
            alt="Jobify Logo"
            onClick={() => handleTabChange('overview')}
          />
          {/* Navigation principale */}
          <nav className="sidebar-nav">
            <p className="sidebar-section-title">Général</p>
            <ul>
              <li
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => handleTabChange('overview')}
              >
                <Home size={20} />
                <span>Tableau de bord</span>
              </li>
              <li
                className={activeTab === 'jobs' ? 'active' : ''}
                onClick={() => handleTabChange('jobs')}
              >
                <Briefcase size={20} />
                <span>Offres d'emploi</span>
              </li>
              <li
                className={activeTab === 'candidates' ? 'active' : ''}
                onClick={() => handleTabChange('candidates')}
              >
                <UserCheck size={20} />
                <span>Candidats</span>
              </li>
            </ul>
            <p className="sidebar-section-title">Analyse</p>
            <ul>
              <li
                className={activeTab === 'statistics' ? 'active' : ''}
                onClick={() => handleTabChange('statistics')}
              >
                <BarChart3 size={20} />
                <span>Statistiques</span>
              </li>
              <li
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => handleTabChange('settings')}
              >
                <Settings size={20} />
                <span>Paramètres</span>
              </li>
            </ul>
          </nav>
        </div>
        {/* Footer avec info entreprise et déconnexion */}
        <div className="sidebar-footer">
          <div className="company-info">
            <div className="company-logo-container">
              {userDisplayImage && !imageError ? (
                <img
                  src={userDisplayImage}
                  alt={`Logo ${companyName}`}
                  className="company-logo"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                // Fallback avec icône
                <div className="company-logo-fallback">
                  <Building2 size={24} color="#666" />
                </div>
              )}
            </div>
            <div className="company-details">
              <span className="company-name" title={companyName}>
                {companyName}
              </span>
              <span className="company-role">
                {userRole}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
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
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;