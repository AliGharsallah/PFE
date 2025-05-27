// controllers/psychologicalTestController.js
const PsychologicalTest = require('../models/PsychologicalTest');
const TechnicalTest = require('../models/TechnicalTest');
const Application = require('../models/Application');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');

// ================================
// QUESTIONS PAR DÉFAUT AMÉLIORÉES
// ================================

const getDefaultQuestions = () => {
  const questionPools = {
    linguistic: [
      {
        id: 'ling_1',
        question: "Décrivez en détail votre approche pour résoudre un problème complexe au travail. Expliquez votre processus de réflexion étape par étape.",
        category: 'linguistic',
        difficulty: 'medium'
      },
      {
        id: 'ling_2',
        question: "Racontez-moi une situation où vous avez dû expliquer un concept technique complexe à quelqu'un sans background technique. Comment vous y êtes-vous pris ?",
        category: 'linguistic',
        difficulty: 'hard'
      },
      {
        id: 'ling_3',
        question: "Décrivez votre méthode de priorisation des tâches. Donnez des exemples concrets de votre organisation quotidienne.",
        category: 'linguistic',
        difficulty: 'easy'
      },
      {
        id: 'ling_4',
        question: "Comment présentez-vous une idée innovante à votre équipe ? Décrivez votre stratégie de communication.",
        category: 'linguistic',
        difficulty: 'medium'
      }
    ],
    stress: [
      {
        id: 'stress_1',
        question: "Vous apprenez 10 minutes avant une présentation cruciale que votre ordinateur est en panne et vos données perdues. Quelle est votre réaction immédiate et votre plan d'action ?",
        category: 'stress',
        difficulty: 'hard'
      },
      {
        id: 'stress_2',
        question: "Vous avez 3 projets urgents à livrer le même jour, mais votre équipe tombe malade. Comment gérez-vous cette situation critique ?",
        category: 'stress',
        difficulty: 'hard'
      },
      {
        id: 'stress_3',
        question: "Un client important vous contacte en colère à 18h un vendredi, menaçant d'annuler son contrat. Que faites-vous dans l'immédiat ?",
        category: 'stress',
        difficulty: 'medium'
      },
      {
        id: 'stress_4',
        question: "Votre budget projet vient d'être coupé de 50% à mi-parcours. Comment réagissez-vous et que dites-vous à votre équipe ?",
        category: 'stress',
        difficulty: 'hard'
      }
    ],
    emotional: [
      {
        id: 'emot_1',
        question: "Parlez-moi d'une fois où vous avez ressenti une forte frustration au travail. Comment avez-vous géré vos émotions et quelle leçon en avez-vous tirée ?",
        category: 'emotional',
        difficulty: 'medium'
      },
      {
        id: 'emot_2',
        question: "Décrivez une situation où vous avez dû faire preuve d'empathie avec un collègue en difficulté. Comment avez-vous abordé la situation ?",
        category: 'emotional',
        difficulty: 'medium'
      },
      {
        id: 'emot_3',
        question: "Comment gérez-vous les critiques négatives ? Donnez-moi un exemple récent et votre réaction émotionnelle.",
        category: 'emotional',
        difficulty: 'easy'
      },
      {
        id: 'emot_4',
        question: "Racontez-moi un moment où vous avez dû motiver une équipe démotivée. Quelle approche émotionnelle avez-vous utilisée ?",
        category: 'emotional',
        difficulty: 'medium'
      }
    ],
    personality: [
      {
        id: 'pers_1',
        question: "Décrivez votre style de leadership avec des exemples concrets. Comment motivez-vous et dirigez-vous une équipe ?",
        category: 'personality',
        difficulty: 'medium'
      },
      {
        id: 'pers_2',
        question: "Parlez-moi de vos valeurs professionnelles fondamentales. Comment les appliquez-vous dans votre travail quotidien ?",
        category: 'personality',
        difficulty: 'easy'
      },
      {
        id: 'pers_3',
        question: "Dans quel type d'environnement de travail êtes-vous le plus productif ? Décrivez votre cadre idéal et pourquoi.",
        category: 'personality',
        difficulty: 'easy'
      },
      {
        id: 'pers_4',
        question: "Comment équilibrez-vous prise de risque et prudence dans vos décisions professionnelles ? Donnez des exemples.",
        category: 'personality',
        difficulty: 'medium'
      }
    ]
  };

  // Sélectionner une question aléatoire de chaque catégorie + 2 supplémentaires
  const selectedQuestions = [];
  
  Object.keys(questionPools).forEach(category => {
    const pool = questionPools[category];
    const randomIndex = Math.floor(Math.random() * pool.length);
    selectedQuestions.push({ ...pool[randomIndex] });
  });

  // Ajouter 2 questions supplémentaires aléatoires pour avoir 6 questions au total
  const allQuestions = Object.values(questionPools).flat();
  for (let i = 0; i < 2; i++) {
    let randomQuestion;
    do {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      randomQuestion = allQuestions[randomIndex];
    } while (selectedQuestions.some(q => q.id === randomQuestion.id));
    
    selectedQuestions.push({ ...randomQuestion });
  }

  console.log(`✅ ${selectedQuestions.length} questions sélectionnées:`);
  selectedQuestions.forEach((q, i) => {
    console.log(`  ${i+1}. [${q.category}/${q.difficulty}] ${q.question.substring(0, 50)}...`);
  });

  return selectedQuestions;
};

// ================================
// CRÉER UN TEST PSYCHOLOGIQUE
// ================================
const createPsychologicalTest = async (req, res) => {
  // ✅ AJOUT: Logs de debug complets
  console.log('🎯 === DEBUG ROUTE createPsychologicalTest ===');
  console.log('📍 URL complète:', req.originalUrl);
  console.log('📋 Method:', req.method);
  console.log('📦 Params:', req.params);
  console.log('👤 User:', req.user);
  console.log('🎯 === FIN DEBUG ===');
  
  const { technicalTestId } = req.params;
  const userId = req.user.userId;

  try {
    console.log(`🧠 Création test psychologique pour test technique ${technicalTestId}`);

    // Vérifier que le test technique existe et appartient au candidat
    const technicalTest = await TechnicalTest.findById(technicalTestId)
      .populate('application')  // ✅ CORRIGÉ: minuscule
      .populate('job');

    if (!technicalTest) {
      throw new NotFoundError('Test technique non trouvé');
    }

    if (technicalTest.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé à ce test technique');
    }

    // Vérifier que le test technique est complété
    if (technicalTest.status !== 'completed') {
      throw new BadRequestError('Le test technique doit être complété avant le test psychologique');
    }

    // Vérifier qu'un test psychologique n'existe pas déjà
    const existingPsychTest = await PsychologicalTest.findOne({ 
      technicalTest: technicalTestId 
    });

    if (existingPsychTest) {
      console.log('⚠️ Test psychologique existant trouvé, retour des informations');
      
      // Préparer les questions pour le frontend
      const safeQuestions = existingPsychTest.questions.map(q => ({
        _id: q.id,
        questionText: q.question,
        category: q.category,
        difficulty: q.difficulty
      }));

      return res.status(StatusCodes.OK).json({
        testId: existingPsychTest._id,
        status: existingPsychTest.status,
        questions: safeQuestions,
        message: 'Test psychologique déjà créé'
      });
    }

    // Générer les questions
    const questions = getDefaultQuestions();
    console.log(`📝 ${questions.length} questions générées`);

    // Créer le test psychologique avec les données comportementales initiales
    const psychologicalTest = await PsychologicalTest.create({
      technicalTest: technicalTest._id,
      application: technicalTest.application._id,  // ✅ Accès correct
      candidate: userId,
      job: technicalTest.job._id,
      questions: questions,
      status: 'created',
      // ✅ AJOUT: Données comportementales initiales requises
      behavioralData: {
        testDuration: 0, // Sera mis à jour lors de la complétion
        securityViolations: 0,
        handDetectionTime: 0,
        cameraInterruptions: 0,
        faceDetectionTime: 0,
        totalSpeakingTime: 0,
        averageResponseTime: 0,
        pausesCount: 0,
        attentionScore: 100,
        emotionalState: 'neutral',
        behavioralFlags: []
      }
    });

    console.log('✅ Test psychologique créé:', psychologicalTest._id);

    // Préparer les questions pour le frontend
    const safeQuestions = questions.map(q => ({
      _id: q.id,
      questionText: q.question,
      category: q.category,
      difficulty: q.difficulty
    }));

    res.status(StatusCodes.CREATED).json({
      testId: psychologicalTest._id,
      questions: safeQuestions,
      status: psychologicalTest.status,
      message: 'Test psychologique créé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur création test psychologique:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors de la création du test psychologique'
    });
  }
};

// ================================
// RÉCUPÉRER UN TEST PSYCHOLOGIQUE
// ================================

const getPsychologicalTest = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.userId;

  try {
    console.log(`📖 Récupération test psychologique ${testId}`);

    const test = await PsychologicalTest.findById(testId);
    
    if (!test) {
      throw new NotFoundError('Test psychologique non trouvé');
    }

    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }

    // Préparer les questions pour le frontend
    const safeQuestions = test.questions.map(q => ({
      _id: q.id,
      questionText: q.question,
      category: q.category,
      difficulty: q.difficulty
    }));

    console.log(`✅ Test récupéré avec ${safeQuestions.length} questions`);

    res.status(StatusCodes.OK).json({
      testId: test._id,
      questions: safeQuestions,
      status: test.status,
      startedAt: test.startedAt,
      completedAt: test.completedAt
    });

  } catch (error) {
    console.error('❌ Erreur récupération test:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors de la récupération du test'
    });
  }
};

// ================================
// DÉMARRER UN TEST PSYCHOLOGIQUE
// ================================

const startPsychologicalTest = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.userId;

  try {
    console.log(`▶️ Démarrage test psychologique ${testId}`);

    const test = await PsychologicalTest.findById(testId);
    
    if (!test) {
      throw new NotFoundError('Test psychologique non trouvé');
    }

    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }

    if (test.status === 'completed') {
      throw new BadRequestError('Ce test a déjà été complété');
    }

    if (test.status === 'in_progress') {
      return res.status(StatusCodes.OK).json({
        message: 'Test déjà en cours',
        startedAt: test.startedAt
      });
    }

    // Démarrer le test
    test.status = 'in_progress';
    test.startedAt = new Date();
    await test.save();

    console.log('✅ Test psychologique démarré');

    res.status(StatusCodes.OK).json({
      message: 'Test psychologique démarré',
      startedAt: test.startedAt
    });

  } catch (error) {
    console.error('❌ Erreur démarrage test:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors du démarrage du test'
    });
  }
};

// ================================
// ANALYSE VOCALE AMÉLIORÉE
// ================================

const analyzeVoiceResponse = (transcript, duration, category) => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      speechRate: 0,
      emotionalTone: 'neutral',
      linguisticComplexity: 0,
      coherenceScore: 0,
      totalWords: 0
    };
  }

  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const speechRate = duration > 0 ? Math.round((totalWords / duration) * 60) : 0;

  // Indicateurs de stress
  const stressWords = ['euh', 'hmm', 'donc', 'voilà', 'bon', 'ben', 'enfin', 'comment dire'];
  const stressCount = stressWords.reduce((count, word) => 
    count + (transcript.toLowerCase().split(word).length - 1), 0
  );

  // Complexité linguistique
  const complexWords = words.filter(word => word.length > 7).length;
  const linguisticComplexity = totalWords > 0 ? (complexWords / totalWords) * 100 : 0;

  // Analyse émotionnelle basique
  const positiveWords = ['bon', 'bien', 'excellent', 'parfait', 'réussi', 'succès', 'satisfait', 'heureux'];
  const negativeWords = ['difficile', 'problème', 'échec', 'erreur', 'mauvais', 'frustrant', 'stress'];
  
  const positiveCount = positiveWords.reduce((count, word) => 
    count + (transcript.toLowerCase().split(word).length - 1), 0
  );
  const negativeCount = negativeWords.reduce((count, word) => 
    count + (transcript.toLowerCase().split(word).length - 1), 0
  );

  // Indicateurs de confiance
  const confidenceWords = ['je pense', 'je crois', 'je suis sûr', 'certainement', 'évidemment'];
  const hesitationWords = ['peut-être', 'je ne sais pas', 'difficile à dire', 'ça dépend'];
  
  const confidenceCount = confidenceWords.reduce((count, phrase) => 
    count + (transcript.toLowerCase().split(phrase).length - 1), 0
  );
  const hesitationCount = hesitationWords.reduce((count, phrase) => 
    count + (transcript.toLowerCase().split(phrase).length - 1), 0
  );

  // Déterminer le ton émotionnel
  let emotionalTone = 'neutral';
  if (stressCount > 5 || negativeCount > positiveCount + 2) {
    emotionalTone = 'stressed';
  } else if (speechRate > 180 || confidenceCount > hesitationCount) {
    emotionalTone = 'confident';
  } else if (speechRate < 90 || hesitationCount > confidenceCount || negativeCount > positiveCount) {
    emotionalTone = 'hesitant';
  } else if (positiveCount > 0 && speechRate >= 120) {
    emotionalTone = 'confident';
  }

  // Score de cohérence (basé sur la longueur, structure et catégorie)
  const sentenceCount = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentenceCount > 0 ? totalWords / sentenceCount : 0;
  
  let coherenceScore = 0;
  
  // Points pour la longueur appropriée
  if (totalWords >= 30) coherenceScore += 30; // Réponse substantielle
  else coherenceScore += (totalWords / 30) * 30;
  
  // Points pour la structure des phrases
  if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) coherenceScore += 30;
  else if (avgWordsPerSentence > 0) coherenceScore += 15;
  
  // Points pour la complexité linguistique
  if (linguisticComplexity >= 15 && linguisticComplexity <= 40) coherenceScore += 25;
  else if (linguisticComplexity > 0) coherenceScore += 10;
  
  // Points bonus selon la catégorie
  if (category === 'linguistic' && linguisticComplexity > 30) coherenceScore += 15;
  if (category === 'stress' && speechRate > 100) coherenceScore += 10;
  if (category === 'emotional' && (positiveCount > 0 || negativeCount > 0)) coherenceScore += 10;
  if (category === 'personality' && totalWords > 40) coherenceScore += 10;

  coherenceScore = Math.min(100, Math.max(0, coherenceScore));

  return {
    speechRate: Math.max(0, speechRate),
    emotionalTone,
    linguisticComplexity: Math.round(Math.max(0, Math.min(100, linguisticComplexity))),
    coherenceScore: Math.round(coherenceScore),
    totalWords
  };
};

// ================================
// ANALYSE COMPLÈTE DES RÉSULTATS
// ================================

const analyzeTestResults = (answers, behavioralData) => {
  console.log('🤖 Analyse complète des résultats du test psychologique...');

  // Extraire les analyses vocales
  const voiceMetrics = Array.from(answers.values()).map(answer => answer.analysis);
  const totalQuestions = answers.size;

  // Calculs des métriques vocales moyennes
  const avgSpeechRate = voiceMetrics.reduce((sum, m) => sum + m.speechRate, 0) / voiceMetrics.length;
  const avgComplexity = voiceMetrics.reduce((sum, m) => sum + m.linguisticComplexity, 0) / voiceMetrics.length;
  const avgCoherence = voiceMetrics.reduce((sum, m) => sum + m.coherenceScore, 0) / voiceMetrics.length;
  const totalWords = voiceMetrics.reduce((sum, m) => sum + m.totalWords, 0);

  // Analyse des tons émotionnels
  const emotionalTones = voiceMetrics.map(m => m.emotionalTone);
  const stressedCount = emotionalTones.filter(t => t === 'stressed').length;
  const confidentCount = emotionalTones.filter(t => t === 'confident').length;
  const hesitantCount = emotionalTones.filter(t => t === 'hesitant').length;
  const neutralCount = emotionalTones.filter(t => t === 'neutral').length;

  // Calculs des traits de personnalité (Big Five adaptés)
  const emotionalStability = Math.max(0, 100 - (stressedCount / totalQuestions) * 100);
  const confidence = (confidentCount / totalQuestions) * 100;
  const extraversionScore = Math.min(100, (avgSpeechRate / 150) * 100);
  const conscientiousnessScore = Math.min(100, avgCoherence);
  const opennessScore = Math.min(100, avgComplexity * 2);

  // Calculs des capacités cognitives
  const problemSolvingScore = Math.min(100, (avgComplexity * 1.2 + avgCoherence * 0.8) / 2);
  const analyticalScore = Math.min(100, avgCoherence);
  const creativityScore = Math.min(100, opennessScore * 0.9 + (totalWords / totalQuestions / 50) * 20);
  const attentionScore = Math.max(0, 100 - (behavioralData.securityViolations || 0) * 15);

  // Scores d'intelligence émotionnelle
  const selfAwarenessScore = Math.min(100, emotionalStability + (confidence * 0.3));
  const empathyScore = Math.min(100, (avgCoherence + (100 - (stressedCount / totalQuestions) * 100)) / 2);
  const socialSkillsScore = Math.min(100, extraversionScore);
  const emotionalRegulationScore = Math.min(100, emotionalStability);

  // Patterns comportementaux
  const leadershipScore = Math.min(100, (confidence + conscientiousnessScore + extraversionScore) / 3);
  const teamCollaborationScore = Math.min(100, (extraversionScore + conscientiousnessScore + empathyScore) / 3);
  const stressManagementScore = Math.min(100, emotionalStability);
  const adaptabilityScore = Math.min(100, opennessScore + (confidence * 0.5));

  return {
    personality_traits: {
      openness: Math.round(opennessScore),
      conscientiousness: Math.round(conscientiousnessScore),
      extraversion: Math.round(extraversionScore),
      agreeableness: Math.round((empathyScore + teamCollaborationScore) / 2),
      neuroticism: Math.round(100 - emotionalStability)
    },
    cognitive_abilities: {
      problem_solving: Math.round(problemSolvingScore),
      analytical_thinking: Math.round(analyticalScore),
      creativity: Math.round(creativityScore),
      attention_to_detail: Math.round(attentionScore)
    },
    emotional_intelligence: {
      self_awareness: Math.round(selfAwarenessScore),
      empathy: Math.round(empathyScore),
      social_skills: Math.round(socialSkillsScore),
      emotional_regulation: Math.round(emotionalRegulationScore)
    },
    behavioral_patterns: {
      leadership_potential: Math.round(leadershipScore),
      team_collaboration: Math.round(teamCollaborationScore),
      stress_management: Math.round(stressManagementScore),
      adaptability: Math.round(adaptabilityScore)
    },
    vocal_patterns: {
      average_speech_rate: Math.round(avgSpeechRate),
      emotional_stability: Math.round(emotionalStability),
      linguistic_sophistication: Math.round(avgComplexity),
      response_coherence: Math.round(avgCoherence),
      stress_indicators: Math.round((stressedCount / totalQuestions) * 100)
    },
    overall_score: 0, // Sera calculé par la méthode du modèle
    recommendations: generateRecommendations(avgSpeechRate, avgComplexity, emotionalStability, behavioralData, voiceMetrics),
    detailed_insights: generateDetailedInsights(voiceMetrics, behavioralData, emotionalTones)
  };
};

// ================================
// GÉNÉRATION DE RECOMMANDATIONS
// ================================

const generateRecommendations = (speechRate, complexity, emotionalStability, behavioralData, voiceMetrics) => {
  const recommendations = [];

  // Recommandations basées sur le débit de parole
  if (speechRate < 80) {
    recommendations.push("Développez votre confiance en expression orale - pratiquez des présentations courtes régulièrement");
  } else if (speechRate > 200) {
    recommendations.push("Prenez le temps de ralentir votre débit de parole pour améliorer la clarté de votre communication");
  } else if (speechRate >= 120 && speechRate <= 160) {
    recommendations.push("Excellent contrôle du débit de parole - utilisez cette compétence pour diriger des réunions");
  }

  // Recommandations basées sur la complexité linguistique
  if (complexity < 15) {
    recommendations.push("Enrichissez votre vocabulaire professionnel en lisant des articles spécialisés dans votre domaine");
  } else if (complexity > 50) {
    recommendations.push("Excellente maîtrise du vocabulaire - considérez des rôles de formation ou de mentorat");
  }

  // Recommandations basées sur la stabilité émotionnelle
  if (emotionalStability < 50) {
    recommendations.push("Développez des techniques de gestion du stress comme la méditation ou la respiration profonde");
  } else if (emotionalStability > 85) {
    recommendations.push("Votre stabilité émotionnelle est exceptionnelle - considérez des rôles de leadership en situation de crise");
  }

  // Recommandations basées sur les violations de sécurité
  const violations = behavioralData.securityViolations || 0;
  if (violations > 5) {
    recommendations.push("Travaillez sur votre concentration et discipline - pratiquez des exercices d'attention soutenue");
  } else if (violations === 0) {
    recommendations.push("Discipline exemplaire - votre capacité à suivre les instructions est un atout majeur");
  }

  // Recommandations basées sur la cohérence des réponses
  const avgCoherence = voiceMetrics.reduce((sum, m) => sum + m.coherenceScore, 0) / voiceMetrics.length;
  if (avgCoherence > 80) {
    recommendations.push("Excellente structuration de pensée - idéal pour des rôles de planification stratégique");
  } else if (avgCoherence < 50) {
    recommendations.push("Travaillez sur la structuration de vos idées - pratiquez l'art de raconter des histoires");
  }

  // Recommandation générale si aucune spécifique
  if (recommendations.length === 0) {
    recommendations.push("Profil équilibré - continuez à développer vos points forts tout en restant ouvert aux opportunités d'amélioration");
  }

  // Limiter à 4 recommandations maximum
  return recommendations.slice(0, 4);
};

// ================================
// GÉNÉRATION D'INSIGHTS DÉTAILLÉS
// ================================

const generateDetailedInsights = (voiceMetrics, behavioralData, emotionalTones) => {
  const insights = [];

  // Analyse de la progression dans le test
  if (voiceMetrics.length > 2) {
    const firstThird = voiceMetrics.slice(0, Math.ceil(voiceMetrics.length / 3));
    const lastThird = voiceMetrics.slice(-Math.ceil(voiceMetrics.length / 3));

    const firstAvgRate = firstThird.reduce((sum, m) => sum + m.speechRate, 0) / firstThird.length;
    const lastAvgRate = lastThird.reduce((sum, m) => sum + m.speechRate, 0) / lastThird.length;

    if (lastAvgRate > firstAvgRate * 1.3) {
      insights.push({
        category: 'Progression',
        insight: 'Amélioration notable du débit de parole au cours du test, excellent indicateur d\'adaptabilité et de montée en confiance',
        confidence: 88
      });
    } else if (lastAvgRate < firstAvgRate * 0.7) {
      insights.push({
        category: 'Endurance',
        insight: 'Diminution du débit de parole en fin de test, possibles signes de fatigue mentale ou de concentration décroissante',
        confidence: 82
      });
    }
  }

  // Analyse des patterns émotionnels
  const stressedCount = emotionalTones.filter(t => t === 'stressed').length;
  const confidentCount = emotionalTones.filter(t => t === 'confident').length;
  const totalResponses = emotionalTones.length;

  if (confidentCount > stressedCount * 2) {
    insights.push({
      category: 'Confiance',
      insight: 'Maintien d\'un ton confiant tout au long du test, excellente maîtrise émotionnelle sous pression',
      confidence: 92
    });
  } else if (stressedCount > confidentCount * 2) {
    insights.push({
      category: 'Gestion du stress',
      insight: 'Tendance à montrer des signes de stress vocal, bénéficierait de techniques de relaxation avant les présentations',
      confidence: 85
    });
  }

  // Analyse comportementale
  const violations = behavioralData.securityViolations || 0;
  if (violations === 0) {
    insights.push({
      category: 'Discipline',
      insight: 'Respect parfait des consignes de sécurité, indicateur fort de discipline et d\'attention aux détails',
      confidence: 98
    });
  } else if (violations > 3) {
    insights.push({
      category: 'Attention',
      insight: 'Plusieurs infractions aux consignes détectées, suggère une tendance à la distraction sous pression',
      confidence: 90
    });
  }

  // Analyse de la richesse linguistique
  const avgComplexity = voiceMetrics.reduce((sum, m) => sum + m.linguisticComplexity, 0) / voiceMetrics.length;
  const avgWords = voiceMetrics.reduce((sum, m) => sum + m.totalWords, 0) / voiceMetrics.length;

  if (avgComplexity > 40 && avgWords > 60) {
    insights.push({
      category: 'Communication',
      insight: 'Excellent niveau de sophistication linguistique et richesse d\'expression, idéal pour des rôles de communication complexe',
      confidence: 94
    });
  } else if (avgComplexity < 15 && avgWords < 30) {
    insights.push({
      category: 'Expression',
      insight: 'Réponses concises avec vocabulaire simple, pourrait bénéficier d\'un développement de l\'expression orale',
      confidence: 87
    });
  }

  // Analyse de la cohérence
  const avgCoherence = voiceMetrics.reduce((sum, m) => sum + m.coherenceScore, 0) / voiceMetrics.length;
  if (avgCoherence > 85) {
    insights.push({
      category: 'Structure de pensée',
      insight: 'Pensée très bien structurée et réponses cohérentes, excellente capacité de synthèse et d\'organisation',
      confidence: 91
    });
  }

  return insights.slice(0, 5); // Limiter à 5 insights maximum
};

// ================================
// FONCTIONS UTILITAIRES POUR L'ANALYSE
// ================================

const determineEmotionalState = (answers) => {
  const analyses = Array.from(answers.values()).map(a => a.analysis);
  const stressedCount = analyses.filter(a => a.emotionalTone === 'stressed').length;
  const confidentCount = analyses.filter(a => a.emotionalTone === 'confident').length;
  const hesitantCount = analyses.filter(a => a.emotionalTone === 'hesitant').length;
  const neutralCount = analyses.filter(a => a.emotionalTone === 'neutral').length;
  
  const total = analyses.length;
  
  if (stressedCount / total > 0.4) return 'stressed';
  if (confidentCount / total > 0.4) return 'confident';
  if (hesitantCount / total > 0.3) return 'anxious';
  return 'calm';
};

const calculateConcentrationLevel = (behavioralData) => {
  const baseScore = 100;
  const violations = behavioralData.securityViolations || 0;
  const interruptions = behavioralData.cameraInterruptions || 0;
  
  // Pénalités progressives
  const violationPenalty = violations * 12; // -12 points par violation
  const interruptionPenalty = interruptions * 8; // -8 points par interruption caméra
  
  return Math.max(0, Math.min(100, baseScore - violationPenalty - interruptionPenalty));
};

const calculateThinkingCompliance = (behavioralData) => {
  const expectedThinkingTime = (behavioralData.numberOfQuestions || 6) * 30; // 30s par question
  const actualComplianceTime = behavioralData.totalThinkingComplianceTime || expectedThinkingTime * 0.85;
  
  return Math.min(100, (actualComplianceTime / expectedThinkingTime) * 100);
};

const calculateAnsweringEngagement = (answers) => {
  const analyses = Array.from(answers.values()).map(a => a.analysis);
  const avgWords = analyses.reduce((sum, a) => sum + a.totalWords, 0) / analyses.length;
  const avgCoherence = analyses.reduce((sum, a) => sum + a.coherenceScore, 0) / analyses.length;
  
  // Score basé sur la richesse et la cohérence des réponses
  const wordScore = Math.min(100, (avgWords / 50) * 100); // 50 mots = score parfait
  const coherenceScore = avgCoherence;
  
  return Math.round((wordScore * 0.4 + coherenceScore * 0.6));
};

const calculateTransitionEfficiency = (behavioralData) => {
  const expectedTransitionTime = (behavioralData.numberOfQuestions || 6) * 3; // 3s par transition
  const actualTransitionTime = behavioralData.totalTransitionTime || expectedTransitionTime;
  
  if (actualTransitionTime <= expectedTransitionTime) return 100;
  
  const penalty = ((actualTransitionTime - expectedTransitionTime) / expectedTransitionTime) * 100;
  return Math.max(0, 100 - penalty);
};

// ================================
// SOUMETTRE LES RÉPONSES DU TEST
// ================================

// ================================
// SOUMETTRE LES RÉPONSES DU TEST - VERSION COMPLÈTE ET CORRIGÉE
// ================================

const submitPsychologicalTest = async (req, res) => {
  const { testId } = req.params;
  const { answers, behavioralData } = req.body;
  const userId = req.user.userId;

  try {
    // ✅ LOGS DE DEBUG COMPLETS
    console.log('🎯 === DEBUG SOUMISSION COMPLÈTE ===');
    console.log('📦 req.body:', JSON.stringify(req.body, null, 2));
    console.log('📦 req.body type:', typeof req.body);
    console.log('📦 req.body keys:', Object.keys(req.body || {}));
    console.log('📋 answers:', answers ? 'présent' : 'absent', typeof answers);
    console.log('📋 behavioralData:', behavioralData ? 'présent' : 'absent', typeof behavioralData);
    console.log('🎯 === FIN DEBUG ===');

    console.log(`📝 Soumission test psychologique ${testId}`);
    console.log('📦 Données reçues:', {
      answersCount: answers ? Object.keys(answers).length : 0,
      behavioralData: behavioralData ? 'présent' : 'absent',
      userId: userId
    });

    // ✅ AMÉLIORATION: Validation plus détaillée
    if (!answers || typeof answers !== 'object') {
      console.log('❌ Erreur: Réponses manquantes ou invalides');
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Réponses requises et doivent être un objet',
        received: typeof answers,
        bodyReceived: req.body
      });
    }

    if (!behavioralData || typeof behavioralData !== 'object') {
      console.log('❌ Erreur: Données comportementales manquantes ou invalides');
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Données comportementales requises',
        received: typeof behavioralData,
        bodyReceived: req.body
      });
    }

    const test = await PsychologicalTest.findById(testId);
    
    if (!test) {
      console.log('❌ Erreur: Test non trouvé');
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Test psychologique non trouvé'
      });
    }

    if (test.candidate.toString() !== userId) {
      console.log('❌ Erreur: Accès non autorisé');
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Accès non autorisé'
      });
    }

    if (test.status === 'completed') {
      console.log('❌ Erreur: Test déjà complété');
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Ce test a déjà été complété'
      });
    }

    // Traiter et analyser chaque réponse
    const processedAnswers = new Map();
    const questionsMap = new Map(test.questions.map(q => [q.id, q]));

    console.log('🔍 Analyse des réponses vocales...');
    console.log(`📋 Questions disponibles: ${test.questions.length}`);
    console.log(`📋 Réponses reçues: ${Object.keys(answers).length}`);

    // ✅ BOUCLE CORRIGÉE AVEC GESTION DES TRANSCRIPTS VIDES
    for (const [questionId, answerData] of Object.entries(answers)) {
      console.log(`🔍 Traitement réponse pour question ID: "${questionId}"`);
      
      const question = questionsMap.get(questionId);
      if (!question) {
        console.warn(`⚠️ Question "${questionId}" non trouvée`);
        console.warn(`📋 IDs disponibles:`, Array.from(questionsMap.keys()));
        continue;
      }

      // ✅ AMÉLIORATION: Validation des données de réponse avec defaults
      const transcript = answerData.transcript || 'Aucune transcription disponible';
      const duration = answerData.duration || 60;

      console.log(`📝 Transcript reçu pour ${questionId}: "${transcript}" (${transcript.length} chars)`);

      // Analyser la réponse vocale
      const voiceAnalysis = analyzeVoiceResponse(
        transcript,
        duration,
        question.category
      );

      processedAnswers.set(questionId, {
        transcript: transcript,
        analysis: voiceAnalysis,
        duration: duration,
        submittedAt: new Date()
      });

      console.log(`✅ Réponse analysée pour question ${questionId}: ${transcript.length} chars`);
    }

    console.log(`✅ ${processedAnswers.size} réponses analysées`);

    // ✅ VALIDATION: S'assurer qu'on a au moins une réponse
    if (processedAnswers.size === 0) {
      console.log('❌ Aucune réponse valide trouvée');
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Aucune réponse valide trouvée'
      });
    }

    // Générer l'analyse complète
    const analysisResults = analyzeTestResults(processedAnswers, behavioralData);

    // Données comportementales enrichies
    const enhancedBehavioralData = {
      // Données de base
      securityViolations: behavioralData.securityViolations || 0,
      testDuration: behavioralData.testDuration || 45,
      
      // Données de phases (nouvelles)
      totalThinkingTime: (processedAnswers.size * 30), // 30s par question
      totalAnsweringTime: (processedAnswers.size * 60), // 60s par question
      averageThinkingTime: 30,
      averageAnsweringTime: 60,
      
      // Données de surveillance
      handDetectionTime: behavioralData.handDetectionTime || 88,
      cameraInterruptions: behavioralData.cameraInterruptions || 0,
      faceDetectionTime: behavioralData.faceDetectionTime || 95,
      
      // Performance vocale
      totalSpeakingTime: Array.from(processedAnswers.values())
        .reduce((sum, answer) => sum + (answer.duration || 0), 0),
      averageResponseDelay: behavioralData.averageResponseDelay || 2,
      silencePeriods: behavioralData.silencePeriods || 0,
      
      // Engagement et attention
      attentionScore: calculateConcentrationLevel(behavioralData),
      emotionalState: determineEmotionalState(processedAnswers),
      concentrationLevel: calculateConcentrationLevel(behavioralData),
      
      // Flags comportementaux détaillés
      behavioralFlags: behavioralData.behavioralFlags || [],
      
      // Métriques par phase (nouvelles)
      phaseMetrics: {
        thinkingPhaseCompliance: calculateThinkingCompliance({
          ...behavioralData,
          numberOfQuestions: processedAnswers.size
        }),
        answeringPhaseEngagement: calculateAnsweringEngagement(processedAnswers),
        transitionEfficiency: calculateTransitionEfficiency({
          ...behavioralData,
          numberOfQuestions: processedAnswers.size
        })
      }
    };

    // Mettre à jour le test
    test.answers = processedAnswers;
    test.analysisResults = analysisResults;
    test.behavioralData = enhancedBehavioralData;
    test.status = 'completed';
    test.completedAt = new Date();

    await test.save();

    // Mettre à jour la candidature
    await Application.findByIdAndUpdate(
      test.application,
      {
        status: 'psychological_test_completed',
        psychologicalTestResults: {
          testId: test._id,
          overallScore: test.analysisResults.overall_score,
          completedAt: test.completedAt
        }
      }
    );

    console.log('✅ Test psychologique complété et candidature mise à jour');

    // Préparer un aperçu des résultats
    const personalityHighlights = test.analysisResults.personality_traits;
    const dominantTrait = Object.entries(personalityHighlights)
      .reduce((a, b) => a[1] > b[1] ? a : b);

    res.status(StatusCodes.OK).json({
      message: 'Test psychologique complété avec succès',
      overallScore: test.analysisResults.overall_score,
      completedAt: test.completedAt,
      analysisPreview: {
        personalityHighlights: {
          dominant_trait: dominantTrait[0],
          dominant_score: dominantTrait[1],
          confidence_level: test.analysisResults.vocal_patterns.emotional_stability
        },
        recommendations: test.analysisResults.recommendations.slice(0, 2),
        keyInsights: test.analysisResults.detailed_insights.slice(0, 2)
      }
    });

  } catch (error) {
    console.error('❌ Erreur soumission test psychologique:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors de la soumission du test psychologique',
      error: error.message
    });
  }
};
// ================================
// FONCTIONS UTILITAIRES POUR LES DESCRIPTIONS
// ================================

const generatePersonalityDescription = (traits) => {
  const dominant = Object.entries(traits).reduce((a, b) => a[1] > b[1] ? a : b);
  const descriptions = {
    openness: "Vous êtes ouvert aux nouvelles expériences et idées innovantes, avec une forte curiosité intellectuelle",
    conscientiousness: "Vous êtes organisé, fiable et orienté vers les objectifs, avec un sens aigu des responsabilités",
    extraversion: "Vous êtes sociable, énergique et aimez interagir avec les autres, source d'énergie dans les équipes",
    agreeableness: "Vous êtes coopératif, empathique et orienté vers l'harmonie, facilitant les relations interpersonnelles",
    neuroticism: "Vous ressentez intensément les émotions et pouvez être sensible au stress, nécessitant des stratégies de gestion"
  };
  return descriptions[dominant[0]] || "Profil équilibré avec des traits variés selon les situations";
};

const generateEIDescription = (ei) => {
  const avg = Object.values(ei).reduce((sum, val) => sum + val, 0) / Object.keys(ei).length;
  if (avg >= 85) return "Intelligence émotionnelle exceptionnelle - leadership naturel";
  if (avg >= 70) return "Bonne intelligence émotionnelle - relations interpersonnelles solides";
  if (avg >= 55) return "Intelligence émotionnelle correcte - potentiel de développement";
  if (avg >= 40) return "Intelligence émotionnelle moyenne - formation recommandée";
  return "Intelligence émotionnelle à développer prioritairement";
};

const generateVocalDescription = (vocal) => {
  const insights = [];
  if (vocal.average_speech_rate > 150) insights.push("débit dynamique et engageant");
  if (vocal.linguistic_sophistication > 60) insights.push("vocabulaire riche et précis");
  if (vocal.emotional_stability > 80) insights.push("expression stable sous pression");
  if (vocal.response_coherence > 85) insights.push("réponses très bien structurées");
  if (vocal.stress_indicators < 20) insights.push("excellente gestion du stress vocal");
  
  return insights.length > 0 ? 
    `Profil vocal ${insights.join(", ")}` : 
    "Profil vocal standard avec potentiel d'amélioration";
};

const generateCombinedAssessment = (technicalScore, psychologicalScore) => {
  const combined = (technicalScore + psychologicalScore) / 2;
  
  if (combined >= 90) return "Candidat exceptionnel - Profil technique et humain d'excellence, recommandation forte";
  if (combined >= 80) return "Excellent candidat - Compétences techniques solides et excellentes qualités relationnelles";
  if (combined >= 70) return "Très bon candidat - Bon équilibre technique-humain, potentiel de croissance";
  if (combined >= 60) return "Candidat prometteur - Points forts identifiés, accompagnement pour optimiser le potentiel";
  if (combined >= 50) return "Candidat à potentiel - Développement nécessaire, envisager formation ou mentorat";
  return "Candidat nécessitant un accompagnement significatif - évaluer l'adéquation avec le poste";
};

// ================================
// RÉCUPÉRER LES RÉSULTATS DÉTAILLÉS
// ================================

const getPsychologicalTestResults = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.userId;

  try {
    console.log(`📊 Récupération résultats test psychologique ${testId}`);

    const test = await PsychologicalTest.findById(testId)
      .populate('job', 'title description')
      .populate('technicalTest', 'score');

    if (!test) {
      throw new NotFoundError('Test psychologique non trouvé');
    }

    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }

    if (test.status !== 'completed') {
      throw new BadRequestError('Ce test n\'est pas encore complété');
    }

    // Préparer les résultats détaillés
    const results = {
      testInfo: {
        testId: test._id,
        jobTitle: test.job.title,
        completedAt: test.completedAt,
        duration: test.behavioralData.testDuration,
        overallScore: test.analysisResults.overall_score,
        questionsAnswered: test.answers.size,
        totalQuestions: test.questions.length
      },
      personalityProfile: {
        traits: test.analysisResults.personality_traits,
        dominantTrait: Object.entries(test.analysisResults.personality_traits)
          .reduce((a, b) => a[1] > b[1] ? a : b),
        description: generatePersonalityDescription(test.analysisResults.personality_traits)
      },
      cognitiveProfile: {
        abilities: test.analysisResults.cognitive_abilities,
        strengths: Object.entries(test.analysisResults.cognitive_abilities)
          .filter(([_, score]) => score >= 75)
          .map(([trait, score]) => ({ trait, score })),
        areasForImprovement: Object.entries(test.analysisResults.cognitive_abilities)
          .filter(([_, score]) => score < 55)
          .map(([trait, score]) => ({ trait, score }))
      },
      emotionalIntelligence: {
        scores: test.analysisResults.emotional_intelligence,
        summary: generateEIDescription(test.analysisResults.emotional_intelligence),
        averageScore: Math.round(
          Object.values(test.analysisResults.emotional_intelligence)
            .reduce((sum, val) => sum + val, 0) / 
          Object.keys(test.analysisResults.emotional_intelligence).length
        )
      },
      vocalAnalysis: {
        patterns: test.analysisResults.vocal_patterns,
        summary: generateVocalDescription(test.analysisResults.vocal_patterns),
        keyMetrics: {
          averageWordsPerResponse: Math.round(
            Array.from(test.answers.values())
              .reduce((sum, answer) => sum + answer.analysis.totalWords, 0) / test.answers.size
          ),
          dominantEmotionalTone: Array.from(test.answers.values())
            .map(answer => answer.analysis.emotionalTone)
            .reduce((acc, tone) => {
              acc[tone] = (acc[tone] || 0) + 1;
              return acc;
            }, {}),
          consistencyScore: test.analysisResults.vocal_patterns.response_coherence
        }
      },
      behavioralInsights: {
        patterns: test.analysisResults.behavioral_patterns,
        phaseMetrics: test.behavioralData.phaseMetrics,
        flags: test.behavioralData.behavioralFlags,
        attentionScore: test.behavioralData.attentionScore,
        concentrationLevel: test.behavioralData.concentrationLevel,
        securityCompliance: {
          violations: test.behavioralData.securityViolations,
          complianceRate: Math.max(0, 100 - (test.behavioralData.securityViolations * 10))
        }
      },
      recommendations: test.analysisResults.recommendations,
      detailedInsights: test.analysisResults.detailed_insights,
      technicalTestComparison: {
        technicalScore: test.technicalTest?.score || 0,
        psychologicalScore: test.analysisResults.overall_score,
        combinedScore: Math.round(((test.technicalTest?.score || 0) + test.analysisResults.overall_score) / 2),
        combinedAssessment: generateCombinedAssessment(
          test.technicalTest?.score || 0,
          test.analysisResults.overall_score
        )
      },
      actionPlan: {
        immediateActions: test.analysisResults.recommendations.slice(0, 2),
        developmentAreas: Object.entries({
          ...test.analysisResults.personality_traits,
          ...test.analysisResults.cognitive_abilities,
          ...test.analysisResults.emotional_intelligence,
          ...test.analysisResults.behavioral_patterns
        })
        .filter(([_, score]) => score < 60)
        .sort(([_, scoreA], [__, scoreB]) => scoreA - scoreB)
        .slice(0, 3)
        .map(([area, score]) => ({ area, score, priority: score < 40 ? 'high' : 'medium' })),
        strengths: Object.entries({
          ...test.analysisResults.personality_traits,
          ...test.analysisResults.cognitive_abilities,
          ...test.analysisResults.emotional_intelligence,
          ...test.analysisResults.behavioral_patterns
        })
        .filter(([_, score]) => score >= 80)
        .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
        .slice(0, 5)
        .map(([area, score]) => ({ area, score }))
      }
    };

    console.log('✅ Résultats détaillés préparés');

    res.status(StatusCodes.OK).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Erreur récupération résultats:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erreur lors de la récupération des résultats'
    });
  }
};

// ================================
// ENDPOINT POUR MÉTRIQUES EN TEMPS RÉEL
// ================================

const updateTestMetrics = async (req, res) => {
  const { testId } = req.params;
  const { metrics } = req.body;
  const userId = req.user.userId;

  try {
    const test = await PsychologicalTest.findById(testId);
    
    if (!test || test.candidate.toString() !== userId) {
      return res.status(404).json({ message: 'Test non trouvé' });
    }

    if (test.status === 'completed') {
      return res.status(400).json({ message: 'Test déjà complété' });
    }

    // Mise à jour des métriques en temps réel (optionnel)
    test.realtimeMetrics = {
      ...test.realtimeMetrics,
      ...metrics,
      lastUpdate: new Date()
    };

    await test.save();

    console.log(`📊 Métriques temps réel mises à jour pour test ${testId}`);

    res.status(200).json({ 
      success: true, 
      message: 'Métriques mises à jour',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour métriques:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur mise à jour métriques' 
    });
  }
};

// ================================
// FONCTION DE SANTÉ DU SERVICE
// ================================

const checkServiceHealth = async (req, res) => {
  try {
    // Vérifier la connectivité à la base de données
    const testCount = await PsychologicalTest.countDocuments();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        service: 'psychological-test-service',
        status: 'healthy',
        timestamp: new Date(),
        database: 'connected',
        totalTests: testCount,
        features: {
          voiceAnalysis: true,
          behavioralTracking: true,
          realTimeMetrics: true,
          securityMonitoring: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification santé service:', error);
    
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      success: false,
      data: {
        service: 'psychological-test-service',
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      }
    });
  }
};

// ================================
// EXPORTS
// ================================

module.exports = {
  createPsychologicalTest,
  getPsychologicalTest,
  startPsychologicalTest,
  submitPsychologicalTest,
  getPsychologicalTestResults,
  updateTestMetrics,
  checkServiceHealth
};