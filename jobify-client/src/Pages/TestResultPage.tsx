// src/components/TestResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { testService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/TestResultsPage.css';

const TestResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState<any>(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results);

  useEffect(() => {
    // Si les résultats ne sont pas disponibles dans location.state, les récupérer
    if (!results && id) {
      const fetchResults = async () => {
        try {
          setLoading(true);
          const response = await testService.getTest(id);
          // Note: Dans une implémentation réelle, il faudrait un endpoint spécifique pour les résultats
          setResults({
            score: response.data.score,
            correctAnswers: Math.round((response.data.score / 100) * response.data.questions.length),
            totalQuestions: response.data.questions.length
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
    return <div className="loading">Chargement des résultats...</div>;
  }

  if (!results) {
    return <div className="error-message">Résultats introuvables</div>;
  }

  // Déterminer la performance
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 75) return "Très bien!";
    if (score >= 60) return "Bien!";
    if (score >= 40) return "Moyen.";
    return "À améliorer.";
  };

  return (
    <div className="test-results-container">
      <h1>Résultats du test technique</h1>
      
      <div className="results-summary">
        <div className="score-display">
          <div className="score-circle">
            <div className="score-number">{Math.round(results.score)}%</div>
          </div>
          <p className="performance-message">{getPerformanceMessage(results.score)}</p>
        </div>

        <div className="results-details">
          <p><strong>Questions correctes:</strong> {results.correctAnswers} sur {results.totalQuestions}</p>
          <p><strong>Date du test:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="results-message">
        <h2>Et maintenant?</h2>
        <p>Vos résultats ont été automatiquement enregistrés et transmis au recruteur.</p>
        <p>Vous recevrez des nouvelles concernant votre candidature dans les prochains jours.</p>
      </div>

      <div className="results-actions">
        <button 
          className="back-to-dashboard-btn" 
          onClick={() => navigate('/Condidates')}
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default TestResultsPage;