// ================================================================
// APPLICATION DETAIL PAGE - VERSION AMÉLIORÉE ET MODERNE
// ================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Building, 
  FileText, 
  Brain, 
  Code, 
  Target,
  CheckCircle, 
  XCircle,
  Download,
  TrendingUp,
  Award
} from 'lucide-react';
import { applicationService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/ApplicationDetailsPage.css';

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
    // Scores ajoutés
    cvAnalysis?: {
      score: number;
      completedAt: string;
      feedback?: string;
      strengths?: string[];
      improvements?: string[];
    };
    psychologicalTestResults?: {
      score: number;
      completedAt: string;
      overallAssessment?: string;
      traits?: {
        leadership: number;
        teamwork: number;
        adaptability: number;
      };
    };
    testResults?: {
      score: number;
      completedAt: string;
      category?: string;
      difficulty?: string;
    };
    resume: string;
  }

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
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
      
      setApplication(prev => prev ? { ...prev, status: newStatus } : prev);
      
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Très bon';
    if (score >= 70) return 'Bon';
    if (score >= 60) return 'Moyen';
    return 'À améliorer';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const ScoreCard: React.FC<{
    title: string;
    score: number;
    icon: React.ReactNode;
    completedAt: string;
    details?: React.ReactNode;
  }> = ({ title, score, icon, completedAt, details }) => (
    <div className="score-card">
      <div className="score-header">
        <div className="score-icon">{icon}</div>
        <div className="score-info">
          <h3>{title}</h3>
          <p>Complété le {new Date(completedAt).toLocaleDateString()}</p>
        </div>
        <div className="score-display">
          <div 
            className="score-circle"
            style={{ 
              background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, #e5e7eb 0deg)` 
            }}
          >
            <span className="score-number">{score}%</span>
          </div>
          <span 
            className="score-level"
            style={{ color: getScoreColor(score) }}
          >
            {getScoreLevel(score)}
          </span>
        </div>
      </div>
      {details && <div className="score-details">{details}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="application-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des détails...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="application-error">
        <h2>Candidature introuvable</h2>
        <button onClick={() => navigate('/recruiters')}>Retour</button>
      </div>
    );
  }

  return (
    <div className="application-detail-container">
      {/* Header */}
      <div className="application-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Retour
        </button>
        
        <div className="candidate-summary">
          <div className="candidate-info">
            <div className="candidate-avatar">
              <User size={32} />
            </div>
            <div className="candidate-details">
              <h1>{application.candidate.name}</h1>
              <div className="candidate-meta">
                <span className="meta-item">
                  <Mail size={16} />
                  {application.candidate.email}
                </span>
                <span className="meta-item">
                  <Calendar size={16} />
                  {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="status-section">
            <span 
              className="status-badge"
              style={{ 
                backgroundColor: getStatusColor(application.status),
                color: 'white'
              }}
            >
              {application.status}
            </span>
          </div>
        </div>
      </div>

      {/* Informations sur le poste */}
      <div className="job-info-card">
        <div className="card-header">
          <Building size={20} />
          <h2>Poste visé</h2>
        </div>
        <div className="job-details">
          <h3>{application.job.title}</h3>
          <p className="company-name">{application.job.company}</p>
          <p className="job-description">{application.job.description}</p>
        </div>
      </div>

      {/* Scores d'évaluation */}
      <div className="scores-section">
        <h2>Évaluations du candidat</h2>
        <div className="scores-grid">
          
          {/* Score d'analyse CV */}
          {application.cvAnalysis && (
            <ScoreCard
              title="Analyse CV"
              score={application.cvAnalysis.score}
              icon={<FileText size={24} style={{ color: '#8b5cf6' }} />}
              completedAt={application.cvAnalysis.completedAt}
              details={
                <div className="cv-details">
                  {application.cvAnalysis.feedback && (
                    <p>{application.cvAnalysis.feedback}</p>
                  )}
                  {application.cvAnalysis.strengths && (
                    <div className="strengths">
                      <strong>Points forts:</strong>
                      <ul>
                        {application.cvAnalysis.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              }
            />
          )}

          {/* Score du test psychologique */}
          {application.psychologicalTestResults && (
            <ScoreCard
              title="Test Psychologique"
              score={application.psychologicalTestResults.score}
              icon={<Brain size={24} style={{ color: '#06b6d4' }} />}
              completedAt={application.psychologicalTestResults.completedAt}
              details={
                <div className="psych-details">
                  {application.psychologicalTestResults.overallAssessment && (
                    <p>{application.psychologicalTestResults.overallAssessment}</p>
                  )}
                  {application.psychologicalTestResults.traits && (
                    <div className="traits-summary">
                      <div className="trait-item">
                        <span>Leadership:</span>
                        <span style={{ color: getScoreColor(application.psychologicalTestResults.traits.leadership) }}>
                          {application.psychologicalTestResults.traits.leadership}%
                        </span>
                      </div>
                      <div className="trait-item">
                        <span>Travail d'équipe:</span>
                        <span style={{ color: getScoreColor(application.psychologicalTestResults.traits.teamwork) }}>
                          {application.psychologicalTestResults.traits.teamwork}%
                        </span>
                      </div>
                      <div className="trait-item">
                        <span>Adaptabilité:</span>
                        <span style={{ color: getScoreColor(application.psychologicalTestResults.traits.adaptability) }}>
                          {application.psychologicalTestResults.traits.adaptability}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          )}

          {/* Score du test technique */}
          {application.testResults && (
            <ScoreCard
              title="Test Technique"
              score={application.testResults.score}
              icon={<Code size={24} style={{ color: '#10b981' }} />}
              completedAt={application.testResults.completedAt}
              details={
                <div className="tech-details">
                  {application.testResults.category && (
                    <p><strong>Catégorie:</strong> {application.testResults.category}</p>
                  )}
                  {application.testResults.difficulty && (
                    <p><strong>Difficulté:</strong> {application.testResults.difficulty}</p>
                  )}
                </div>
              }
            />
          )}

          {/* Score d'analyse IA */}
          <ScoreCard
            title="Analyse IA"
            score={application.aiAnalysis.score}
            icon={<Target size={24} style={{ color: '#f59e0b' }} />}
            completedAt={application.createdAt}
            details={
              <div className="ai-details">
                <p>{application.aiAnalysis.feedback}</p>
                {application.aiAnalysis.missingSkills.length > 0 && (
                  <div className="missing-skills">
                    <strong>Compétences à développer:</strong>
                    <ul>
                      {application.aiAnalysis.missingSkills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </div>

      {/* CV du candidat */}
      <div className="resume-card">
        <div className="card-header">
          <FileText size={20} />
          <h2>CV du candidat</h2>
        </div>
        <div className="resume-actions">
          <a 
            href={`http://localhost:5000/${application.resume}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="download-btn"
          >
            <Download size={16} />
            Télécharger le CV
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="actions-card">
        <div className="card-header">
          <Award size={20} />
          <h2>Actions de recrutement</h2>
        </div>
        <div className="action-buttons">
          <button
            onClick={() => handleStatusChange('approved')}
            className="approve-btn"
            disabled={updating || application.status === 'approved'}
          >
            <CheckCircle size={16} />
            {application.status === 'approved' ? 'Approuvé' : 'Approuver'}
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            className="reject-btn"
            disabled={updating || application.status === 'rejected'}
          >
            <XCircle size={16} />
            {application.status === 'rejected' ? 'Rejeté' : 'Rejeter'}
          </button>
        </div>
        {updating && <p className="updating-message">Mise à jour en cours...</p>}
      </div>
    </div>
  );
};

export default ApplicationDetailPage;