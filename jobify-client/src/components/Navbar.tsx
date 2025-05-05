import { Link, useNavigate } from 'react-router-dom';
import jobifylogo from '../assets/jobify-logo.svg';
import '../Styles/Navbar.css';
import Button from './Button';

function Navbar() {
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('token'); // ou selon ton système d’auth

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleRecruitersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/recruiters');
    }
  };

  const handleCandidatesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/Condidates');
    }
  };

  return (
    <header className="jobify-header">
      <div className="jobify-logo">
        <img src={jobifylogo} alt="Logo" className="logo" />
      </div>
      <nav className="jobify-nav">
        <a href="#">Accueil</a>
        <a href="/Condidates" onClick={handleCandidatesClick}>Candidats</a>
        <a href="/recruiters" onClick={handleRecruitersClick}>Recruiters</a>
        <a href="#">À propos</a>

        <Button type="primary" onClick={handleLoginClick}>
          Connexion / S'inscrire
        </Button>
      </nav>
    </header>
  );
}

export default Navbar;
