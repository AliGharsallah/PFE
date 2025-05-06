import React, { useState } from 'react';
import '../Styles/dashbord-condidats.css';
import jobify_logo from '../assets/jobify-logo.svg';
import ProfileSettings from './ProfileSettings';
import Offers from '../components/Offers';
import Profile from '../components/Profile';
import MainContent from '../components/MainContent';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CandidateDashboard = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'offers' | 'profile' | 'settings'>('home');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MainContent/>
      case 'offers':
        return <Offers />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper-condidate">
      {/* Sidebar */}
      <div className="candidate-sidebar">
        <img src={jobify_logo} className="Jobify-logo-condidate" alt="Jobify Logo" />
        <ul className="sidebar-menu">
          <li onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>🏠 Accueil</li>
          <li onClick={() => setActiveTab('offers')} className={activeTab === 'offers' ? 'active' : ''}>📄 Offres</li>
          <li onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>👤 Profil</li>
          <li onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>⚙️ Paramètres</li>
          <li className="logout" onClick={handleLogout}>🚪 Déconnexion</li>
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