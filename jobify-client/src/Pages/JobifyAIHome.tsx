import React, { useEffect, useState } from "react";
import "../styles/JobifyAIHome.css";
import Card from "../components/Card";
import { useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import Navbar from '../components/Navbar';
import '../Styles/Card.css';
import UIUX from '../assets/uiux.jpg';
import CHEFP from '../assets/projectmanager.jpg';
import FRONTEND from '../assets/frontend.jpg';
import ASSISTANT from '../assets/assistant.jpg';
import { useAuth } from '../context/AuthContext';

const JobifyAIHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const offers = [
    { id: 1, title: 'Développeur Frontend', description: 'Travail à distance, 40 heures/semaine', image: FRONTEND },
    { id: 2, title: 'Designer UI/UX', description: 'Création de designs modernes', image:UIUX },
    { id: 3, title: 'Assistant virtuel', description: 'Gestion administrative à distance', image: ASSISTANT },
    { id: 4, title: 'Chef de projet', description: 'Coordination d équipes à distance', image: CHEFP },
    { id: 5, title: 'Développeur Frontend', description: 'Travail à distance, 40 heures/semaine', image: FRONTEND },
    { id: 6, title: 'Designer UI/UX', description: 'Création de designs modernes', image: UIUX },
    { id: 7, title: 'Assistant virtuel', description: 'Gestion administrative à distance', image: ASSISTANT },
    { id: 8, title: 'Chef de projet', description: 'Coordination d équipes à distance', image: CHEFP },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Change l'index de la carte affichée toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 3000); // Change toutes les 3 secondes

    return () => clearInterval(interval); // Nettoyage de l'intervalle à la destruction du composant
  }, [offers.length]);

  const handleRegisterCandidate = () => {
    if (user.isAuthenticated) {
      if (user.role === 'candidate') {
        navigate('/Condidates');
      } else {
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  };

  const handleRegisterRecruiter = () => {
    if (user.isAuthenticated) {
      if (user.role === 'recruiter') {
        navigate('/recruiters');
      } else {
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="jobify-container">
      {/* Hero Section */}
      <Navbar />
      <section className="jobify-hero">
        <h1>Recrutez plus intelligemment avec l'IA</h1>
        <p>Découvrez des talents en quelques clics</p>
        <div className="hero-buttons">
          <Button type="primary" >Commencer maintenant </Button>
          <Button type="outline" >Téléverser votre CV </Button>
        </div>
      </section>

      {/* Features */}
      <section className="jobify-features">
      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {offers.map((offer) => (
            <div className="feature-card-container" key={offer.id}>
              <Card 
                title={offer.title}
                description={offer.description}
                image={offer.image}
              />
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* Benefits */}
      <section className="jobify-benefits">
        <div>
          <h2>Pour les candidats</h2>
          <ul>
            <li>Créez un profil</li>
            <li>Faites des tests adaptés</li>
            <li>Suivez vos performances</li>
            <li>Recruté plus vite</li>
          </ul>
        </div>
        <div>
          <h2>Pour les recruteurs</h2>
          <ul>
            <li>Déposez vos offres</li>
            <li>Recevez des suggestions instantanées</li>
            <li>Gagnez du temps avec l'entretien IA</li>
          </ul>
        </div>
      </section>

      {/* Call To Action */}
      <section className="jobify-cta">
        <h2>Rejoignez la révolution du recrutement</h2>
        <div className="cta-buttons">
          <button className="primary">S'inscrire comme candidat</button>
          <button className="outline">Publier une offre</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="jobify-footer">
        <div className="footer-links">
          <a href="#">À-propos</a>
          <a href="#">Politique de confidentialité</a>
          <a href="#">Conditions</a>
        </div>
        <div className="footer-lang">
          <span>🌍</span>
          <a href="#">Français</a> |
          <a href="#">English</a>
        </div>
      </footer>
    </div>
  );
};

export default JobifyAIHome;