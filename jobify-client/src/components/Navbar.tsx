import { Link, useNavigate } from 'react-router-dom';
import jobifylogo from '../assets/jobify-logo.svg';
import '../Styles/Navbar.css';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleRecruitersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user.isAuthenticated) {
      navigate('/auth');
    } else if (user.role === 'recruiter') {
      navigate('/recruiters');
    } else {
      navigate('/auth');
    }
  };

  const handleCandidatesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user.isAuthenticated) {
      navigate('/auth');
    } else if (user.role === 'candidate') {
      navigate('/Condidates');
    } else {
      navigate('/auth');
    }
  };

  const handleDashboardClick = () => {
    if (user.role === 'recruiter') {
      navigate('/recruiters');
    } else if (user.role === 'candidate') {
      navigate('/Condidates');
    }
  };

  return (
    <header className="jobify-header">
      <div className="jobify-logo">
        <img src={jobifylogo} alt="Logo" className="logo" />
      </div>
      <nav className="jobify-nav">
        <Link to="/">Accueil</Link>
        
        {user.isAuthenticated ? (
          <>
            <a href="#" onClick={handleDashboardClick}>Dashboard</a>
            <a href="#" onClick={handleLogoutClick}>Déconnexion</a>
          </>
        ) : (
          <>
            <a href="/Condidates" onClick={handleCandidatesClick}>Candidats</a>
            <a href="/recruiters" onClick={handleRecruitersClick}>Recruiters</a>
            <a href="#">À propos</a>
            <Button type="primary" onClick={handleLoginClick}>
              Connexion / S'inscrire
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;