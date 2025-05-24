import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jobifylogo from '../../assets/jobify-logo.svg';
import '../../Styles/Navbar.css';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleAdminsClick = () => {
    if (!user.isAuthenticated) {
      navigate('/auth');
    } else if (user.role === 'Admin') {
      navigate('/admin/dashboard'); 
  };};
  const handleRecruitersClick = (e) => {
    e.preventDefault();
    if (!user.isAuthenticated) {
      navigate('/auth');
    } else if (user.role === 'recruiter') {
      navigate('/recruiters');
    } else {
      navigate('/auth');
    }
  };

  const handleCandidatesClick = (e) => {
    e.preventDefault();
    if (!user.isAuthenticated) {
      navigate('/auth');
    } else if (user.role === 'candidate') {
      navigate('/Condidates');
    }

    else {
      navigate('/auth');
    }
  };

  const handleDashboardClick = () => {
    if (user.role === 'recruiter') {
      navigate('/recruiters');
    } else if (user.role === 'candidate') {
      navigate('/Condidates');
    }  else  if (user.role === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/auth');
    } 
    toast.error('Vous devez être connecté pour accéder au tableau de bord.');
    setMobileMenuOpen(false); // Ferme le menu mobile après la redirection
  };

 
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`jobify-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="jobify-logo">
        <Link to="/">
          <img src={jobifylogo} alt="Jobify Logo" className="logo" />
        </Link>
      </div>

      {/* Icône du menu mobile */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation principale */}
      <nav className={`jobify-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          Accueil
        </Link>

        {user.isAuthenticated ? (
          <>
            <a
              href="#"
              onClick={handleDashboardClick}
              className={isActive('/recruiters') || isActive('/Condidates') || isActive('/admin/dashboard') ? 'active' : ''}
            >
              Dashboard
            </a>
            <a href="#" onClick={handleLogoutClick} className="auth-button">
              <LogOut size={18} />
              Déconnexion
            </a>
          </>
        ) : (
          <>
            <a
              href="/Condidates"
              onClick={handleCandidatesClick}
              className={isActive('/Condidates') ? 'active' : ''}
            >
              Candidats
            </a>
            <a
              href="/recruiters"
              onClick={handleRecruitersClick}
              className={isActive('/recruiters') ? 'active' : ''}
            >
              Recruteurs
            </a>
            <a
              href="/admin/dashboard"
              onClick={handleAdminsClick}
              className={isActive('/admin/dashboard') ? 'active' : ''}
            >
              Admin
            </a>
            <button className="auth-button" onClick={handleLoginClick}>
              <User size={18} />
              Connexion / S'inscrire
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;