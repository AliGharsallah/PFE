// AdminDashboard.tsx
import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Divider, 
  Snackbar, 
  Alert, 
  IconButton,
  InputBase
} from '@mui/material';

// Importer les icônes
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';

// Importation des composants
import DashboardOverview from '../components/Admin/DashboardOverview';
import UserManagement from '../components/Admin/UserManagement';
import SystemConfiguration from '../components/Admin/SystemConfiguration';
import AISettings from '../components/Admin/AISettings';
import Statistics from '../components/Admin/Statistics';
import ContentManagement from '../components/Admin/ContentManagement';
import Reports from '../components/Admin/Reports';
import SystemMonitoring from '../components/Admin/SystemMonitoring';
import '../Styles/AdminDashboard.css';

// Logo (à remplacer par votre import de logo)
import logo from '../assets/jobify-logo.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/api';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

// Composant principal du tableau de bord admin
const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  // Informations de l'utilisateur (à remplacer par vos données dynamiques)
  const adminName = "Admin User";
  const adminRole = "Super Admin";

  const handleTabChange = (index) => {
    setCurrentTab(index);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

 const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Sections du tableau de bord
  const tabs = [
    { label: "Aperçu", icon: <DashboardIcon /> },
    { label: "Utilisateurs", icon: <PeopleIcon /> },
    { label: "Configuration", icon: <SettingsIcon /> },
    { label: "Paramètres IA", icon: <SettingsIcon /> },
    { label: "Statistiques", icon: <BarChartIcon /> },
    { label: "Contenu", icon: <DescriptionIcon /> },
    { label: "Rapports", icon: <AssessmentIcon /> },
    { label: "Monitoring", icon: <MonitorHeartOutlinedIcon /> }
  ];

  const renderContent = () => {
    switch(currentTab) {
      case 0: return (
        <>
          <h1>Tableau de Bord</h1>
          <DashboardOverview showNotification={showNotification} />
        </>
      );
      case 1: return (
        <>
          <h1>Gestion des Utilisateurs</h1>
          <UserManagement showNotification={showNotification} />
        </>
      );
      case 2: return (
        <>
          <h1>Configuration Système</h1>
          <SystemConfiguration showNotification={showNotification} />
        </>
      );
      case 3: return (
        <>
          <h1>Paramètres IA</h1>
          <AISettings showNotification={showNotification} />
        </>
      );
      case 4: return (
        <>
          <h1>Statistiques</h1>
          <Statistics showNotification={showNotification} />
        </>
      );
      case 5: return (
        <>
          <h1>Gestion de Contenu</h1>
          <ContentManagement showNotification={showNotification} />
        </>
      );
      case 6: return (
        <>
          <h1>Rapports</h1>
          <Reports showNotification={showNotification} />
        </>
      );
      case 7: return (
        <>
          <h1>Monitoring Système</h1>
          <SystemMonitoring showNotification={showNotification} />
        </>
      );
      default: return (
        <>
          <h1>Tableau de Bord</h1>
          <DashboardOverview showNotification={showNotification} />
        </>
      );
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Bouton pour ouvrir le menu mobile */}
      <div className="admin-mobile-menu-toggle" onClick={toggleMobileMenu}>
        <MenuIcon />
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Bouton de fermeture pour mobile */}
        {isMobileMenuOpen && (
          <button
            className="admin-close-mobile-menu"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <CloseIcon style={{ color: '#fff' }} />
          </button>
        )}
        <div>
          {/* Logo */}
          <img
            className="admin-sidebar-logo"
            src={logo}
            alt="Admin Logo"
            onClick={() => handleTabChange(0)}
          />
          {/* Navigation principale */}
          <nav className="admin-sidebar-nav">
            <p className="admin-sidebar-section-title">Général</p>
            <ul>
              <li
                className={currentTab === 0 ? 'active' : ''}
                onClick={() => handleTabChange(0)}
              >
                {tabs[0].icon}
                <span>{tabs[0].label}</span>
              </li>
              <li
                className={currentTab === 1 ? 'active' : ''}
                onClick={() => handleTabChange(1)}
              >
                {tabs[1].icon}
                <span>{tabs[1].label}</span>
              </li>
              <li
                className={currentTab === 2 ? 'active' : ''}
                onClick={() => handleTabChange(2)}
              >
                {tabs[2].icon}
                <span>{tabs[2].label}</span>
              </li>
              <li
                className={currentTab === 3 ? 'active' : ''}
                onClick={() => handleTabChange(3)}
              >
                {tabs[3].icon}
                <span>{tabs[3].label}</span>
              </li>
            </ul>
            <p className="admin-sidebar-section-title">Analyse</p>
            <ul>
              <li
                className={currentTab === 4 ? 'active' : ''}
                onClick={() => handleTabChange(4)}
              >
                {tabs[4].icon}
                <span>{tabs[4].label}</span>
              </li>
              <li
                className={currentTab === 5 ? 'active' : ''}
                onClick={() => handleTabChange(5)}
              >
                {tabs[5].icon}
                <span>{tabs[5].label}</span>
              </li>
              <li
                className={currentTab === 6 ? 'active' : ''}
                onClick={() => handleTabChange(6)}
              >
                {tabs[6].icon}
                <span>{tabs[6].label}</span>
              </li>
              <li
                className={currentTab === 7 ? 'active' : ''}
                onClick={() => handleTabChange(7)}
              >
                {tabs[7].icon}
                <span>{tabs[7].label}</span>
              </li>
            </ul>
          </nav>
        </div>
        {/* Footer avec info entreprise et déconnexion */}
        <div className="admin-sidebar-footer">
          <div className="admin-company-info">
            <img
              src="/path/to/admin_avatar.jpg"
              alt="Admin Avatar"
              className="admin-company-logo"
            />
            <div>
              <span className="admin-company-name">{adminName}</span>
              <span className="admin-company-role">{adminRole}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogoutIcon style={{ fontSize: 18 }} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="admin-dashboard-container">
        <div className="admin-topbar">
          <div className="admin-search-wrapper">
            <SearchIcon className="admin-search-icon" />
            <InputBase
              placeholder="Rechercher..."
              className="admin-search-input"
            />
          </div>
          <div className="admin-notification-icon">
            <NotificationsIcon />
          </div>
        </div>
        <div className="admin-main-content">
          {renderContent()}
        </div>

        {/* Notification */}
        <Snackbar open={notification.open} autoHideDuration={6000} onClose={closeNotification}>
          <Alert onClose={closeNotification} severity={notification.severity} className="admin-notification">
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default AdminDashboard;