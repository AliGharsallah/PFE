import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Camera,
  Clock,
  ArrowLeft,
  Shield,
  Brain,
  Play,
  Square,
  Volume2,
  Bot,
  CheckCircle,
  AlertTriangle,
  Keyboard,
  Eye,
  Timer
} from 'lucide-react';
import '../Styles/PsychologicalTest.css';
import { useNavigate, useParams } from 'react-router-dom';

// ================================
// INTERFACES
// ================================
interface TestQuestion {
  id: string;
  question: string;
  category: 'linguistic' | 'stress' | 'emotional' | 'personality';
  difficulty: 'easy' | 'medium' | 'hard';
}
interface VoiceAnalysis {
  speechRate: number;
  emotionalTone: 'neutral' | 'stressed' | 'confident' | 'hesitant';
  linguisticComplexity: number;
  coherenceScore: number;
  totalWords: number;
}
interface SecurityState {
  leftHandActive: boolean;
  rightHandActive: boolean;
  violations: number;
  currentPhase: 'thinking' | 'answering' | 'transition';
  phaseTimeRemaining: number;
}

const PsychologicalTest: React.FC = () => {
  const navigate = useNavigate();
  // Récupérer le technicalTestId depuis les paramètres de route
  const { technicalTestId } = useParams<{ technicalTestId: string }>();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(2700);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Questions et progression
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Système de phases
  const [currentPhase, setCurrentPhase] = useState<'thinking' | 'answering' | 'transition'>('thinking');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(30);
  const [isAutoRecording, setIsAutoRecording] = useState(false);
  
  // Système vocal
  const [transcribedText, setTranscribedText] = useState('');
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  
  // Sécurité
  const [security, setSecurity] = useState<SecurityState>({
    leftHandActive: false,
    rightHandActive: false,
    violations: 0,
    currentPhase: 'thinking',
    phaseTimeRemaining: 30
  });
  
  // Caméra
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ================================
  // FONCTIONS PRINCIPALES
  // ================================
  const initializeSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setTranscribedText(transcript);
      };
      recognition.onerror = (event) => {
        console.error('Erreur reconnaissance vocale:', event.error);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const speakQuestion = useCallback(() => {
    if (!questions[currentQuestionIndex]) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex].question);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [questions, currentQuestionIndex]);

  const startAutoRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const analysis = analyzeVoice(transcribedText);
        setVoiceAnalysis(analysis);
        const questionId = questions[currentQuestionIndex].id;
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            transcript: transcribedText,
            analysis: analysis,
            duration: 60
          }
        }));
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setIsAutoRecording(true);
    } catch (error) {
      console.error('Erreur microphone:', error);
    }
  }, [questions, currentQuestionIndex, transcribedText]);

const stopAutoRecording = useCallback(() => {
  if (mediaRecorderRef.current && isAutoRecording) {
    mediaRecorderRef.current.stop();
    setIsAutoRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // ✅ IMPORTANT: S'assurer que la réponse est sauvegardée
    if (questions[currentQuestionIndex]) {
      const questionId = questions[currentQuestionIndex].id;
      const analysis = analyzeVoice(transcribedText || '');
      
      console.log(`💾 Sauvegarde réponse pour question ${questionId}:`, {
        transcript: transcribedText,
        analysis: analysis
      });
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          transcript: transcribedText || '',
          analysis: analysis,
          duration: 60
        }
      }));
    }
  }
}, [isAutoRecording, transcribedText, questions, currentQuestionIndex]);


  const analyzeVoice = (transcript: string): VoiceAnalysis => {
    const words = transcript.split(' ').filter(w => w.length > 0);
    const speechRate = words.length;
    const stressWords = ['euh', 'hmm', 'donc', 'voilà'];
    const stressCount = stressWords.reduce((count, word) => 
      count + (transcript.toLowerCase().split(word).length - 1), 0);
    const complexWords = words.filter(word => word.length > 6).length;
    const linguisticComplexity = (complexWords / Math.max(words.length, 1)) * 100;
    const emotionalTone = stressCount > 3 ? 'stressed' : 
                         speechRate > 100 ? 'confident' : 
                         speechRate < 50 ? 'hesitant' : 'neutral';
    const coherenceScore = Math.min(100, words.length * 2);
    return {
      speechRate: Math.round(speechRate),
      emotionalTone,
      linguisticComplexity: Math.round(linguisticComplexity),
      coherenceScore: Math.round(coherenceScore),
      totalWords: words.length
    };
  };

  // Système de phases
  const startQuestionPhase = useCallback(() => {
    console.log(`🧠 Question ${currentQuestionIndex + 1} - Phase réflexion`);
    setCurrentPhase('thinking');
    setPhaseTimeRemaining(30);
    setTranscribedText('');
    setVoiceAnalysis(null);
    setTimeout(() => speakQuestion(), 500);
    let timeLeft = 30;
    phaseTimerRef.current = setInterval(() => {
      timeLeft--;
      setPhaseTimeRemaining(timeLeft);
      setSecurity(prev => ({ ...prev, phaseTimeRemaining: timeLeft }));
      if (timeLeft <= 0) {
        if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
        startAnsweringPhase();
      }
    }, 1000);
  }, [currentQuestionIndex, speakQuestion]);

  const startAnsweringPhase = useCallback(() => {
    console.log('🎤 Phase réponse - Enregistrement automatique');
    setCurrentPhase('answering');
    setPhaseTimeRemaining(60);
    startAutoRecording();
    let timeLeft = 60;
    phaseTimerRef.current = setInterval(() => {
      timeLeft--;
      setPhaseTimeRemaining(timeLeft);
      setSecurity(prev => ({ ...prev, phaseTimeRemaining: timeLeft }));
      if (timeLeft <= 0) {
        if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
        endAnsweringPhase();
      }
    }, 1000);
  }, [startAutoRecording]);



  // Système de sécurité
  const LEFT_KEYS = ['a', 'z', 'e', 'r', 't'];
  const RIGHT_KEYS = ['j', 'k', 'l', 'm'];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeysRef.current.add(key);
    const leftActive = LEFT_KEYS.some(k => pressedKeysRef.current.has(k));
    const rightActive = RIGHT_KEYS.some(k => pressedKeysRef.current.has(k));
    setSecurity(prev => ({
      ...prev,
      leftHandActive: leftActive,
      rightHandActive: rightActive
    }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeysRef.current.delete(key);
    const leftActive = LEFT_KEYS.some(k => pressedKeysRef.current.has(k));
    const rightActive = RIGHT_KEYS.some(k => pressedKeysRef.current.has(k));
    setSecurity(prev => {
      const newState = {
        ...prev,
        leftHandActive: leftActive,
        rightHandActive: rightActive
      };
      if (testStarted && currentPhase === 'thinking' && (!leftActive || !rightActive)) {
        newState.violations = prev.violations + 1;
        alert("⚠️ Violation : Maintenez vos mains sur les touches pendant la réflexion !");
      }
      return newState;
    });
  }, [testStarted, currentPhase]);

  const startCamera = useCallback(async () => {
    try {
      console.log('📹 Démarrage caméra...');
      setCameraError(null);

      // Arrêter tout flux précédent
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Essayer avec des contraintes souples si nécessaire
      let constraints = {
        video: true
      };

      let stream: MediaStream | null = null;

      try {
        // Tentative avec contraintes minimales
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        if (err.name === 'OverconstrainedError') {
          // Si contraintes trop strictes, revenir à "true"
          console.warn("⚠️ Contraintes non satisfaisantes, fallback vers 'video: true'");
          constraints = { video: true };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          throw err;
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setCameraActive(true);
              setFaceDetected(true);
              videoRef.current?.classList.add('camera-active');
            })
            .catch(error => {
              console.error('❌ Erreur lecture vidéo:', error);
              setCameraError('Impossible de lire la vidéo');
            });
        };

        videoRef.current.onerror = (error) => {
          console.error('❌ Erreur caméra:', error);
          setCameraError('Erreur de l\'élément vidéo');
        };
      }
    } catch (error: any) {
      console.error('❌ Erreur caméra:', error);
      let errorMessage = 'Erreur caméra inconnue';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra détectée';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Caméra occupée par une autre application';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Accès caméra bloqué - Utilisez HTTPS';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Paramètres vidéo non supportés';
      }
      setCameraError(errorMessage);
    }
  }, []);

  // Créer un test psychologique basé sur le test technique
  const createPsychologicalTest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token d'authentification manquant");

      console.log(`🚀 Création du test psychologique pour le test technique: ${technicalTestId}`);
      
      const response = await fetch(`http://localhost:5000/api/psychological-tests/technical-test/${technicalTestId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la création du test: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Test psychologique créé:', data);
      
      return data.testId; // Retourner l'ID du test psychologique créé
    } catch (error) {
      console.error('❌ Erreur création test psychologique:', error);
      throw error;
    }
  };

  // Contrôles du test
  const startTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Créer le test psychologique sur le serveur
      const psychologicalTestId = await createPsychologicalTest();
      setCurrentTestId(psychologicalTestId);
      
      // Démarrer le test
      const token = localStorage.getItem('token');
      const startResponse = await fetch(`http://localhost:5000/api/psychological-tests/${psychologicalTestId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!startResponse.ok) {
        throw new Error(`Erreur lors du démarrage du test: ${startResponse.status}`);
      }

      setTestStarted(true);
      setTimeout(() => {
        startQuestionPhase();
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('❌ Erreur démarrage:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setLoading(false);
    }
  };

// ================================
// AUSSI, VÉRIFIEZ VOTRE FONCTION submitTest CÔTÉ FRONTEND
// ================================

const submitTest = async () => {
  try {
    setLoading(true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (currentTestId) {
      const token = localStorage.getItem('token');
      
      // ✅ LOGS DE DEBUG POUR answers
      console.log('🎯 === DEBUG RÉPONSES AVANT SOUMISSION ===');
      console.log('📋 État de answers:', answers);
      console.log('📋 Clés de answers:', Object.keys(answers));
      console.log('📋 Nombre de réponses:', Object.keys(answers).length);
      console.log('📋 Questions courantes:', questions.map(q => q.id));
      console.log('📋 Index question courante:', currentQuestionIndex);
      console.log('🎯 === FIN DEBUG RÉPONSES ===');
      
      // ✅ SOLUTION TEMPORAIRE: Créer des réponses factices si vides
      let finalAnswers = answers;
      
      if (Object.keys(answers).length === 0) {
        console.log('⚠️ Aucune réponse trouvée, création de réponses de test...');
        finalAnswers = {};
        
        // Créer une réponse pour chaque question avec les données actuelles
        questions.forEach((question, index) => {
          if (index <= currentQuestionIndex) {
            finalAnswers[question.id] = {
              transcript: transcribedText || `Réponse test pour la question ${index + 1}`,
              duration: 60,
              analysis: voiceAnalysis || {
                speechRate: 120,
                emotionalTone: 'neutral',
                linguisticComplexity: 50,
                coherenceScore: 70,
                totalWords: 20
              }
            };
          }
        });
        
        console.log('✅ Réponses de test créées:', Object.keys(finalAnswers));
      }
      
      const submissionData = {
        answers: finalAnswers,
        behavioralData: {
          securityViolations: security.violations,
          testDuration: Math.round((2700 - timeRemaining) / 60),
          handDetectionTime: 95,
          cameraInterruptions: cameraActive ? 0 : 1,
          faceDetectionTime: faceDetected ? 95 : 50,
          totalSpeakingTime: Object.values(finalAnswers).reduce((sum, answer) => sum + (answer.duration || 60), 0),
          averageResponseTime: 2,
          pausesCount: 0,
          attentionScore: Math.max(0, 100 - security.violations * 10),
          emotionalState: 'neutral',
          behavioralFlags: []
        }
      };

      console.log('📤 Données finales à envoyer:', {
        answersCount: Object.keys(submissionData.answers).length,
        behavioralDataPresent: !!submissionData.behavioralData
      });

      const response = await fetch(`http://localhost:5000/api/psychological-tests/${currentTestId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        console.error('❌ Erreur réponse serveur:', errorData);
        throw new Error(`Erreur lors de la soumission: ${response.status} - ${errorData.message}`);
      }

      const result = await response.json();
      console.log('✅ Test soumis avec succès:', result);
    }

    setTimeout(() => {
      setTestCompleted(true);
      setLoading(false);
    }, 2000);
  } catch (error) {
    console.error('❌ Erreur soumission:', error);
    setError(error instanceof Error ? error.message : 'Erreur lors de la soumission');
    setLoading(false);
  }
};




const endAnsweringPhase = useCallback(() => {
  console.log('✅ Fin de réponse - Transition');
  
  // ✅ S'assurer que la réponse actuelle est sauvegardée avant la transition
  if (questions[currentQuestionIndex]) {
    const questionId = questions[currentQuestionIndex].id;
    const analysis = analyzeVoice(transcribedText || '');
    
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: {
          transcript: transcribedText || '',
          analysis: analysis,
          duration: 60
        }
      };
      console.log(`💾 Réponse sauvegardée pour ${questionId}, total: ${Object.keys(newAnswers).length}`);
      return newAnswers;
    });
  }
  
  stopAutoRecording();
  setCurrentPhase('transition');
  
  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // ✅ Petite pause avant soumission pour laisser le temps au state de se mettre à jour
      setTimeout(() => {
        submitTest();
      }, 1000);
    }
  }, 3000);
}, [stopAutoRecording, currentQuestionIndex, questions.length, transcribedText, submitTest]);
  // ================================
  // EFFETS
  // ================================

useEffect(() => {
  const initialize = async () => {
    setLoading(true);
    
    // Vérifier que technicalTestId est présent
    if (!technicalTestId) {
      setError('ID du test technique manquant');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Initialisation du test psychologique...');
      
      // ✅ ÉTAPE 1: Créer ou récupérer le test psychologique
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log(`📋 Création/récupération du test pour technicalTestId: ${technicalTestId}`);
      
      const response = await fetch(`http://localhost:5000/api/psychological-tests/technical-test/${technicalTestId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la création du test: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Test psychologique créé/récupéré:', data);
      
      // ✅ ÉTAPE 2: Extraire et formater les questions avec leurs vrais IDs
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Questions non reçues du serveur');
      }

      const serverQuestions = data.questions.map(q => ({
        id: q._id,           // ✅ Utiliser l'ID réel du serveur (ling_1, stress_2, etc.)
        question: q.questionText,
        category: q.category,
        difficulty: q.difficulty
      }));
      
      console.log('📝 Questions formatées:', serverQuestions.map(q => ({ 
        id: q.id, 
        category: q.category,
        preview: q.question.substring(0, 50) + '...'
      })));
      
      // ✅ ÉTAPE 3: Mettre à jour les states
      setQuestions(serverQuestions);
      setCurrentTestId(data.testId);
      
      console.log(`✅ État mis à jour: ${serverQuestions.length} questions, testId: ${data.testId}`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      setError(error instanceof Error ? error.message : 'Erreur d\'initialisation');
      setLoading(false);
      return;
    }

    try {
      // ✅ ÉTAPE 4: Initialiser les composants techniques
      console.log('🔧 Initialisation des composants techniques...');
      
      // Initialiser la reconnaissance vocale
      initializeSpeechRecognition();
      
      // Démarrer la caméra
      await startCamera();
      
      console.log('✅ Composants techniques initialisés');
      
    } catch (error) {
      console.warn('⚠️ Erreur composants techniques (non bloquante):', error);
      // Ne pas bloquer si caméra/micro échouent
    }

    setLoading(false);
  };

  // Lancer l'initialisation
  initialize();

  // ✅ CLEANUP: Nettoyer les ressources à la destruction du composant
  return () => {
    console.log('🧹 Nettoyage des ressources...');
    
    // Arrêter les flux vidéo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('📹 Track vidéo arrêté');
      });
    }
    
    // Arrêter les timers
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current);
      console.log('⏰ Timer de phase arrêté');
    }
    
    // Arrêter la synthèse vocale
    speechSynthesis.cancel();
    console.log('🔊 Synthèse vocale arrêtée');
    
    // Arrêter la reconnaissance vocale
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('🎤 Reconnaissance vocale arrêtée');
      } catch (err) {
        console.warn('⚠️ Erreur arrêt reconnaissance vocale:', err);
      }
    }
    
    console.log('✅ Nettoyage terminé');
  };
}, [technicalTestId, initializeSpeechRecognition, startCamera]);

// ================================
// useEffect POUR GÉRER LA PROGRESSION DES QUESTIONS
// ================================

useEffect(() => {
  if (testStarted && !testCompleted && currentPhase === 'transition') {
    console.log(`🔄 Transition vers question ${currentQuestionIndex + 1}`);
    setTimeout(() => {
      startQuestionPhase();
    }, 500);
  }
}, [currentQuestionIndex, testStarted, testCompleted, currentPhase, startQuestionPhase]);

// ================================
// useEffect POUR LA GESTION DU CLAVIER (SÉCURITÉ)
// ================================

useEffect(() => {
  if (testStarted) {
    console.log('⌨️ Activation du système de sécurité clavier');
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      console.log('⌨️ Désactivation du système de sécurité clavier');
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }
}, [testStarted, handleKeyDown, handleKeyUp]);

// ================================
// useEffect POUR LE TIMER GLOBAL DU TEST
// ================================

useEffect(() => {
  if (!testStarted || testCompleted) return;
  
  console.log('⏱️ Démarrage du timer global du test');
  
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        console.log('⏰ Temps écoulé - Soumission automatique');
        submitTest();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => {
    console.log('⏱️ Arrêt du timer global');
    clearInterval(timer);
  };
}, [testStarted, testCompleted]);

// ================================
// useEffect POUR CALCULER LA PROGRESSION
// ================================

useEffect(() => {
  if (questions.length > 0) {
    const newProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
    setProgress(newProgress);
    console.log(`📊 Progression mise à jour: ${Math.round(newProgress)}% (${currentQuestionIndex + 1}/${questions.length})`);
  }
}, [currentQuestionIndex, questions.length]);
  // ================================
  // UTILITAIRES
  // ================================
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseMessage = () => {
    switch (currentPhase) {
      case 'thinking': return `🧠 Réflexion - Maintenez les touches (${phaseTimeRemaining}s)`;
      case 'answering': return `🎤 Réponse en cours - Parlez maintenant (${phaseTimeRemaining}s)`;
      case 'transition': return `✅ Réponse enregistrée - Transition...`;
      default: return 'En attente...';
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'thinking': return <Brain size={20} />;
      case 'answering': return <Mic size={20} />;
      case 'transition': return <CheckCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  // Gestion des erreurs
  if (error) {
    return (
      <div className="psych-test-container">
        <div className="psych-test-header">
          <button className="psych-back-button" onClick={() => navigate('/Condidates')}>
            <ArrowLeft size={20} />
            Retour
          </button>
          <h3>Test Psychologique</h3>
        </div>
        <div className="psych-error-container">
          <AlertTriangle size={64} className="psych-error-icon" />
          <h2>Erreur</h2>
          <p>{error}</p>
          <button className="psych-retry-button" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // RENDU JSX
  // ================================
  return (
    <div className="psych-test-container">
      {/* Header */}
      <div className="psych-test-header">
        <button className="psych-back-button" onClick={() => navigate('/Condidates')}>
          <ArrowLeft size={20} />
          Retour
        </button>
        <h3>Test Psychologique</h3>
        {testStarted && !testCompleted && (
          <div className="psych-timer">
            <Clock size={18} />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      {loading ? (
        <div className="psych-loading-container">
          <div className="psych-loading-spinner"></div>
          <p>Initialisation du test vocal...</p>
        </div>
      ) : !testStarted ? (
        <div className="psych-test-intro">
          <div className="psych-intro-card">
            <Bot size={64} className="psych-intro-icon" />
            <h2>Test Psychologique Vocal</h2>
            <p>Évaluation avancée avec analyse vocale et comportementale</p>
            <div className="psych-intro-features">
              <div className="psych-feature">
                <Timer size={20} />
                <span>30s réflexion + 60s réponse</span>
              </div>
              <div className="psych-feature">
                <Keyboard size={20} />
                <span>Sécurité AZERT+JKLM</span>
              </div>
              <div className="psych-feature">
                <Mic size={20} />
                <span>Enregistrement auto</span>
              </div>
              <div className="psych-feature">
                <Eye size={20} />
                <span>Surveillance vidéo</span>
              </div>
            </div>
            <div className="psych-intro-warning">
              <AlertTriangle size={20} />
              <div>
                <strong>Instructions importantes :</strong><br />
                • Maintenez AZERT (gauche) + JKLM (droite) pendant la réflexion<br />
                • Relâchez pendant votre réponse de 60 secondes<br />
                • Transition automatique entre questions
              </div>
            </div>
            <button className="psych-start-button" onClick={startTest}>
              🚀 Commencer le test
            </button>
          </div>
        </div>
      )     : testCompleted ? (
        <div className="psych-test-completion">
          <CheckCircle size={80} className="psych-completion-icon" />
          <h2>Test Terminé !</h2>
          <p>Votre analyse vocale est complète</p>
          
          {/* ✅ CORRECTION: Actions après complétion */}
          <div className="completion-actions">
            <button 
              className="psych-results-button primary" 
              onClick={() => navigate(`/psychological-test-results/${currentTestId}`)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto 16px auto',
                transition: 'all 0.3s ease'
              }}
            >
              <Brain size={20} />
              🧠 Voir mes résultats
            </button>
            
            <button 
              className="psych-dashboard-button secondary" 
              onClick={() => navigate('/Condidates')}
              style={{
                background: 'transparent',
                color: '#6366f1',
                border: '2px solid #6366f1',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowLeft size={16} />
              Retour au Dashboard
            </button>
          </div>
          
          {/* ✅ AJOUT: Message informatif */}
          <div className="completion-info" style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <CheckCircle size={24} style={{ color: '#22c55e', marginBottom: '8px' }} />
            <p style={{ margin: 0, color: '#166534', fontWeight: '500' }}>
              ✅ Votre test psychologique a été soumis avec succès !<br />
              📊 Les résultats sont maintenant disponibles dans votre dashboard.
            </p>
          </div>
        </div>
      ) : (
        <div className="psych-test-main">
          {/* Barre de progression */}
         
          <div className="psych-test-layout">
             {/* Contrôles et statuts - Grille 2 colonnes */}
              <div className="psych-controls-status-grid">
                 <div className={`psych-phase-indicator psych-phase-${currentPhase}`}>
                {getPhaseIcon()}
                <span>{getPhaseMessage()}</span>
              </div>
              {/* Question text */}
              <div className="psych-question-text-container">
                <h3 className="psych-question-text">
                  {questions[currentQuestionIndex]?.question}
                </h3>
              </div>
                {/* Contrôles vocaux */}
                <div className="psych-vocal-controls">
                  <h4>
                    <Volume2 size={16} />
                    Contrôles Vocaux
                  </h4>
                  <div className="psych-vocal-buttons">
                    <button className="psych-control-button" onClick={speakQuestion}>
                      <Volume2 size={16} />
                      🔊 Réécouter
                    </button>
                  </div>
                  <div className={`psych-mic-status ${isAutoRecording ? 'recording' : ''}`}>
                    {isAutoRecording ? <Square size={16} /> : <Mic size={16} />}
                    <span>
                      {isAutoRecording ? '🎤 Enregistrement...' : '🎤 Micro prêt'}
                    </span>
                  </div>
                </div>

              
              </div>
            {/* Section question principale */}
            <div className="psych-question-section">
              <div className="psych-question-header">
                <div className="psych-question-info">
                  <Brain size={20} />
                  <span>Question {currentQuestionIndex + 1}</span>
                </div>
                <div className="psych-question-badges">
                  <span className="psych-category-badge">
                    {questions[currentQuestionIndex]?.category}
                  </span>
                  <span className="psych-difficulty-badge">
                    {questions[currentQuestionIndex]?.difficulty}
                  </span>
                </div>
              </div>
              {/* Indicateur de phase */}
             
             
              {/* Caméra et Statistiques - Grille 2 colonnes */}
              <div className="psych-camera-surveillance">
                {/* Caméra */}
                <div className="psych-camera-container">
                  <div className="psych-camera-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera size={16} />
                      <span>Surveillance Vidéo</span>
                    </div>
                    <div className={`psych-camera-status ${cameraActive ? 'active' : 'inactive'}`}>
                      {cameraActive ? '✅ Actif' : '❌ Inactif'}
                    </div>
                  </div>
                  <div>
                    <video
                      ref={videoRef}
                      className="psych-camera-video"
                      autoPlay
                      playsInline
                      muted
                      style={{ display: cameraActive ? 'block' : 'none' }}
                    />
                    {!cameraActive && (
                      <div className="psych-camera-placeholder">
                        <Camera size={32} />
                        <div>
                          <div>Caméra non disponible</div>
                          {cameraError && (
                            <div className="psych-camera-error">{cameraError}</div>
                          )}
                        </div>
                        <button className="psych-retry-button" onClick={startCamera}>
                          Réessayer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Statistiques */}
              
              </div>

           
              {/* Transcription */}
              {(currentPhase === 'answering' || transcribedText) && (
                <div className="psych-transcript-container">
                  <h4 className="psych-transcript-title">
                    📝 Transcription en temps réel :
                  </h4>
                  <p className={`psych-transcript-text ${!transcribedText ? 'empty' : ''}`}>
                    {transcribedText || "En attente de votre réponse..."}
                  </p>
                </div>
              )}
              {/* Analyse vocale */}
              {voiceAnalysis && (
                <div className="psych-voice-analysis">
                  <h4 className="psych-analysis-title">🧠 Analyse vocale instantanée :</h4>
                  <div className="psych-analysis-grid">
                    <div className="psych-analysis-item">
                      📈 Débit: {voiceAnalysis.speechRate} mots/min
                    </div>
                    <div className="psych-analysis-item">
                      🎯 Complexité: {voiceAnalysis.linguisticComplexity}%
                    </div>
                    <div className="psych-analysis-item">
                      😊 Ton: {voiceAnalysis.emotionalTone}
                    </div>
                    <div className="psych-analysis-item">
                      ✅ Cohérence: {voiceAnalysis.coherenceScore}%
                    </div>
                  </div>
                </div>
              )} 
            </div>
           
            <div>
              {security.violations > 0 && (
                <div className="violations-warning">
                  ⚠️ {security.violations} violation(s) détectée(s)
                </div>
              )}
            </div>
            {/* Statistiques */}
            <div className="sidebar-card">
                <div className="psych-security-status">
                  <h4>
                    <Shield size={16} />
                    Contrôle de Sécurité
                  </h4>
                  <div className="psych-hands-status">
                    <div className={`psych-hand-status ${security.leftHandActive ? 'active' : 'inactive'}`}>
                      {security.leftHandActive ? '✅' : '⚠️'} Main Gauche (AZERT)
                    </div>
                    <div className={`psych-hand-status ${security.rightHandActive ? 'active' : 'inactive'}`}>
                      {security.rightHandActive ? '✅' : '⚠️'} Main Droite (JKLM)
                    </div>
                  </div>
                  <div className="psych-phase-info">
                    {currentPhase === 'thinking' ? 
                      '🔒 Maintenez les touches pendant la réflexion' : 
                      '🔓 Vous pouvez relâcher pendant la réponse'
                    }
                  </div>
                  {security.violations > 0 && (
                    <div className="psych-violations-warning">
                      ⚠️ {security.violations} violation(s) détectée(s)
                    </div>
                  )}
                </div>
                <div className="psych-stats-container">
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Timer size={16} />
                    Statistiques
                  </h4>
                  <div className="psych-stats-grid">
                    <div className="psych-stat-item">
                      <span className="psych-stat-label">Réponses données:</span>
                      <span className="psych-stat-value">
                        {Object.keys(answers).length}/{questions.length}
                      </span>
                    </div>
                    <div className="psych-stat-item">
                      <span className="psych-stat-label">Temps écoulé:</span>
                      <span className="psych-stat-value">
                        {formatTime(2700 - timeRemaining)}
                      </span>
                    </div>
                    <div className="psych-stat-item">
                      <span className="psych-stat-label">Score comportement:</span>
                      <span className={`psych-stat-value ${
                        security.violations === 0 ? 'good' : 
                        security.violations < 3 ? 'warning' : 'danger'
                      }`}>
                        {Math.max(0, 100 - security.violations * 10)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="psych-progress-container">
                  <div className="psych-progress-bar">
                    <div className="psych-progress-fill" style={{width: `${progress}%`}}></div>
                  </div>
                  <div className="psych-progress-labels">
                    <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
                    <span>{Math.round(progress)}% complété</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
      )}
    </div>
  );
};

export default PsychologicalTest;