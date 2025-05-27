// ================================================================
// TECHNICAL TEST RESULTS - VERSION AMÉLIORÉE ET MODERNE
// ================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code, 
  CheckCircle, 
  Clock, 
  Trophy,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { testService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/TestResultsPage.css';

interface TestResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt?: string;
  testTitle?: string;
  duration?: number;
  difficulty?: string;
  category?: string;
}

const TestResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState<TestResults | null>(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results);

  useEffect(() => {
    if (!results && id) {
      const fetchResults = async () => {
        try {
          setLoading(true);
          const response = await testService.getTest(id);
          
          setResults({
            score: response.data.score || 0,
            correctAnswers: Math.round((response.data.score / 100) * response.data.questions.length),
            totalQuestions: response.data.questions.length,
            testTitle: response.data.title || 'Test Technique',
            completedAt: new Date().toISOString(),
            duration: response.data.duration || 30,
            difficulty: response.data.difficulty || 'Moyen',
            category: response.data.category || 'Développement'
          });
        } catch (err) {
          toast.error('Erreur lors du chargement des résultats');
          navigate('/Condidates');
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [id, results, navigate]);

  if (loading) {
    return (
      <div className="test-results-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des résultats...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="test-results-error">
        <Code size={48} />
        <h2>Résultats introuvables</h2>
        <p>Impossible de charger les résultats du test</p>
        <button onClick={() => navigate('/Condidates')} className="error-button">
          <ArrowLeft size={16} />
          Retour au dashboard
        </button>
      </div>
    );
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: '#10b981', icon: Trophy };
    if (score >= 75) return { level: 'Très bien', color: '#059669', icon: TrendingUp };
    if (score >= 60) return { level: 'Bien', color: '#f59e0b', icon: Target };
    if (score >= 40) return { level: 'Moyen', color: '#f97316', icon: Clock };
    return { level: 'À améliorer', color: '#ef4444', icon: Target };
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Félicitations ! Vous avez excellé dans ce test technique.";
    if (score >= 75) return "Très bon travail ! Vos compétences techniques sont solides.";
    if (score >= 60) return "Bien joué ! Vous maîtrisez les concepts essentiels.";
    if (score >= 40) return "Performance correcte avec des axes d'amélioration identifiés.";
    return "Il serait bénéfique de renforcer vos connaissances dans ce domaine.";
  };

  const performance = getPerformanceLevel(results.score);
  const PerformanceIcon = performance.icon;

  return (
    <div className="test-results-container">
      {/* Header */}
      <div className="results-header">
        <button
          className="back-button"
          onClick={() => navigate('/Condidates')}
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        
        <div className="header-content">
          <div className="header-info">
            <Code size={28} style={{ color: '#6366f1' }} />
            <div>
              <h1>Résultats du Test Technique</h1>
              <p>{results.testTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score principal */}
      <div className="main-result-section">
        <div className="score-display">
          <div className="score-circle">
            <div 
              className="score-ring"
              style={{
                background: `conic-gradient(${performance.color} ${results.score * 3.6}deg, #e5e7eb 0deg)`
              }}
            >
              <div className="score-inner">
                <div className="score-number">{Math.round(results.score)}%</div>
                <div className="score-level" style={{ color: performance.color }}>
                  {performance.level}
                </div>
              </div>
            </div>
          </div>
          
          <div className="performance-indicator">
            <PerformanceIcon size={32} style={{ color: performance.color }} />
          </div>
        </div>
        
        <div className="result-summary">
          <h2>Évaluation Technique</h2>
          <p className="performance-message">{getPerformanceMessage(results.score)}</p>
          
          <div className="result-stats">
            <div className="stat-card">
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <div className="stat-info">
                <span className="stat-value">{results.correctAnswers}</span>
                <span className="stat-label">Réponses correctes</span>
              </div>
            </div>
            
            <div className="stat-card">
              <Target size={20} style={{ color: '#6366f1' }} />
              <div className="stat-info">
                <span className="stat-value">{results.totalQuestions}</span>
                <span className="stat-label">Questions totales</span>
              </div>
            </div>
            
            <div className="stat-card">
              <Clock size={20} style={{ color: '#f59e0b' }} />
              <div className="stat-info">
                <span className="stat-value">{results.duration}min</span>
                <span className="stat-label">Durée estimée</span>
              </div>
            </div>
            
            <div className="stat-card">
              <Calendar size={20} style={{ color: '#8b5cf6' }} />
              <div className="stat-info">
                <span className="stat-value">
                  {results.completedAt ? new Date(results.completedAt).toLocaleDateString() : 'Aujourd\'hui'}
                </span>
                <span className="stat-label">Date du test</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Détails du test */}
      <div className="test-details-section">
        <h3>Détails du Test</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Catégorie :</span>
            <span className="detail-value">{results.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Difficulté :</span>
            <span className="detail-value">{results.difficulty}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Taux de réussite :</span>
            <span className="detail-value">
              {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Questions manquées :</span>
            <span className="detail-value">
              {results.totalQuestions - results.correctAnswers}
            </span>
          </div>
        </div>
      </div>

      {/* Message de suivi */}
      <div className="follow-up-section">
        <div className="follow-up-content">
          <h3>Et maintenant ?</h3>
          <div className="follow-up-steps">
            <div className="step-item">
              <div className="step-icon">1</div>
              <p>Vos résultats ont été automatiquement sauvegardés et transmis au recruteur.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">2</div>
              <p>L'équipe RH analysera votre performance technique dans le contexte global de votre candidature.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">3</div>
              <p>Vous recevrez des nouvelles concernant la suite du processus dans les prochains jours.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button
          className="primary-action-btn"
          onClick={() => navigate('/Condidates')}
        >
          Retour au Tableau de Bord
        </button>
        
        <button
          className="secondary-action-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Résultats Test Technique',
                text: `J'ai obtenu ${Math.round(results.score)}% au test technique !`,
              });
            } else {
              toast.info('Score copié : ' + Math.round(results.score) + '%');
            }
          }}
        >
          Partager le Résultat
        </button>
      </div>
    </div>
  );
};

export default TestResultsPage;