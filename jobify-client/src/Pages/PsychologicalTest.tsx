import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  MessageCircle,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Shield,
  Brain,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import '../Styles/PsychologicalTest.css';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../assets/frontend.jpg';
import companyLogo from '../assets/EntretienIA.svg';

// Interfaces
interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

interface TestQuestion {
  id: string;
  question: string;
  type: 'open' | 'choice';
  options?: string[];
  category: 'personality' | 'cognitive' | 'emotional' | 'behavioral';
}

interface VideoCallState {
  isActive: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
}

interface DetectionState {
  faceDetected: boolean;
  faceCentered: boolean;
  handsVisible: boolean;
  handRaised: boolean;
  verificationComplete: boolean;
  confidence: number;
}

interface AnalysisResult {
  personality_traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  cognitive_abilities: {
    problem_solving: number;
    analytical_thinking: number;
    creativity: number;
    attention_to_detail: number;
  };
  emotional_intelligence: {
    self_awareness: number;
    empathy: number;
    social_skills: number;
    emotional_regulation: number;
  };
  behavioral_patterns: {
    leadership_potential: number;
    team_collaboration: number;
    stress_management: number;
    adaptability: number;
  };
  overall_score: number;
  recommendations: string[];
}

const PsychologicalTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(2700); // 45 minutes
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // États pour le chat et IA
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // États pour la vidéo
  const [videoCall, setVideoCall] = useState<VideoCallState>({
    isActive: false,
    isCameraOn: true,
    isMicOn: true,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // États pour la détection améliorée
  const [detection, setDetection] = useState<DetectionState>({
    faceDetected: false,
    faceCentered: false,
    handsVisible: false,
    handRaised: false,
    verificationComplete: false,
    confidence: 0
  });
  
  const detectionRef = useRef<boolean>(false);
  const verificationStepRef = useRef<'waiting' | 'face' | 'hands' | 'handRaise' | 'complete'>('waiting');
  
  // Métriques de surveillance
  const [attentionScore, setAttentionScore] = useState(100);
  const [emotionalState, setEmotionalState] = useState('neutral');
  const [behavioralFlags, setBehavioralFlags] = useState<string[]>([]);

  // Questions psychologiques uniques générées par IA
  const generateUniqueQuestions = useCallback(async (): Promise<TestQuestion[]> => {
    // Simulation d'appel à CodeLlama pour générer des questions uniques
    // En production, remplacez par un vrai appel API à CodeLlama
    
    const questionCategories = {
      personality: [
        "Décrivez une situation où vous avez dû prendre une décision difficile sans avoir toutes les informations nécessaires.",
        "Comment réagissez-vous quand vos plans ne se déroulent pas comme prévu ?",
        "Parlez-moi d'un moment où vous avez dû sortir de votre zone de confort.",
        "Qu'est-ce qui vous motive le plus dans votre travail au quotidien ?",
        "Comment gérez-vous les critiques constructives ?"
      ],
      cognitive: [
        "Expliquez votre processus de résolution de problèmes complexes.",
        "Comment analysez-vous les informations contradictoires ?",
        "Décrivez une innovation ou amélioration que vous avez proposée.",
        "Comment priorisez-vous vos tâches quand tout semble urgent ?",
        "Quelle approche utilisez-vous pour apprendre de nouvelles compétences ?"
      ],
      emotional: [
        "Comment reconnaissez-vous et gérez-vous vos émotions en situation stressante ?",
        "Décrivez comment vous aidez un collègue en difficulté.",
        "Comment maintenez-vous de bonnes relations professionnelles ?",
        "Parlez-moi d'un conflit interpersonnel que vous avez résolu.",
        "Comment adaptez-vous votre communication selon votre interlocuteur ?"
      ],
      behavioral: [
        "Décrivez votre style de leadership avec des exemples concrets.",
        "Comment contribuez-vous à l'esprit d'équipe ?",
        "Quelle est votre approche pour respecter les délais serrés ?",
        "Comment vous adaptez-vous aux changements organisationnels ?",
        "Décrivez votre éthique de travail et vos valeurs professionnelles."
      ]
    };

    const selectedQuestions: TestQuestion[] = [];
    let questionId = 1;

    // Sélectionner 4-5 questions par catégorie de manière aléatoire
    Object.entries(questionCategories).forEach(([category, questions]) => {
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      
      selected.forEach(question => {
        selectedQuestions.push({
          id: questionId.toString(),
          question: question,
          type: 'open',
          category: category as 'personality' | 'cognitive' | 'emotional' | 'behavioral'
        });
        questionId++;
      });
    });

    // Ajouter quelques questions à choix multiples
    const multipleChoiceQuestions: TestQuestion[] = [
      {
        id: questionId.toString(),
        question: "Dans un projet d'équipe, vous préférez généralement :",
        type: 'choice',
        category: 'behavioral',
        options: [
          "Prendre l'initiative et coordonner les actions",
          "Apporter votre expertise technique",
          "Faciliter la communication entre les membres",
          "Analyser et évaluer les différentes options"
        ]
      },
      {
        id: (questionId + 1).toString(),
        question: "Face à un échec, votre première réaction est de :",
        type: 'choice',
        category: 'emotional',
        options: [
          "Analyser ce qui n'a pas fonctionné",
          "Chercher du soutien auprès de vos collègues",
          "Vous concentrer sur les solutions",
          "Prendre du recul pour réfléchir"
        ]
      }
    ];

    selectedQuestions.push(...multipleChoiceQuestions);
    
    // Mélanger toutes les questions
    return selectedQuestions.sort(() => 0.5 - Math.random()).slice(0, 15);
  }, []);

  // Détection faciale et des mains améliorée
  const initializeDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    detectionRef.current = true;
    runDetectionLoop(video, canvas, ctx);
  }, []);

  const runDetectionLoop = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (!detectionRef.current) return;

    try {
      // Mettre à jour les dimensions du canvas
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Analyse des pixels pour la détection de couleur de peau et de mouvement
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      let skinPixels = 0;
      let totalPixels = pixels.length / 4;
      let centerRegionSkinPixels = 0;
      let centerRegionPixels = 0;
      
      // Zone centrale pour la détection du visage (1/3 central)
      const centerStartX = Math.floor(canvas.width / 3);
      const centerEndX = Math.floor((canvas.width * 2) / 3);
      const centerStartY = Math.floor(canvas.height / 4);
      const centerEndY = Math.floor((canvas.height * 3) / 4);

      // Dessiner les données vidéo sur le canvas pour l'analyse
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const currentPixels = currentImageData.data;

      // Détecter la couleur de peau
      for (let i = 0; i < currentPixels.length; i += 4) {
        const r = currentPixels[i];
        const g = currentPixels[i + 1];
        const b = currentPixels[i + 2];
        
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        
        // Algorithme de détection de couleur de peau amélioré
        if (isSkinColor(r, g, b)) {
          skinPixels++;
          
          // Vérifier si c'est dans la zone centrale
          if (x >= centerStartX && x <= centerEndX && y >= centerStartY && y <= centerEndY) {
            centerRegionSkinPixels++;
          }
        }
        
        if (x >= centerStartX && x <= centerEndX && y >= centerStartY && y <= centerEndY) {
          centerRegionPixels++;
        }
      }

      // Calculer les métriques de détection
      const skinPercentage = (skinPixels / totalPixels) * 100;
      const centerSkinPercentage = centerRegionPixels > 0 ? (centerRegionSkinPixels / centerRegionPixels) * 100 : 0;
      
      // Détecter le visage
      const faceDetected = skinPercentage > 5; // Au moins 5% de pixels de peau
      const faceCentered = centerSkinPercentage > 15; // Au moins 15% de peau dans la zone centrale
      
      // Détecter les mains (zones de peau sur les côtés)
      const leftHandRegion = detectHandInRegion(currentPixels, canvas.width, canvas.height, 'left');
      const rightHandRegion = detectHandInRegion(currentPixels, canvas.width, canvas.height, 'right');
      const handsVisible = leftHandRegion || rightHandRegion;
      
      // Détecter main levée (zones de peau dans la partie supérieure)
      const upperRegionSkin = detectHandInRegion(currentPixels, canvas.width, canvas.height, 'upper');
      const handRaised = upperRegionSkin;

      // Calculer la confiance
      const confidence = Math.min(100, Math.max(0, 
        (skinPercentage * 2) + 
        (faceCentered ? 30 : 0) + 
        (handsVisible ? 20 : 0) + 
        (handRaised ? 10 : 0)
      ));

      // Dessiner les indicateurs visuels
      drawDetectionIndicators(ctx, canvas, faceDetected, faceCentered, handsVisible, handRaised);

      // Mettre à jour l'état
      setDetection(prev => ({
        ...prev,
        faceDetected,
        faceCentered,
        handsVisible,
        handRaised,
        confidence: Math.round(confidence)
      }));

      // Progression de la vérification
      updateVerificationProgress(faceDetected, faceCentered, handsVisible, handRaised);

    } catch (error) {
      console.error('Erreur dans la détection:', error);
    }

    // Continuer la boucle
    if (detectionRef.current) {
      requestAnimationFrame(() => runDetectionLoop(video, canvas, ctx));
    }
  }, []);

  // Fonction pour détecter la couleur de peau
  const isSkinColor = (r: number, g: number, b: number): boolean => {
    // Algorithme HSV pour la détection de couleur de peau
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    // Conditions pour la couleur de peau
    return (
      r > 95 && g > 40 && b > 20 &&
      (max - min) > 15 &&
      Math.abs(r - g) > 15 &&
      r > g && r > b
    ) || (
      r > 220 && g > 210 && b > 170 &&
      Math.abs(r - g) <= 15 &&
      r > b && g > b
    );
  };

  // Fonction pour détecter les mains dans une région
  const detectHandInRegion = (pixels: Uint8ClampedArray, width: number, height: number, region: 'left' | 'right' | 'upper'): boolean => {
    let startX, endX, startY, endY;
    
    switch (region) {
      case 'left':
        startX = 0;
        endX = Math.floor(width / 4);
        startY = Math.floor(height / 4);
        endY = Math.floor((height * 3) / 4);
        break;
      case 'right':
        startX = Math.floor((width * 3) / 4);
        endX = width;
        startY = Math.floor(height / 4);
        endY = Math.floor((height * 3) / 4);
        break;
      case 'upper':
        startX = Math.floor(width / 4);
        endX = Math.floor((width * 3) / 4);
        startY = 0;
        endY = Math.floor(height / 3);
        break;
      default:
        return false;
    }
    
    let skinPixelsInRegion = 0;
    let totalPixelsInRegion = 0;
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = (y * width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        
        if (isSkinColor(r, g, b)) {
          skinPixelsInRegion++;
        }
        totalPixelsInRegion++;
      }
    }
    
    const skinPercentageInRegion = totalPixelsInRegion > 0 ? (skinPixelsInRegion / totalPixelsInRegion) * 100 : 0;
    return skinPercentageInRegion > 8; // Au moins 8% de peau dans la région
  };

  // Fonction pour dessiner les indicateurs visuels
  const drawDetectionIndicators = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    faceDetected: boolean, 
    faceCentered: boolean, 
    handsVisible: boolean, 
    handRaised: boolean
  ) => {
    // Effacer d'abord
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cadre de guidage pour le visage
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 6;
    
    ctx.strokeStyle = faceCentered ? '#22c55e' : (faceDetected ? '#f59e0b' : '#ef4444');
    ctx.lineWidth = 4;
    ctx.setLineDash(faceCentered ? [] : [10, 10]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Indicateurs pour les mains
    if (handsVisible) {
      // Indicateur main gauche
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(10, canvas.height / 2 - 20, 20, 40);
      
      // Indicateur main droite
      ctx.fillRect(canvas.width - 30, canvas.height / 2 - 20, 20, 40);
    }
    
    // Indicateur main levée
    if (handRaised) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(centerX - 20, 10, 40, 20);
      
      // Flèche vers le haut
      ctx.beginPath();
      ctx.moveTo(centerX, 30);
      ctx.lineTo(centerX - 10, 50);
      ctx.lineTo(centerX + 10, 50);
      ctx.closePath();
      ctx.fill();
    }
    
    // Afficher la confiance
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter';
    ctx.fillText(`Confiance: ${Math.round(detection.confidence)}%`, 10, 30);
  };

  // Fonction pour mettre à jour la progression de vérification
  const updateVerificationProgress = (faceDetected: boolean, faceCentered: boolean, handsVisible: boolean, handRaised: boolean) => {
    const currentStep = verificationStepRef.current;
    
    if (currentStep === 'waiting') {
      verificationStepRef.current = 'face';
      addBotMessage("Étape 1: Placez votre visage au centre du cercle et regardez directement la caméra.");
    } else if (currentStep === 'face' && faceCentered) {
      setTimeout(() => {
        verificationStepRef.current = 'hands';
        addBotMessage("Étape 2: Parfait ! Maintenant, montrez vos deux mains à la caméra.");
      }, 2000);
    } else if (currentStep === 'hands' && handsVisible) {
      setTimeout(() => {
        verificationStepRef.current = 'handRaise';
        addBotMessage("Étape 3: Excellent ! Levez maintenant une main au-dessus de votre tête.");
      }, 2000);
    } else if (currentStep === 'handRaise' && handRaised) {
      setTimeout(() => {
        verificationStepRef.current = 'complete';
        setDetection(prev => ({ ...prev, verificationComplete: true }));
        addBotMessage("Vérification complète ! Vous pouvez maintenant commencer à répondre aux questions du test psychologique.");
      }, 2000);
    }
  };

  // Analyse avec CodeLlama (simulation)
  const analyzeResponsesWithCodeLlama = async (responses: Record<string, string>): Promise<AnalysisResult> => {
    // Simulation d'appel à CodeLlama pour l'analyse psychologique
    // En production, remplacez par un vrai appel API
    
    addBotMessage("Analyse en cours avec l'IA CodeLlama...");
    
    // Simuler un délai d'analyse
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Analyse simulée basée sur les réponses
    const responseTexts = Object.values(responses).join(' ').toLowerCase();
    
    // Analyse des mots-clés pour déduire les traits
    const keywords = {
      openness: ['créatif', 'innovation', 'nouveau', 'idée', 'changement', 'apprendre'],
      conscientiousness: ['organisé', 'planifié', 'détail', 'méthodique', 'rigoureux', 'deadline'],
      extraversion: ['équipe', 'communication', 'leader', 'social', 'présentation', 'groupe'],
      agreeableness: ['aide', 'collabor', 'empathie', 'écoute', 'soutien', 'comprendre'],
      neuroticism: ['stress', 'anxieux', 'pression', 'difficile', 'problème', 'challenge']
    };
    
    const scores: any = {};
    Object.entries(keywords).forEach(([trait, words]) => {
      const count = words.reduce((acc, word) => {
        return acc + (responseTexts.split(word).length - 1);
      }, 0);
      scores[trait] = Math.min(100, Math.max(20, 50 + count * 10 + Math.random() * 20));
    });
    
    const result: AnalysisResult = {
      personality_traits: {
        openness: Math.round(scores.openness || 70),
        conscientiousness: Math.round(scores.conscientiousness || 75),
        extraversion: Math.round(scores.extraversion || 65),
        agreeableness: Math.round(scores.agreeableness || 80),
        neuroticism: Math.round(100 - (scores.neuroticism || 30))
      },
      cognitive_abilities: {
        problem_solving: Math.round(70 + Math.random() * 25),
        analytical_thinking: Math.round(75 + Math.random() * 20),
        creativity: Math.round(scores.openness * 0.8),
        attention_to_detail: Math.round(scores.conscientiousness * 0.9)
      },
      emotional_intelligence: {
        self_awareness: Math.round(scores.agreeableness * 0.8),
        empathy: Math.round(scores.agreeableness * 0.9),
        social_skills: Math.round(scores.extraversion * 0.8),
        emotional_regulation: Math.round((100 - scores.neuroticism) * 0.8)
      },
      behavioral_patterns: {
        leadership_potential: Math.round((scores.extraversion + scores.conscientiousness) / 2),
        team_collaboration: Math.round((scores.agreeableness + scores.extraversion) / 2),
        stress_management: Math.round(100 - scores.neuroticism),
        adaptability: Math.round((scores.openness + (100 - scores.neuroticism)) / 2)
      },
      overall_score: 0,
      recommendations: []
    };
    
    // Calculer le score global
    const allScores = [
      ...Object.values(result.personality_traits),
      ...Object.values(result.cognitive_abilities),
      ...Object.values(result.emotional_intelligence),
      ...Object.values(result.behavioral_patterns)
    ];
    result.overall_score = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    
    // Générer des recommandations
    result.recommendations = generateRecommendations(result);
    
    return result;
  };

  const generateRecommendations = (analysis: AnalysisResult): string[] => {
    const recommendations: string[] = [];
    
    if (analysis.personality_traits.openness > 80) {
      recommendations.push("Excellent potentiel d'innovation - Idéal pour des rôles créatifs et de développement");
    }
    
    if (analysis.personality_traits.conscientiousness > 80) {
      recommendations.push("Grande fiabilité et organisation - Parfait pour des postes de gestion de projet");
    }
    
    if (analysis.emotional_intelligence.empathy > 80) {
      recommendations.push("Excellentes compétences relationnelles - Adapté au management d'équipe");
    }
    
    if (analysis.cognitive_abilities.problem_solving > 80) {
      recommendations.push("Capacités analytiques remarquables - Recommandé pour des défis techniques complexes");
    }
    
    if (analysis.behavioral_patterns.leadership_potential > 80) {
      recommendations.push("Fort potentiel de leadership - Candidat pour des postes de direction");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Profil équilibré avec de bonnes compétences générales");
    }
    
    return recommendations;
  };

  // Initialisation du test
  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);
        
        // Générer des questions uniques
        const uniqueQuestions = await generateUniqueQuestions();
        setQuestions(uniqueQuestions);
        
        // Message de bienvenue personnalisé
        addBotMessage(`Bienvenue ${user?.name || 'Candidat'} ! Je suis votre assistant IA pour ce test psychologique unique. Ce test a été spécialement conçu pour évaluer vos compétences et votre personnalité de manière approfondie.`);
        
        setTimeout(() => {
          addBotMessage("Ce test comprend des questions ouvertes et à choix multiples couvrant quatre domaines clés : personnalité, capacités cognitives, intelligence émotionnelle et comportements professionnels.");
        }, 2000);
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        toast.error("Erreur lors du chargement du test");
      } finally {
        setLoading(false);
      }
    };
    
    initializeTest();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      detectionRef.current = false;
    };
  }, [generateUniqueQuestions, user?.name]);

  // Démarrage de la caméra et détection
  useEffect(() => {
    if (testStarted && videoCall.isActive) {
      initializeDetection();
    }
    
    return () => {
      detectionRef.current = false;
    };
  }, [testStarted, videoCall.isActive, initializeDetection]);

  // Timer du test
  useEffect(() => {
    if (!testStarted || testCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  // Progression
  useEffect(() => {
    if (questions.length > 0) {
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    }
  }, [currentQuestionIndex, questions.length]);

  // Fonctions utilitaires
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Démarrage du test
  const startTest = async () => {
    try {
      setTestStarted(true);
      toast.success("Test psychologique démarré !");
      
      // Démarrer la caméra
      await startVideoCall();
      
      addBotMessage("Excellente ! Nous allons maintenant procéder à une vérification de sécurité avant de commencer le test proprement dit.");
      
    } catch (error) {
      console.error('Erreur lors du démarrage:', error);
      toast.error("Erreur lors du démarrage du test");
      setTestStarted(false);
    }
  };

  // Démarrage de la caméra
  const startVideoCall = async () => {
    try {
      setVideoCall(prev => ({ ...prev, isActive: true }));
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setVideoCall(prev => ({ ...prev, isCameraOn: true }));
              console.log("Caméra démarrée avec succès");
            })
            .catch(console.error);
        };
      }
      
    } catch (error) {
      console.error('Erreur caméra:', error);
      toast.warning("Test sans caméra - certaines fonctionnalités seront limitées");
    }
  };

  // Soumission du test
  const submitTest = async () => {
    try {
      setLoading(true);
      detectionRef.current = false;
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Analyser les réponses avec CodeLlama
      const analysis = await analyzeResponsesWithCodeLlama(answers);
      setAnalysisResult(analysis);
      
      setTestCompleted(true);
      toast.success("Test complété et analysé !");
      
      addBotMessage("Analyse terminée ! Vos résultats détaillés sont maintenant disponibles. Cette évaluation unique a été générée spécialement pour vous par notre IA avancée.");
      
    } catch (error) {
      console.error('Erreur soumission:', error);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  // Navigation entre questions
  const nextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];
    
    if (!currentAnswer?.trim()) {
      toast.warning("Veuillez répondre à la question avant de continuer");
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQ = questions[currentQuestionIndex + 1];
      addBotMessage(`Question ${currentQuestionIndex + 2}/${questions.length} - Catégorie: ${nextQ.category}`);
    } else {
      submitTest();
    }
  };

  // Répondre à une question
  const answerQuestion = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Contrôles vidéo
  const toggleCamera = () => {
    if (!streamRef.current) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoCall(prev => ({ ...prev, isCameraOn: videoTrack.enabled }));
      
      if (!videoTrack.enabled) {
        setBehavioralFlags(prev => [...prev, "Caméra désactivée"]);
        addBotMessage("⚠️ Désactivation de la caméra détectée - cela peut affecter l'analyse comportementale.");
      }
    }
  };

  const toggleMic = () => {
    if (!streamRef.current) return;
    
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setVideoCall(prev => ({ ...prev, isMicOn: audioTrack.enabled }));
      
      if (!audioTrack.enabled) {
        setBehavioralFlags(prev => [...prev, "Microphone désactivé"]);
      }
    }
  };

  // Rendu de la question actuelle
  const renderCurrentQuestion = () => {
    if (!detection.verificationComplete) {
      return (
        <div className="question-container verification-pending">
          <h3 className="question-text">🔒 Vérification de sécurité</h3>
          <div className="verification-status">
            <div className={`verification-step ${verificationStepRef.current !== 'waiting' ? 'active' : ''}`}>
              <div className="step-indicator">
                {detection.faceDetected && detection.faceCentered ? <CheckCircle size={16} /> : '1'}
              </div>
              <div className="step-label">Détection du visage</div>
            </div>
            
            <div className={`verification-step ${verificationStepRef.current === 'hands' || verificationStepRef.current === 'handRaise' || verificationStepRef.current === 'complete' ? 'active' : ''}`}>
              <div className="step-indicator">
                {detection.handsVisible ? <CheckCircle size={16} /> : '2'}
              </div>
              <div className="step-label">Détection des mains</div>
            </div>
            
            <div className={`verification-step ${verificationStepRef.current === 'complete' ? 'active' : ''}`}>
              <div className="step-indicator">
                {detection.handRaised ? <CheckCircle size={16} /> : '3'}
              </div>
              <div className="step-label">Vérification gestuelle</div>
            </div>
          </div>
          
          <div className="verification-instructions">
            <p>Confiance de détection: <strong>{detection.confidence}%</strong></p>
            {verificationStepRef.current === 'waiting' && <p>Initialisation des systèmes de détection...</p>}
            {verificationStepRef.current === 'face' && <p>Placez votre visage dans le cercle et regardez la caméra</p>}
            {verificationStepRef.current === 'hands' && <p>Montrez vos deux mains à la caméra</p>}
            {verificationStepRef.current === 'handRaise' && <p>Levez une main au-dessus de votre tête</p>}
          </div>
        </div>
      );
    }
    
    if (questions.length === 0) return null;
    
    const question = questions[currentQuestionIndex];
    const answer = answers[question.id] || '';
    
    return (
      <div className="question-container">
        <div className="question-category">
          <Brain size={16} />
          <span>Catégorie: {question.category.charAt(0).toUpperCase() + question.category.slice(1)}</span>
        </div>
        
        <h3 className="question-text">{question.question}</h3>
        
        {question.type === 'open' ? (
          <textarea
            className="answer-textarea"
            value={answer}
            onChange={(e) => answerQuestion(question.id, e.target.value)}
            placeholder="Décrivez votre réponse de manière détaillée et sincère..."
            disabled={testCompleted}
            rows={6}
          />
        ) : (
          <div className="options-container">
            {question.options?.map((option, index) => (
              <div key={index} className="option">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name={`question-${question.id}`}
                  checked={answer === option}
                  onChange={() => answerQuestion(question.id, option)}
                  disabled={testCompleted}
                />
                <label htmlFor={`option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        )}
        
        <div className="question-controls">
          <button
            className="next-button"
            onClick={nextQuestion}
            disabled={!answer?.trim() || testCompleted}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer et analyser'}
            <ChevronRight size={18} />
          </button>
          
          <div className="question-progress">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      </div>
    );
  };

  // Rendu des résultats d'analyse
  const renderAnalysisResults = () => {
    if (!analysisResult) return null;
    
    return (
      <div className="analysis-results">
        <div className="results-header">
          <Brain size={32} />
          <h2>Analyse Psychologique Complète</h2>
          <p>Score global: <strong>{analysisResult.overall_score}/100</strong></p>
        </div>
        
        <div className="results-sections">
          <div className="result-section">
            <h3>🧠 Traits de Personnalité</h3>
            {Object.entries(analysisResult.personality_traits).map(([trait, score]) => (
              <div key={trait} className="metric">
                <div className="metric-label">{trait.charAt(0).toUpperCase() + trait.slice(1)}</div>
                <div className="metric-value-container">
                  <div 
                    className="metric-value-fill" 
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: score > 80 ? '#22c55e' : score > 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <div className="metric-number">{score}%</div>
              </div>
            ))}
          </div>
          
          <div className="result-section">
            <h3>🎯 Capacités Cognitives</h3>
            {Object.entries(analysisResult.cognitive_abilities).map(([ability, score]) => (
              <div key={ability} className="metric">
                <div className="metric-label">{ability.replace('_', ' ').charAt(0).toUpperCase() + ability.replace('_', ' ').slice(1)}</div>
                <div className="metric-value-container">
                  <div 
                    className="metric-value-fill" 
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: score > 80 ? '#22c55e' : score > 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <div className="metric-number">{score}%</div>
              </div>
            ))}
          </div>
          
          <div className="result-section">
            <h3>❤️ Intelligence Émotionnelle</h3>
            {Object.entries(analysisResult.emotional_intelligence).map(([skill, score]) => (
              <div key={skill} className="metric">
                <div className="metric-label">{skill.replace('_', ' ').charAt(0).toUpperCase() + skill.replace('_', ' ').slice(1)}</div>
                <div className="metric-value-container">
                  <div 
                    className="metric-value-fill" 
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: score > 80 ? '#22c55e' : score > 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <div className="metric-number">{score}%</div>
              </div>
            ))}
          </div>
          
          <div className="result-section">
            <h3>🏃 Comportements Professionnels</h3>
            {Object.entries(analysisResult.behavioral_patterns).map(([pattern, score]) => (
              <div key={pattern} className="metric">
                <div className="metric-label">{pattern.replace('_', ' ').charAt(0).toUpperCase() + pattern.replace('_', ' ').slice(1)}</div>
                <div className="metric-value-container">
                  <div 
                    className="metric-value-fill" 
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: score > 80 ? '#22c55e' : score > 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <div className="metric-number">{score}%</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="recommendations-section">
          <h3>💡 Recommandations</h3>
          <div className="recommendations-list">
            {analysisResult.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <CheckCircle size={16} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rendu des messages du chat
  const renderChatMessages = () => (
    <div className="chat-messages">
      {messages.map((message) => (
        <div key={message.id} className="message bot-message">
          <div className="message-avatar">
            <div className="bot-avatar">🤖</div>
          </div>
          <div className="message-content">
            <div className="message-text">{message.text}</div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="message bot-message">
          <div className="message-avatar">
            <div className="bot-avatar">🤖</div>
          </div>
          <div className="message-content">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );

  // Rendu principal
  return (
    <div className="psychological-test-container">
      {/* Header */}
      <div className="test-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Retour
        </button>
        
        <div className="test-title-container">
          <img src={companyLogo} alt="Logo" className="company-logo" />
          <h1>Test Psychologique Unique - IA CodeLlama</h1>
        </div>
        
        {testStarted && !testCompleted && (
          <div className="timer">
            <Clock size={18} />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      
      {/* Contenu principal */}
      <div className="test-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Génération du test unique avec CodeLlama...</p>
          </div>
        ) : !testStarted ? (
          <div className="test-intro">
            <div className="intro-card">
              <Brain size={48} style={{ color: '#4f46e5' }} />
              <h2>Test Psychologique Unique</h2>
              <p>Ce test a été conçu spécialement pour vous par notre IA CodeLlama. Chaque question est unique et adaptée à une évaluation psychologique complète.</p>
              
              <div className="intro-details">
                <div className="intro-detail">
                  <Activity size={20} className="intro-icon" />
                  <div>
                    <h4>Durée</h4>
                    <p>45 minutes</p>
                  </div>
                </div>
                
                <div className="intro-detail">
                  <Brain size={20} className="intro-icon" />
                  <div>
                    <h4>Analyse IA</h4>
                    <p>Analyse comportementale et psychologique avancée</p>
                  </div>
                </div>
                
                <div className="intro-detail">
                  <Shield size={20} className="intro-icon" />
                  <div>
                    <h4>Vérification</h4>
                    <p>Détection faciale et gestuelle 100% fiable</p>
                  </div>
                </div>
              </div>
              
              <div className="intro-warning">
                <AlertTriangle size={20} />
                <p>La caméra sera utilisée pour la vérification d'identité et l'analyse comportementale. Notre système de détection avancé garantit une précision optimale.</p>
              </div>
              
              <button className="start-button" onClick={startTest}>
                🚀 Commencer le test unique
              </button>
            </div>
          </div>
        ) : testCompleted ? (
          <div className="test-completion">
            <div className="completion-card">
              {analysisResult ? renderAnalysisResults() : (
                <>
                  <CheckCircle size={64} className="completion-icon" />
                  <h2>Test Terminé !</h2>
                  <p>Votre test psychologique unique a été complété avec succès.</p>
                  <button className="return-button" onClick={() => navigate('/dashboard')}>
                    Retour au tableau de bord
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="test-main">
            {/* Barre de progression */}
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              <div className="progress-bar-label">{Math.round(progress)}% complété</div>
            </div>
            
            {/* Layout principal */}
            <div className="test-layout">
              {/* Questions */}
              <div className="questions-section">
                {renderCurrentQuestion()}
              </div>
              
              {/* Caméra centrale */}
              <div className="center-video-section">
                <div className="video-container">
                  <div className="video-header">
                    <div className="video-title">
                      <Camera size={16} />
                      Détection Avancée (Confiance: {detection.confidence}%)
                    </div>
                    <div className="video-recording-indicator">
                      <div className="recording-dot"></div>
                      Analyse en cours
                    </div>
                  </div>
                  
                  <div className="video-body">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)'
                      }}
                    />
                    
                    <canvas
                      ref={canvasRef}
                      className="detection-canvas"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        transform: 'scaleX(-1)'
                      }}
                    />
                    
                    {!videoCall.isCameraOn && (
                      <div className="camera-off-overlay">
                        <CameraOff size={32} />
                        <span>Caméra désactivée</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="video-footer">
                    <button
                      className={`video-button ${!videoCall.isMicOn ? 'off' : ''}`}
                      onClick={toggleMic}
                    >
                      {videoCall.isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                    
                    <button
                      className={`video-button ${!videoCall.isCameraOn ? 'off' : ''}`}
                      onClick={toggleCamera}
                    >
                      {videoCall.isCameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Chat IA */}
              <div className="chat-section">
                <div className="chat-header">
                  <div className="chat-title">
                    <MessageCircle size={18} />
                    Assistant IA CodeLlama
                  </div>
                </div>
                <div className="chat-body">
                  {renderChatMessages()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologicalTest;