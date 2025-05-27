// ================================================================
// PSYCHOLOGICAL TEST RESULTS - VERSION MINIMALISTE ET MODERNE
// ================================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  User,
  Heart,
  Target,
  TrendingUp,
  Download,
  Share
} from 'lucide-react';
import { toast } from 'react-toastify';
import '../Styles/PsychologicalTestResults.css';

interface TestResultsData {
  testInfo: {
    testId: string;
    jobTitle: string;
    completedAt: string;
    overallScore: number;
    duration: number;
  };
  personalityProfile: {
    traits: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    dominantTrait: [string, number];
    description: string;
  };
  cognitiveProfile: {
    abilities: {
      problem_solving: number;
      analytical_thinking: number;
      creativity: number;
      attention_to_detail: number;
    };
  };
  emotionalIntelligence: {
    scores: {
      self_awareness: number;
      empathy: number;
      social_skills: number;
      emotional_regulation: number;
    };
    averageScore: number;
  };
  behavioralInsights: {
    patterns: {
      leadership_potential: number;
      team_collaboration: number;
      stress_management: number;
      adaptability: number;
    };
    attentionScore: number;
    concentrationLevel: number;
  };
  recommendations: string[];
}

const PsychologicalTestResults: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token d'authentification manquant");

        const response = await fetch(`http://localhost:5000/api/psychological-tests/${testId}/results`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setResults(data.data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des résultats:", err.message);
        setError(err.message || "Erreur lors du chargement des résultats");
        toast.error(err.message || "Impossible de charger les résultats");
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchResults();
    }
  }, [testId]);

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
    return 'À développer';
  };

  const shareResults = () => {
    if (navigator.share && results) {
      navigator.share({
        title: 'Résultats Test Psychologique',
        text: `Score global: ${results.testInfo.overallScore}%`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  const downloadResults = () => {
    toast.info('Téléchargement en cours de développement');
  };

  if (loading) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des résultats...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="results-error">
        <Brain size={48} />
        <h2>Erreur</h2>
        <p>{error || 'Impossible de charger les résultats'}</p>
        <button onClick={() => navigate('/Condidates')} className="error-button">
          <ArrowLeft size={16} />
          Retour au dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="psychological-results-container">
      {/* Header minimaliste */}
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
            <Brain size={28} />
            <div>
              <h1>Résultats Psychologiques</h1>
              <p>{results.testInfo.jobTitle}</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button onClick={shareResults} className="action-btn secondary">
              <Share size={16} />
            </button>
            <button onClick={downloadResults} className="action-btn primary">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Score principal */}
      <div className="main-score-section">
        <div className="score-circle">
          <div 
            className="score-ring"
            style={{
              background: `conic-gradient(${getScoreColor(results.testInfo.overallScore)} ${results.testInfo.overallScore * 3.6}deg, #e5e7eb 0deg)`
            }}
          >
            <div className="score-inner">
              <span className="score-number">{results.testInfo.overallScore}%</span>
              <span className="score-label">{getScoreLevel(results.testInfo.overallScore)}</span>
            </div>
          </div>
        </div>
        
        <div className="score-summary">
          <h2>Profil Psychologique</h2>
          <p>{results.personalityProfile.description}</p>
          
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{results.behavioralInsights.attentionScore}%</span>
              <span className="stat-label">Attention</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.emotionalIntelligence.averageScore}%</span>
              <span className="stat-label">Intelligence Émotionnelle</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.testInfo.duration}min</span>
              <span className="stat-label">Durée</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections principales */}
      <div className="results-grid">
        {/* Personnalité */}
        <div className="result-card">
          <div className="card-header">
            <User size={20} />
            <h3>Personnalité</h3>
          </div>
          <div className="traits-list">
            <div className="trait-item">
              <span>Ouverture</span>
              <div className="trait-bar">
                <div 
                  className="trait-fill" 
                  style={{ 
                    width: `${results.personalityProfile.traits.openness}%`,
                    backgroundColor: getScoreColor(results.personalityProfile.traits.openness)
                  }}
                />
              </div>
              <span className="trait-score">{results.personalityProfile.traits.openness}%</span>
            </div>
            <div className="trait-item">
              <span>Conscience</span>
              <div className="trait-bar">
                <div 
                  className="trait-fill" 
                  style={{ 
                    width: `${results.personalityProfile.traits.conscientiousness}%`,
                    backgroundColor: getScoreColor(results.personalityProfile.traits.conscientiousness)
                  }}
                />
              </div>
              <span className="trait-score">{results.personalityProfile.traits.conscientiousness}%</span>
            </div>
            <div className="trait-item">
              <span>Extraversion</span>
              <div className="trait-bar">
                <div 
                  className="trait-fill" 
                  style={{ 
                    width: `${results.personalityProfile.traits.extraversion}%`,
                    backgroundColor: getScoreColor(results.personalityProfile.traits.extraversion)
                  }}
                />
              </div>
              <span className="trait-score">{results.personalityProfile.traits.extraversion}%</span>
            </div>
          </div>
        </div>

        {/* Capacités cognitives */}
        <div className="result-card">
          <div className="card-header">
            <Target size={20} />
            <h3>Capacités Cognitives</h3>
          </div>
          <div className="abilities-grid">
            <div className="ability-item">
              <span className="ability-label">Résolution de problèmes</span>
              <span 
                className="ability-score"
                style={{ color: getScoreColor(results.cognitiveProfile.abilities.problem_solving) }}
              >
                {results.cognitiveProfile.abilities.problem_solving}%
              </span>
            </div>
            <div className="ability-item">
              <span className="ability-label">Pensée analytique</span>
              <span 
                className="ability-score"
                style={{ color: getScoreColor(results.cognitiveProfile.abilities.analytical_thinking) }}
              >
                {results.cognitiveProfile.abilities.analytical_thinking}%
              </span>
            </div>
            <div className="ability-item">
              <span className="ability-label">Créativité</span>
              <span 
                className="ability-score"
                style={{ color: getScoreColor(results.cognitiveProfile.abilities.creativity) }}
              >
                {results.cognitiveProfile.abilities.creativity}%
              </span>
            </div>
            <div className="ability-item">
              <span className="ability-label">Attention aux détails</span>
              <span 
                className="ability-score"
                style={{ color: getScoreColor(results.cognitiveProfile.abilities.attention_to_detail) }}
              >
                {results.cognitiveProfile.abilities.attention_to_detail}%
              </span>
            </div>
          </div>
        </div>

        {/* Intelligence émotionnelle */}
        <div className="result-card">
          <div className="card-header">
            <Heart size={20} />
            <h3>Intelligence Émotionnelle</h3>
          </div>
          <div className="emotional-scores">
            <div className="emotion-item">
              <span>Conscience de soi</span>
              <span style={{ color: getScoreColor(results.emotionalIntelligence.scores.self_awareness) }}>
                {results.emotionalIntelligence.scores.self_awareness}%
              </span>
            </div>
            <div className="emotion-item">
              <span>Empathie</span>
              <span style={{ color: getScoreColor(results.emotionalIntelligence.scores.empathy) }}>
                {results.emotionalIntelligence.scores.empathy}%
              </span>
            </div>
            <div className="emotion-item">
              <span>Compétences sociales</span>
              <span style={{ color: getScoreColor(results.emotionalIntelligence.scores.social_skills) }}>
                {results.emotionalIntelligence.scores.social_skills}%
              </span>
            </div>
          </div>
        </div>

        {/* Comportements professionnels */}
        <div className="result-card">
          <div className="card-header">
            <TrendingUp size={20} />
            <h3>Comportements Professionnels</h3>
          </div>
          <div className="behavior-grid">
            <div className="behavior-item">
              <span>Leadership</span>
              <span style={{ color: getScoreColor(results.behavioralInsights.patterns.leadership_potential) }}>
                {results.behavioralInsights.patterns.leadership_potential}%
              </span>
            </div>
            <div className="behavior-item">
              <span>Collaboration</span>
              <span style={{ color: getScoreColor(results.behavioralInsights.patterns.team_collaboration) }}>
                {results.behavioralInsights.patterns.team_collaboration}%
              </span>
            </div>
            <div className="behavior-item">
              <span>Gestion du stress</span>
              <span style={{ color: getScoreColor(results.behavioralInsights.patterns.stress_management) }}>
                {results.behavioralInsights.patterns.stress_management}%
              </span>
            </div>
            <div className="behavior-item">
              <span>Adaptabilité</span>
              <span style={{ color: getScoreColor(results.behavioralInsights.patterns.adaptability) }}>
                {results.behavioralInsights.patterns.adaptability}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="recommendations-section">
        <h3>Recommandations</h3>
        <div className="recommendations-list">
          {results.recommendations.slice(0, 3).map((recommendation, index) => (
            <div key={index} className="recommendation-item">
              <div className="recommendation-icon">•</div>
              <p>{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="results-footer">
        <p>Analyse générée par IA • {new Date(results.testInfo.completedAt).toLocaleDateString()}</p>
        <button 
          onClick={() => navigate('/Condidates')}
          className="footer-button"
        >
          Retour au Dashboard
        </button>
      </div>
    </div>
  );
};

export default PsychologicalTestResults;