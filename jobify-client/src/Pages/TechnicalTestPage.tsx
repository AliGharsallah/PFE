// src/components/TechnicalTestPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/TechnicalTest.css';

const TechnicalTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  // Chargement initial du test
  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await testService.getTest(id);
        setTest(response.data);
        
        // Initialiser les réponses avec un tableau vide de la même longueur que les questions
        setAnswers(new Array(response.data.questions.length).fill(''));
        
        // Vérifier si le test a déjà été commencé
        if (response.data.status === 'in_progress') {
          setTestStarted(true);
          // Calculer le temps restant
          if (response.data.startedAt) {
            const startTime = new Date(response.data.startedAt).getTime();
            const durationMs = response.data.duration * 60 * 1000;
            const endTime = startTime + durationMs;
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            setTimeLeft(Math.floor(remaining / 1000));
          }
        }
      } catch (err) {
        toast.error('Erreur lors du chargement du test');
        navigate('/Condidates');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id, navigate]);

  // Gestion du timer
  useEffect(() => {
    if (!testStarted || timeLeft === null) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const startTest = async () => {
    if (!id) return;
    
    try {
      await testService.startTest(id);
      setTestStarted(true);
      // Définir le temps initial
      setTimeLeft(test.duration * 60);
      toast.info('Le test a commencé. Bonne chance!');
    } catch (err) {
      toast.error('Erreur lors du démarrage du test');
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      const response = await testService.submitTest(id, answers);
      toast.success('Test soumis avec succès!');
      
      // Rediriger vers une page de résultats
      navigate(`/test-results/${id}`, { 
        state: { 
          results: response.data,
          testId: id
        } 
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission du test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return <div className="loading">Chargement du test technique...</div>;
  }

  if (!test) {
    return <div className="error-message">Test introuvable</div>;
  }

  if (test.status === 'completed') {
    return (
      <div className="test-completed-message">
        <h2>Ce test a déjà été complété!</h2>
        <button onClick={() => navigate('/Condidates')}>Retour au tableau de bord</button>
      </div>
    );
  }

  return (
    <div className="technical-test-container">
      <div className="test-header">
        <h1>Test technique</h1>
        {testStarted && timeLeft !== null && (
          <div className="timer">
            Temps restant: <span className={timeLeft < 300 ? 'running-out' : ''}>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {!testStarted ? (
        <div className="test-instructions">
          <h2>Instructions</h2>
          <p>Ce test contient {test.questions.length} questions à choix multiples.</p>
          <p>Vous disposez de {test.duration} minutes pour compléter le test.</p>
          <p>Une fois commencé, vous ne pourrez pas mettre le test en pause.</p>
          <p>Assurez-vous d'être prêt avant de commencer.</p>
          <button 
            className="start-test-btn" 
            onClick={startTest}
          >
            Commencer le test
          </button>
        </div>
      ) : (
        <div className="test-questions">
          {test.questions.map((question: any, index: number) => (
            <div key={index} className="question-card">
              <h3>Question {index + 1}</h3>
              <p>{question.questionText}</p>
              
              {question.type === 'multiple_choice' && (
                <div className="options">
                  {question.options.map((option: string, optionIndex: number) => (
                    <div key={optionIndex} className="option">
                      <input
                        type="radio"
                        id={`q${index}-o${optionIndex}`}
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={() => handleAnswerChange(index, option)}
                        disabled={submitting}
                      />
                      <label htmlFor={`q${index}-o${optionIndex}`}>{option}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="test-actions">
            <button 
              className="submit-test-btn" 
              onClick={handleSubmit}
              disabled={submitting || !answers.every(answer => answer !== '')}
            >
              {submitting ? 'Soumission en cours...' : 'Soumettre le test'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalTestPage;