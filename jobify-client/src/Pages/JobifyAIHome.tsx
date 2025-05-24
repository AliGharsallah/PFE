import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

import "../styles/JobifyAIHome.css";
import '../Styles/Card.css';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Home/Navbar';
import HeroSection from "../components/Home/HeroSection";

import AIANALYSE from '../assets/analysecompetence.svg';
import ENTRETIENAI from '../assets/EntretienIA.svg';
import MatchingIntelligent from '../assets/MatchingIntelligent.svg';
import SUIVICONDIDAT from '../assets/SuiviCandidature.svg';
import PROFILEAI from '../assets/createProfile.svg';
import TestCompetence from '../assets/TESTCOMPETENCE.svg';





// Composant FeatureCard pour les fonctionnalités
const FeatureCard = ({ title, description, image }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={image} alt={title} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

const JobifyAIHome: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselTrackRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const offers = [
    {
      id: 1,
      title: "Profil IA",
      description: "Créez votre profil professionnel alimenté par l'IA pour mettre en valeur vos compétences et expériences.",
      image: PROFILEAI
    },
    {
      id: 2,
      title: "Tests de compétences",
      description: "Passez des tests adaptés à votre domaine pour démontrer vos compétences aux recruteurs.",
      image: TestCompetence
    },
    {
      id: 3,
      title: "Analyse IA",
      description: "Obtenez des insights précis sur votre progression et vos points forts à améliorer.",
      image: AIANALYSE
    },
    {
      id: 4,
      title: "Entretien IA",
      description: "Préparez-vous aux entretiens avec notre simulateur d'entretien basé sur l'intelligence artificielle.",
      image: ENTRETIENAI
    },
    {
      id: 5,
      title: "Matching Intelligent",
      description: "Notre algorithme trouve les emplois qui correspondent à votre profil avec une précision remarquable.",
      image: MatchingIntelligent
    },
    {
      id: 6,
      title: "Suivi de Candidature",
      description: "Suivez l'avancement de vos candidatures en temps réel et recevez des notifications.",
      image: SUIVICONDIDAT
    }
  ];

  // Nombre de cartes visibles selon la largeur de l'écran
  const getVisibleCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3; // Valeur par défaut
  };

  const maxIndex = Math.max(0, offers.length - getVisibleCards());

  // Fonctions pour la navigation du carousel
  const goToNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Gestion du défilement automatique
  useEffect(() => {
    // Démarrer le défilement automatique
    autoScrollIntervalRef.current = setInterval(goToNext, 5000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [maxIndex]);

  // Pause du défilement au survol
  const handleMouseEnter = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    autoScrollIntervalRef.current = setInterval(goToNext, 5000);
  };

  // Ajuster le maxIndex lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      // S'assurer que currentIndex ne dépasse pas le nouveau maxIndex
      if (currentIndex > Math.max(0, offers.length - getVisibleCards())) {
        setCurrentIndex(Math.max(0, offers.length - getVisibleCards()));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentIndex, offers.length]);

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
      <HeroSection />
      {/* Features */}
      <section className="jobify-features-section">
        <div className="features-container">
          <h2 className="features-heading">Nos Fonctionnalités</h2>
          
          <div 
            className="features-carousel"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className="carousel-track" 
              ref={carouselTrackRef}
              style={{ 
                transform: `translateX(-${currentIndex * 410}px)`,
                transition: 'transform 0.5s ease'
              }}
            >
              {offers.map((offer) => (
                <FeatureCard
                  key={offer.id}
                  title={offer.title}
                  description={offer.description}
                  image={offer.image}
                />
              ))}
            </div>
          </div>
          
          <div className="carousel-controls">
            <button className="control-btn prev-btn" onClick={goToPrev}>
              <span>&#8592;</span>
            </button>
            <div className="carousel-indicators">
              {offers.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator ${index === currentIndex ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                ></span>
              ))}
            </div>
            <button className="control-btn next-btn" onClick={goToNext}>
              <span>&#8594;</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="jobify-benefits-section">
        <div className="benefits-container">
          <h2 className="benefits-heading">Pourquoi choisir Jobify?</h2>
          
          <div className="benefits-grid">
            <div className="benefit-card candidates">
              <div className="card-header">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path fill="#4f46e5" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                  </svg>
                </div>
                <h3>Pour les candidats</h3>
              </div>
              <ul className="benefit-list">
                <li><span className="benefit-check">✓</span> Créez un profil professionnel</li>
                <li><span className="benefit-check">✓</span> Passez des tests adaptés à vos compétences</li>
                <li><span className="benefit-check">✓</span> Suivez vos performances et progressez</li>
                <li><span className="benefit-check">✓</span> Soyez recruté plus rapidement</li>
              </ul>
              <button className="benefit-action" onClick={handleRegisterCandidate}>Créer mon profil</button>
            </div>
            
            <div className="benefit-card recruiters">
              <div className="card-header">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path fill="#6366f1" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"></path>
                  </svg>
                </div>
                <h3>Pour les recruteurs</h3>
              </div>
              <ul className="benefit-list">
                <li><span className="benefit-check">✓</span> Déposez vos offres d'emploi</li>
                <li><span className="benefit-check">✓</span> Recevez des suggestions de candidats instantanées</li>
                <li><span className="benefit-check">✓</span> Gagnez du temps avec l'entretien IA avancé</li>
              </ul>
              <button className="benefit-action" onClick={handleRegisterRecruiter}>Publier une offre</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="jobify-cta">
        <h2>Rejoignez la révolution du recrutement</h2>
        <div className="cta-buttons">
          <button className="primary" onClick={handleRegisterCandidate}>S'inscrire comme candidat</button>
          <button className="outline" onClick={handleRegisterRecruiter}>Publier une offre</button>
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