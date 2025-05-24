// src/components/TechnicalTestPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  const [testStarted, setTestStarted] = useState(false);
  
  // États pour la gestion des questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'answering' | 'finished'>('thinking');
  const [phaseTimer, setPhaseTimer] = useState(60); // 60 secondes pour réfléchir
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [canAnswer, setCanAnswer] = useState(false);
  const [keysReleasedTimer, setKeysReleasedTimer] = useState<number | null>(null);
  const [questionSkipped, setQuestionSkipped] = useState(false);
  
  // Définir les touches requises
  const requiredKeys = {
    leftHand: ['A', 'Z', 'E', 'R'],
    rightHand: ['J', 'K', 'L', 'M']
  };
  const allRequiredKeys = [...requiredKeys.leftHand, ...requiredKeys.rightHand];

  // Chargement initial du test
  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await testService.getTest(id);
        setTest(response.data);
        setAnswers(new Array(response.data.questions.length).fill(''));
        
        if (response.data.status === 'completed') {
          // Test déjà complété, ne pas charger
          return;
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

  // Gestion des touches du clavier
  useEffect(() => {
    if (!testStarted || phase === 'finished') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (allRequiredKeys.includes(key)) {
        setKeysPressed(prev => new Set([...prev, key]));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (allRequiredKeys.includes(key)) {
        setKeysPressed(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [testStarted, phase]);

  // Vérifier si toutes les touches requises sont pressées
  const allKeysPressed = allRequiredKeys.every(key => keysPressed.has(key));

  // Gestion du timer de relâchement des touches (10 secondes)
  useEffect(() => {
    if (!testStarted || phase !== 'thinking') return;

    if (allKeysPressed) {
      // Toutes les touches sont pressées, annuler le timer
      if (keysReleasedTimer) {
        clearTimeout(keysReleasedTimer);
        setKeysReleasedTimer(null);
      }
      setQuestionSkipped(false);
    } else {
      // Pas toutes les touches pressées, démarrer le timer de 10 secondes
      if (!keysReleasedTimer && !questionSkipped) {
        const timer = setTimeout(() => {
          console.log('⏰ Touches relâchées trop longtemps, passage à la question suivante');
          setQuestionSkipped(true);
          goToNextQuestion();
        }, 10000); // 10 secondes
        
        setKeysReleasedTimer(timer);
      }
    }

    return () => {
      if (keysReleasedTimer) {
        clearTimeout(keysReleasedTimer);
      }
    };
  }, [allKeysPressed, testStarted, phase, keysReleasedTimer, questionSkipped]);

  // Effet sonore quand toutes les touches sont bien placées
  useEffect(() => {
    if (allKeysPressed && testStarted && phase === 'thinking') {
      // Créer un son de confirmation
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Fréquence du son
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [allKeysPressed, testStarted, phase]);

  // Gestion du timer des phases
  useEffect(() => {
    if (!testStarted || phase === 'finished') return;

    const timer = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev <= 1) {
          // Timer terminé
          if (phase === 'thinking') {
            // Passer à la phase de réponse
            setPhase('answering');
            setCanAnswer(true);
            return 5; // 5 secondes pour répondre
          } else if (phase === 'answering') {
            // Passer à la question suivante
            goToNextQuestion();
            return 60; // Retour à 60 secondes pour la prochaine question
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, phase, currentQuestionIndex]);

  const goToNextQuestion = useCallback(() => {
    // Nettoyer les timers
    if (keysReleasedTimer) {
      clearTimeout(keysReleasedTimer);
      setKeysReleasedTimer(null);
    }
    
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setPhase('thinking');
      setCanAnswer(false);
      setPhaseTimer(60);
      setQuestionSkipped(false);
    } else {
      // Test terminé
      setPhase('finished');
      handleSubmit();
    }
  }, [currentQuestionIndex, test, keysReleasedTimer]);

  const startTest = async () => {
    if (!id) return;
    
    try {
      await testService.startTest(id);
      setTestStarted(true);
      setCurrentQuestionIndex(0);
      setPhase('thinking');
      setPhaseTimer(60);
      toast.info('Le test a commencé. Placez vos mains sur les touches indiquées!');
    } catch (err) {
      toast.error('Erreur lors du démarrage du test');
    }
  };

  const handleAnswerChange = (answer: string) => {
    if (!canAnswer || phase !== 'answering') return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      const response = await testService.submitTest(id, answers);
      toast.success('Test soumis avec succès!');
      
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

  if (!testStarted) {
    return (
      <div className="technical-test-container">
        <div className="test-header">
          <h1>Test technique</h1>
        </div>
        
        <div className="test-instructions">
          <h2>Instructions importantes</h2>
          <p>Ce test contient {test.questions.length} questions à choix multiples.</p>
          <p><strong>Règles spéciales du test :</strong></p>
          <ul>
            <li>Chaque question sera affichée individuellement</li>
            <li>Vous aurez <strong>1 minute</strong> pour réfléchir à chaque question</li>
            <li>Pendant cette minute, vous devez maintenir :</li>
            <ul>
              <li><strong>Main gauche</strong> sur les touches : A, Z, E, R</li>
              <li><strong>Main droite</strong> sur les touches : J, K, L, M</li>
            </ul>
            <li>Après 1 minute, vous aurez <strong>5 secondes</strong> pour choisir votre réponse</li>
            <li>Le passage à la question suivante est automatique</li>
            <li>Vous ne pouvez pas revenir en arrière</li>
          </ul>
          <p><strong>Assurez-vous d'être prêt avant de commencer!</strong></p>
          <button className="start-test-btn" onClick={startTest}>
            Commencer le test
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'finished' || submitting) {
    return (
      <div className="technical-test-container">
        <div className="test-completion">
          <h2>Test terminé!</h2>
          <p>Soumission en cours...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="technical-test-container">
      <div className="test-header">
        <h1>Test technique</h1>
        <div className="progress-info">
          <span>Question {currentQuestionIndex + 1} / {test.questions.length}</span>
        </div>
      </div>

      <div className="test-content-layout">
        <div className="keyboard-status left-hand">
          <div className="hand-status">
            <h3>Main gauche</h3>
            <div className="keys">
              {requiredKeys.leftHand.map(key => (
                <span 
                  key={key} 
                  className={`key ${keysPressed.has(key) ? 'pressed' : ''}`}
                >
                  {key}
                </span>
              ))}
            </div>
            <div className="hand-instruction">A Z E R</div>
          </div>
        </div>

        <div className="center-content">
          <div className="phase-indicator">
            {phase === 'thinking' && (
              <div className="thinking-phase">
                <h2>Phase de réflexion</h2>
                <p>Maintenez toutes les touches et réfléchissez</p>
                <div className="phase-timer">{phaseTimer}s</div>
                {!allKeysPressed && (
                  <div className="warning">⚠️ Maintenez toutes les touches!</div>
                )}
                {allKeysPressed && (
                  <div className="success">✅ Touches correctement placées!</div>
                )}
                {!allKeysPressed && keysReleasedTimer && (
                  <div className="danger">⚠️ Vous avez 10 secondes pour replacer vos doigts!</div>
                )}
              </div>
            )}
            
            {phase === 'answering' && (
              <div className="answering-phase">
                <h2>Phase de réponse</h2>
                <p>Choisissez votre réponse maintenant</p>
                <div className="phase-timer answer-timer">{phaseTimer}s</div>
              </div>
            )}
          </div>

          <div className="current-question">
            <div className="question-card">
              <h3>Question {currentQuestionIndex + 1}</h3>
              <p>{currentQuestion.questionText}</p>
              
              {currentQuestion.type === 'multiple_choice' && (
                <div className="options">
                  {currentQuestion.options.map((option: string, optionIndex: number) => (
                    <div key={optionIndex} className="option">
                      <input
                        type="radio"
                        id={`q${currentQuestionIndex}-o${optionIndex}`}
                        name={`current-question`}
                        value={option}
                        checked={answers[currentQuestionIndex] === option}
                        onChange={() => handleAnswerChange(option)}
                        disabled={!canAnswer || phase !== 'answering'}
                      />
                      <label 
                        htmlFor={`q${currentQuestionIndex}-o${optionIndex}`}
                        className={!canAnswer ? 'disabled' : ''}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="keyboard-status right-hand">
          <div className="hand-status">
            <h3>Main droite</h3>
            <div className="keys">
              {requiredKeys.rightHand.map(key => (
                <span 
                  key={key} 
                  className={`key ${keysPressed.has(key) ? 'pressed' : ''}`}
                >
                  {key}
                </span>
              ))}
            </div>
            <div className="hand-instruction">J K L M</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalTestPage;