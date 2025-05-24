import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroIllustration from '../../assets/hero-illustration.jpg'; // Ajoutez cette illustration
import '../../Styles/HeroSection.css'; 
import { ArrowRight, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartNow = () => {
    if (user.isAuthenticated) {
      if (user.role === 'recruiter') {
        navigate('/recruiters');
      } else if (user.role === 'candidate') {
        navigate('/Condidates');
      }
    } else {
      navigate('/auth');
    }
  };

  const handleUploadCV = () => {
    if (user.isAuthenticated && user.role === 'candidate') {
      navigate('/Condidates/profile');
    } else {
      navigate('/auth');
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.jobify-features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Génération des particules pour l'effet visuel
  const renderParticles = () => {
    const particles = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 4 + 2;
      const initialX = Math.random() * 100;
      const initialY = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;

      particles.push(
        <div
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${initialY}%`,
            left: `${initialX}%`,
            opacity: Math.random() * 0.5 + 0.3,
            animation: `particleFloat ${duration}s infinite linear ${delay}s`
          }}
        />
      );
    }

    return particles;
  };

  return (
    <section className="jobify-hero">
      {/* Formes décoratives */}
      <div className="hero-shapes">
        <div className="hero-shape-1"></div>
        <div className="hero-shape-2"></div>
        <div className="hero-shape-3"></div>
        <div className="particles">
          {renderParticles()}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="hero-content">
        <h1>Recrutez plus intelligemment avec l'IA</h1>
        <p>Trouvez les meilleurs talents adaptés à vos besoins grâce à notre technologie d'intelligence artificielle avancée qui analyse et sélectionne les candidats parfaits pour votre entreprise.</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleStartNow}>
            Commencer maintenant
            <ArrowRight size={18} />
          </button>
          <button className="btn-outline" onClick={handleUploadCV}>
            <Upload size={18} />
            Téléverser votre CV
          </button>
        </div>
      </div>

      {/* Illustration */}
      <div className="hero-illustration">
        <img 
          src={heroIllustration} 
          alt="Recrutement avec l'IA" 
        />
      </div>

      {/* Indicateur de défilement */}
      <div className="scroll-indicator" onClick={scrollToFeatures}>
        <span>Découvrir</span>
        <div className="arrow"></div>
      </div>
    </section>
  );
}

export default HeroSection;