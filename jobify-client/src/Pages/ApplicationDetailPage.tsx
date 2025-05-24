// src/components/ApplicationDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/JobDetailPage.css';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  interface Application {
    candidate: {
      name: string;
      email: string;
    };
    status: string;
    createdAt: string;
    job: {
      title: string;
      company: string;
      description: string;
    };
    aiAnalysis: {
      score: number;
      feedback: string;
      missingSkills: string[];
    };
    testResults?: {
      score: number;
      completedAt: string;
    };
    resume: string;
  }

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      // Removed invalid line referencing 'newStatus'
      try {
        setLoading(true);
        const response = await applicationService.getApplication(id);
        setApplication(response.data.application);
      } catch (err) {
        toast.error('Erreur lors du chargement des détails de la candidature');
        navigate('/recruiters');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      setUpdating(true);
      await applicationService.updateApplicationStatus(id, newStatus);
      
      // Mettre à jour l'état local
      setApplication(prev => prev ? { ...prev, status: newStatus } : prev);
      
      toast.success(`Statut de la candidature mis à jour: ${newStatus}`);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement des détails de la candidature...</div>;
  }

  if (!application) {
    return <div className="error-message">Candidature introuvable</div>;
  }

  return (
    <div className="application-detail-container">
      <div className="application-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Retour
        </button>
        <h1>Candidature de {application.candidate.name}</h1>
        <div className="application-meta">
          <p>Email: {application.candidate.email}</p>
          <p>Statut: <span className={`status-badge ${application.status}`}>{application.status}</span></p>
          <p>Date de candidature: {new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="application-detail-content">
        <div className="job-info">
          <h2>Détails de l'offre</h2>
          <h3>{application.job.title}</h3>
          <p><strong>Entreprise:</strong> {application.job.company}</p>
          <p><strong>Description:</strong> {application.job.description}</p>
        </div>

        <div className="ai-analysis">
          <h2>Analyse IA</h2>
          <div className="ai-score">
            <span className="score-label">Score de correspondance:</span>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${application.aiAnalysis.score}%` }}
              >
                {application.aiAnalysis.score}%
              </div>
            </div>
          </div>
          <div className="ai-feedback">
            <h3>Feedback IA:</h3>
            <p>{application.aiAnalysis.feedback}</p>
          </div>
          {application.aiAnalysis.missingSkills.length > 0 && (
            <div className="missing-skills">
              <h3>Compétences manquantes:</h3>
              <ul>
                {application.aiAnalysis.missingSkills.map((skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {application.testResults && (
          <div className="test-results">
            <h2>Résultats du test technique</h2>
            <p><strong>Score:</strong> {application.testResults.score}%</p>
            <p><strong>Complété le:</strong> {new Date(application.testResults.completedAt).toLocaleString()}</p>
          </div>
        )}

        <div className="resume-section">
          <h2>CV du candidat</h2>
          <a 
            href={`http://localhost:5000/${application.resume}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="download-resume"
          >
            Télécharger le CV
          </a>
        </div>

        <div className="action-buttons">
          <h2>Actions</h2>
          <div className="buttons-row">
            <button 
              onClick={() => handleStatusChange('approved')} 
              className="approve-btn"
              disabled={updating || application.status === 'approved'}
            >
              Approuver
            </button>
            <button 
              onClick={() => handleStatusChange('rejected')} 
              className="reject-btn"
              disabled={updating || application.status === 'rejected'}
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;