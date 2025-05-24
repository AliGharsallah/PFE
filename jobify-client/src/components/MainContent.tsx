import React from 'react';
import { FaThumbsUp, FaRegHeart, FaPaperPlane } from 'react-icons/fa';
import '../Styles/MainContent.css';

const MainContent = () => {
  return (
    <div className="dashboard-content">
      <div className="left-section">
        <div className="upload-cv">
          <div className="upload-title">Téléverser votre CV</div>
          <form className="upload-form">
            <input type="file" accept=".pdf,.doc,.docx" />
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </div>

      <div className="right-section">
        <div className="job-list">
          {/* Offre 1 */}
          <div className="job-card">
            <div className="job-title">Développeur Front-End</div>
            <div className="job-company">Société ABC Technologies</div>
            <div className="job-description">
              Rejoignez une équipe dynamique pour construire des interfaces modernes et des applications web réactives.
            </div>
            <div className="job-salary">Salaire: 2500€/mois</div>
            <div className="job-time">Temps de travail: 9h-17h</div>
            <div className="job-status active">En cours</div>
            <div className="job-actions">
              <FaThumbsUp className="job-action-icon" />
              <button className="apply-button">
                <FaPaperPlane className="apply-icon" /> Postuler
              </button>
            </div>
          </div>

          {/* Offre 2 */}
          <div className="job-card">
            <div className="job-title">Designer UX/UI</div>
            <div className="job-company">Société XYZ Creations</div>
            <div className="job-description">
              Créez des expériences utilisateur exceptionnelles pour nos clients avec un design intuitif et esthétique.
            </div>
            <div className="job-salary">Salaire: 3000€/mois</div>
            <div className="job-time">Temps de travail: 10h-18h</div>
            <div className="job-status expired">Expiré</div>
            <div className="job-actions">
              <FaThumbsUp className="job-action-icon" />
              <button className="apply-button">
                <FaPaperPlane className="apply-icon" /> Postuler
              </button>
            </div>
          </div>

          {/* Autres offres peuvent être ajoutées ici */}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
