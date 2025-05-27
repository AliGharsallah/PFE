const TechnicalTest = require('../models/TechnicalTest');
const Application = require('../models/Application'); // ✅ Import seulement
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const { generateTechnicalTest, evaluateCodeSolution, checkOllamaAvailability } = require('../utils/aiService');

// Générer un test technique pour une candidature approuvée
const createTest = async (req, res) => {
  const { id: applicationId } = req.params;
  const userId = req.user.userId;
  
  try {
    console.log(`🚀 Création de test pour l'application ${applicationId}`);
    
    const application = await Application.findOne({ _id: applicationId })
      .populate('job');
    
    if (!application) {
      throw new NotFoundError(`Pas de candidature avec l'id ${applicationId}`);
    }
    
    // Vérifier que l'utilisateur est le candidat
    if (application.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }
    
    // Vérifier le statut de la candidature
    if (application.status !== 'approved') {
      throw new BadRequestError('Votre candidature doit être approuvée pour passer un test');
    }
    
    // Vérifier si un test existe déjà pour cette candidature
    const existingTest = await TechnicalTest.findOne({ application: applicationId });
    if (existingTest) {
      console.log('⚠️ Test existant trouvé, suppression pour régénération');
      // Supprimer l'ancien test pour en créer un nouveau
      await TechnicalTest.findByIdAndDelete(existingTest._id);
      console.log('🗑️ Ancien test supprimé');
    }
    
    // Générer un nouveau test unique
    console.log('🔥 Génération d\'un nouveau test unique');
    
    // Récupérer tous les tests existants pour éviter les doublons
    const allExistingTests = await TechnicalTest.find({
      candidate: { $ne: userId } // Exclure les tests du candidat actuel
    }).select('questions');
    
    console.log(`📊 ${allExistingTests.length} tests existants à éviter`);
    
    // Vérifier la disponibilité du service IA
    console.log('🔍 Vérification de la disponibilité d\'Ollama...');
    const isOllamaAvailable = await checkOllamaAvailability();
    console.log(`📡 Ollama disponible: ${isOllamaAvailable}`);
    
    // Générer les questions du test avec diversité
    console.log('🤖 Génération des questions techniques uniques...');
    let questions;
    let attempts = 0;
    const maxAttempts = 3;
    
    do {
      attempts++;
      console.log(`🎲 Tentative ${attempts}/${maxAttempts} de génération`);
      
      try {
        if (isOllamaAvailable) {
          questions = await generateTechnicalTest(application.job, allExistingTests, attempts);
        } else {
          questions = getDefaultQuestionsDirectly(application.job, allExistingTests, attempts);
        }
        
        // Vérifier l'unicité du test généré
        const isUnique = await isTestUnique(questions, allExistingTests);
        if (isUnique) {
          console.log(`✅ Test unique généré à la tentative ${attempts}`);
          break;
        } else {
          console.log(`⚠️ Test similaire détecté, nouvelle tentative...`);
          questions = null;
        }
        
      } catch (error) {
        console.error(`❌ Erreur génération tentative ${attempts}:`, error.message);
        questions = null;
      }
      
    } while (!questions && attempts < maxAttempts);
    
    // Fallback si aucune génération unique n'a réussi
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('⚠️ Utilisation du fallback avec questions par défaut variées');
      questions = getDefaultQuestionsDirectly(application.job, allExistingTests, Math.random());
    }
    
    console.log(`🎯 ${questions.length} questions uniques générées`);
    
    // Créer le nouveau test
    console.log('💾 Création du nouveau test en base de données...');
    const test = await TechnicalTest.create({
      job: application.job._id,
      application: applicationId,
      candidate: userId,
      questions,
      duration: application.job.testCriteria?.duration || 60,
      status: 'created'
    });
    
    // Préparer les questions sans les réponses correctes pour le candidat
    const safeQuestions = test.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options
    }));
    
    console.log('✅ Test unique créé avec succès');
    res.status(StatusCodes.CREATED).json({
      testId: test._id,
      duration: test.duration,
      questions: safeQuestions,
      status: test.status
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du test:', error);
    
    // Retourner une erreur appropriée
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur interne lors de la création du test'
    });
  }
};

// Fonction pour vérifier l'unicité d'un test
async function isTestUnique(newQuestions, existingTests) {
  if (!existingTests || existingTests.length === 0) {
    return true; // Aucun test existant, donc unique
  }
  
  // Comparer avec chaque test existant
  for (const existingTest of existingTests) {
    const similarity = calculateTestSimilarity(newQuestions, existingTest.questions);
    if (similarity > 0.7) { // Plus de 70% de similarité = non unique
      console.log(`⚠️ Test trop similaire détecté (${(similarity * 100).toFixed(1)}%)`);
      return false;
    }
  }
  
  return true;
}

// Fonction pour calculer la similarité entre deux tests
function calculateTestSimilarity(questions1, questions2) {
  if (!questions1 || !questions2 || questions1.length !== questions2.length) {
    return 0;
  }
  
  let similarQuestions = 0;
  
  for (let i = 0; i < questions1.length; i++) {
    const q1 = questions1[i];
    const q2 = questions2[i];
    
    // Comparer les textes des questions (similarité simple)
    if (q1.questionText === q2.questionText) {
      similarQuestions++;
    } else {
      // Vérifier la similarité partielle
      const words1 = q1.questionText.toLowerCase().split(' ');
      const words2 = q2.questionText.toLowerCase().split(' ');
      const commonWords = words1.filter(word => words2.includes(word));
      
      if (commonWords.length / Math.max(words1.length, words2.length) > 0.6) {
        similarQuestions += 0.5;
      }
    }
  }
  
  return similarQuestions / questions1.length;
}

// Questions par défaut en cas d'échec du service IA
function getDefaultQuestionsDirectly(job, existingTests = [], seed = 1) {
  console.log('📋 Génération directe des questions par défaut avec variété');
  
  // Pool de questions variées selon les compétences
  const questionPools = {
    general: [
      {
        questionText: "Qu'est-ce que l'héritage en programmation orientée objet ?",
        type: "multiple_choice",
        options: [
          "Un mécanisme permettant à une classe d'hériter des propriétés d'une autre",
          "Une méthode pour diviser le code en modules",
          "Un système de versioning",
          "Une technique d'optimisation"
        ],
        correctAnswer: "Un mécanisme permettant à une classe d'hériter des propriétés d'une autre",
        explanation: "L'héritage permet à une classe fille d'hériter des attributs et méthodes d'une classe parente."
      },
      {
        questionText: "Quelle est la différence entre let et var en JavaScript ?",
        type: "multiple_choice",
        options: [
          "var a une portée de fonction, let a une portée de bloc",
          "let a une portée de fonction, var a une portée de bloc",
          "Ils sont identiques",
          "var est plus rapide que let"
        ],
        correctAnswer: "var a une portée de fonction, let a une portée de bloc",
        explanation: "let a une portée de bloc, ce qui le rend plus prévisible que var."
      },
      {
        questionText: "Qu'est-ce qu'une API REST ?",
        type: "multiple_choice",
        options: [
          "Un type de base de données",
          "Une architecture pour les services web basée sur HTTP",
          "Un langage de programmation",
          "Un framework frontend"
        ],
        correctAnswer: "Une architecture pour les services web basée sur HTTP",
        explanation: "REST est une architecture web populaire utilisant HTTP."
      },
      {
        questionText: "Quel est le rôle d'un index dans une base de données ?",
        type: "multiple_choice",
        options: [
          "Sauvegarder la base de données",
          "Accélérer les requêtes de lecture",
          "Crypter les données",
          "Créer des backups automatiques"
        ],
        correctAnswer: "Accélérer les requêtes de lecture",
        explanation: "Les index améliorent les performances de lecture des bases de données."
      },
      {
        questionText: "Qu'est-ce que le versioning sémantique ?",
        type: "multiple_choice",
        options: [
          "Un système pour nommer les branches Git",
          "Un format de versioning avec MAJOR.MINOR.PATCH",
          "Une technique de déploiement",
          "Un outil de documentation"
        ],
        correctAnswer: "Un format de versioning avec MAJOR.MINOR.PATCH",
        explanation: "Le versioning sémantique suit le format MAJOR.MINOR.PATCH."
      },
      {
        questionText: "Quelle est la différence entre un processus et un thread ?",
        type: "multiple_choice",
        options: [
          "Un processus est plus léger qu'un thread",
          "Un thread partage la mémoire avec d'autres threads du même processus",
          "Il n'y a pas de différence",
          "Un thread est plus sécurisé qu'un processus"
        ],
        correctAnswer: "Un thread partage la mémoire avec d'autres threads du même processus",
        explanation: "Les threads d'un même processus partagent le même espace mémoire."
      },
      {
        questionText: "Qu'est-ce que la récursion en programmation ?",
        type: "multiple_choice",
        options: [
          "Une boucle infinie",
          "Une fonction qui s'appelle elle-même",
          "Une technique de tri",
          "Un type de variable"
        ],
        correctAnswer: "Une fonction qui s'appelle elle-même",
        explanation: "La récursion est quand une fonction s'appelle elle-même avec des paramètres modifiés."
      },
      {
        questionText: "Qu'est-ce que l'encapsulation en POO ?",
        type: "multiple_choice",
        options: [
          "Le fait de cacher les détails d'implémentation",
          "L'héritage multiple",
          "La surcharge des méthodes",
          "L'instanciation des objets"
        ],
        correctAnswer: "Le fait de cacher les détails d'implémentation",
        explanation: "L'encapsulation permet de cacher les détails internes d'un objet."
      }
    ],
    react: [
      {
        questionText: "Quelle est la différence entre state et props dans React ?",
        type: "multiple_choice",
        options: [
          "State est mutable, props est immutable",
          "Props est mutable, state est immutable",
          "Ils sont identiques",
          "State est plus rapide que props"
        ],
        correctAnswer: "State est mutable, props est immutable",
        explanation: "Le state est interne au composant, les props sont passées par le parent."
      },
      {
        questionText: "Qu'est-ce que le Virtual DOM dans React ?",
        type: "multiple_choice",
        options: [
          "Une copie en mémoire du DOM réel",
          "Un nouveau navigateur web",
          "Un framework CSS",
          "Une base de données"
        ],
        correctAnswer: "Une copie en mémoire du DOM réel",
        explanation: "Le Virtual DOM est une représentation en mémoire du DOM pour optimiser les updates."
      }
    ],
    python: [
      {
        questionText: "Quelle est la différence entre une liste et un tuple en Python ?",
        type: "multiple_choice",
        options: [
          "Les tuples sont immuables, les listes sont mutables",
          "Les listes sont immuables, les tuples sont mutables",
          "Ils sont identiques",
          "Les tuples sont plus lents"
        ],
        correctAnswer: "Les tuples sont immuables, les listes sont mutables",
        explanation: "Les tuples ne peuvent pas être modifiés après leur création."
      },
      {
        questionText: "Qu'est-ce qu'un décorateur en Python ?",
        type: "multiple_choice",
        options: [
          "Une fonction qui modifie le comportement d'une autre fonction",
          "Un type de variable",
          "Une boucle spéciale",
          "Un module d'importation"
        ],
        correctAnswer: "Une fonction qui modifie le comportement d'une autre fonction",
        explanation: "Les décorateurs permettent de modifier ou étendre le comportement des fonctions."
      }
    ]
  };
  
  // Sélectionner des questions en fonction des compétences et de la variété
  let selectedQuestions = [];
  const allQuestions = [...questionPools.general];
  
  // Ajouter des questions spécifiques selon les compétences
  if (job.technicalSkills && Array.isArray(job.technicalSkills)) {
    if (job.technicalSkills.some(skill => ['React', 'react'].includes(skill))) {
      allQuestions.push(...questionPools.react);
    }
    if (job.technicalSkills.some(skill => ['Python', 'python'].includes(skill))) {
      allQuestions.push(...questionPools.python);
    }
  }
  
  // Utiliser le seed pour créer de la variété
  const random = Math.sin(seed * 12.9898) % 1;
  const startIndex = Math.floor(random * Math.max(1, allQuestions.length - 5));
  
  // Sélectionner 5 questions consécutives avec rotation
  for (let i = 0; i < 5; i++) {
    const index = (startIndex + i) % allQuestions.length;
    selectedQuestions.push({ ...allQuestions[index] });
  }
  
  // Mélanger légèrement les options pour plus de variété
  selectedQuestions.forEach(question => {
    if (question.options && typeof seed === 'number') {
      const shuffleSeed = Math.sin(seed * 78.233) % 1;
      if (shuffleSeed > 0.5) {
        // Permuter les deux premières options parfois
        const temp = question.options[0];
        question.options[0] = question.options[1];
        question.options[1] = temp;
        
        // Ajuster la bonne réponse si nécessaire
        if (question.correctAnswer === temp) {
          question.correctAnswer = question.options[0];
        } else if (question.correctAnswer === question.options[1]) {
          question.correctAnswer = question.options[1];
        }
      }
    }
  });
  
  console.log(`✅ ${selectedQuestions.length} questions par défaut générées avec variété`);
  return selectedQuestions;
}

// ✅ FONCTION CORRIGÉE - Soumettre les réponses au test
const submitTest = async (req, res) => {
  const { id: testId } = req.params;
  const { answers } = req.body;
  const userId = req.user.userId;
  
  try {
    console.log(`📝 Soumission du test ${testId}`);
    
    if (!answers || !Array.isArray(answers)) {
      throw new BadRequestError('Veuillez fournir des réponses valides');
    }
    
    const test = await TechnicalTest.findOne({ _id: testId });
    if (!test) {
      throw new NotFoundError(`Pas de test avec l'id ${testId}`);
    }
    
    // Vérifier que l'utilisateur est le candidat
    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }
    
    // Vérifier le statut du test
    if (test.status === 'completed') {
      throw new BadRequestError('Ce test a déjà été complété');
    }
    
    // Vérifier que le nombre de réponses correspond au nombre de questions
    if (answers.length !== test.questions.length) {
      throw new BadRequestError('Le nombre de réponses ne correspond pas au nombre de questions');
    }
    
    // Évaluer les réponses
    console.log('🔍 Évaluation des réponses...');
    let score = 0;
    const evaluatedAnswers = [];
    
    for (let i = 0; i < answers.length; i++) {
      const question = test.questions[i];
      const answer = answers[i];
      
      let isCorrect = false;
      let aiEvaluation = null;
      
      if (question.type === 'coding') {
        // Utiliser le service IA pour évaluer le code
        try {
          aiEvaluation = await evaluateCodeSolution(question, answer);
          isCorrect = aiEvaluation.correct;
        } catch (error) {
          console.error('Erreur évaluation IA:', error);
          // Fallback simple pour les questions de code
          isCorrect = answer && answer.trim().length > 10;
          aiEvaluation = {
            correct: isCorrect,
            feedback: "Évaluation basique effectuée",
            score: isCorrect ? 50 : 0
          };
        }
      } else {
        // Pour les questions à choix multiples
        isCorrect = answer === question.correctAnswer;
      }
      
      if (isCorrect) {
        score += 1;
      }
      
      evaluatedAnswers.push({
        questionId: question._id,
        submittedAnswer: answer,
        isCorrect,
        aiEvaluation
      });
    }
    
    // Calculer le score en pourcentage
    const percentage = (score / test.questions.length) * 100;
    
    // Mettre à jour le test avec findByIdAndUpdate pour éviter les conflits de version
    const updatedTest = await TechnicalTest.findByIdAndUpdate(
      testId,
      {
        candidateAnswers: evaluatedAnswers,
        score: percentage,
        status: 'completed',
        completedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedTest) {
      throw new NotFoundError('Test non trouvé lors de la mise à jour');
    }
    
    // ✅ CORRECTION PRINCIPALE - Mettre à jour la candidature avec le testId
    const application = await Application.findByIdAndUpdate(
      test.application,
      {
        status: 'test_completed',
        testResults: {
          score: percentage,
          completedAt: new Date(),
          testId: test._id  // ✅ AJOUT CRUCIAL - Sauvegarder l'ID du test
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    
    console.log('✅ Candidature mise à jour avec testId:', test._id);
    console.log(`✅ Test complété avec un score de ${percentage.toFixed(2)}%`);
    
    res.status(StatusCodes.OK).json({
      score: percentage.toFixed(2),
      correctAnswers: score,
      totalQuestions: test.questions.length,
      evaluatedAnswers
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la soumission du test:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur interne lors de la soumission du test'
    });
  }
};

// Récupérer un test sans les réponses (pour candidat)
const getTest = async (req, res) => {
  const { id: testId } = req.params;
  const userId = req.user.userId;
  
  try {
    console.log(`📖 Récupération du test ${testId}`);
    
    const test = await TechnicalTest.findOne({ _id: testId });
    if (!test) {
      throw new NotFoundError(`Pas de test avec l'id ${testId}`);
    }
    
    // Vérifier que l'utilisateur est le candidat
    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }
    
    // Préparer les questions sans les réponses correctes
    const safeQuestions = test.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options
    }));
    
    console.log(`✅ Test récupéré avec ${safeQuestions.length} questions`);
    
    res.status(StatusCodes.OK).json({
      testId: test._id,
      duration: test.duration,
      status: test.status,
      questions: safeQuestions,
      startedAt: test.startedAt,
      completedAt: test.completedAt
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du test:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur interne lors de la récupération du test'
    });
  }
};

// Marquer un test comme commencé
const startTest = async (req, res) => {
  const { id: testId } = req.params;
  const userId = req.user.userId;
  
  try {
    console.log(`▶️ Démarrage du test ${testId}`);
    
    const test = await TechnicalTest.findOne({ _id: testId });
    if (!test) {
      throw new NotFoundError(`Pas de test avec l'id ${testId}`);
    }
    
    // Vérifier que l'utilisateur est le candidat
    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }
    
    // Vérifier le statut du test
    if (test.status === 'completed') {
      throw new BadRequestError('Ce test a déjà été complété');
    }
    
    if (test.status === 'in_progress') {
      // Test déjà en cours, retourner les informations existantes
      console.log('⚠️ Test déjà en cours');
      return res.status(StatusCodes.OK).json({
        message: 'Test déjà en cours',
        startedAt: test.startedAt,
        status: test.status
      });
    }
    
    // Mettre à jour le test avec findByIdAndUpdate pour éviter les conflits de version
    const updatedTest = await TechnicalTest.findByIdAndUpdate(
      testId,
      {
        status: 'in_progress',
        startedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedTest) {
      throw new NotFoundError('Test non trouvé lors de la mise à jour');
    }
    
    // Mettre à jour la candidature avec findByIdAndUpdate
    const application = await Application.findByIdAndUpdate(
      test.application,
      { status: 'test_in_progress' },
      { 
        new: true,
        runValidators: true
      }
    );
    
    console.log('✅ Test démarré avec succès');
    
    res.status(StatusCodes.OK).json({
      message: 'Test commencé',
      startedAt: updatedTest.startedAt
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du test:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur interne lors du démarrage du test'
    });
  }
};

// Analyser un CV avec gestion d'erreur améliorée
const analyzeResume = async (req, res) => {
  try {
    console.log('🔍 Début de l\'analyse de CV...');
    
    const { resumePath, jobId } = req.body;
    const userId = req.user.userId;
    
    if (!resumePath || !jobId) {
      throw new BadRequestError('resumePath et jobId sont requis');
    }
    
    // Vérifier que le job existe
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Pas de poste avec l'id ${jobId}`);
    }
    
    // Vérifier les permissions d'accès au job si nécessaire
    // (selon votre logique métier)
    
    console.log('📄 Analyse du CV pour le poste:', job.title);
    
    // Analyser le CV avec le service (avec gestion d'erreur intégrée)
    const { analyzeResume } = require('../utils/aiService');
    const analysis = await analyzeResume(resumePath, job);
    
    console.log('✅ Analyse terminée:', analysis);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du CV:', error);
    
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Erreur lors de l\'analyse du CV'
    });
  }
};

// Obtenir les résultats d'un test (pour le candidat)
const getTestResults = async (req, res) => {
  const { id: testId } = req.params;
  const userId = req.user.userId;
  
  try {
    console.log(`📊 Récupération des résultats du test ${testId}`);
    
    const test = await TechnicalTest.findOne({ _id: testId })
      .populate('job', 'title description')
      .populate('application');
    
    if (!test) {
      throw new NotFoundError(`Pas de test avec l'id ${testId}`);
    }
    
    // Vérifier que l'utilisateur est le candidat
    if (test.candidate.toString() !== userId) {
      throw new UnauthenticatedError('Accès non autorisé');
    }
    
    // Vérifier que le test est complété
    if (test.status !== 'completed') {
      throw new BadRequestError('Ce test n\'est pas encore complété');
    }
    
    // Préparer les résultats (sans révéler les bonnes réponses)
    const results = {
      testId: test._id,
      jobTitle: test.job.title,
      score: test.score,
      completedAt: test.completedAt,
      duration: test.duration,
      totalQuestions: test.questions.length,
      correctAnswers: test.candidateAnswers.filter(a => a.isCorrect).length,
      status: test.status
    };
    
    console.log(`✅ Résultats récupérés: ${test.score}%`);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des résultats:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erreur interne lors de la récupération des résultats'
    });
  }
};

// Fonction utilitaire pour vérifier la santé du service IA
const checkAIServiceHealth = async (req, res) => {
  try {
    console.log('🔍 Vérification de la santé du service IA...');
    
    const { checkOllamaAvailability } = require('../utils/aiService');
    const isAvailable = await checkOllamaAvailability();
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        aiServiceAvailable: isAvailable,
        timestamp: new Date(),
        status: isAvailable ? 'healthy' : 'unavailable'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du service IA:', error);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        aiServiceAvailable: false,
        timestamp: new Date(),
        status: 'error',
        error: error.message
      }
    });
  }
};

// ✅ NOUVELLE FONCTION - Récupérer un test technique via l'ID de candidature
const getTestByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log('🔍 Recherche test pour candidature:', applicationId);

    // Récupérer la candidature avec le testId
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    console.log('📋 Candidature trouvée:', {
      id: application._id,
      testId: application.testResults?.testId
    });

    // Vérifier si un test technique existe pour cette candidature
    if (!application.testResults?.testId) {
      return res.status(404).json({ message: 'Aucun test technique associé à cette candidature' });
    }

    // Récupérer le test technique
    const test = await TechnicalTest.findById(application.testResults.testId);
    if (!test) {
      return res.status(404).json({ message: 'Test technique non trouvé' });
    }

    console.log('✅ Test technique trouvé:', test._id);

    res.status(200).json({
      test,
      message: 'Test technique récupéré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur getTestByApplication:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération du test',
      error: error.message 
    });
  }
};

// ✅ EXPORTS CORRIGÉS - Toutes les fonctions exportées
module.exports = {
  createTest,
  submitTest,
  getTest,
  startTest,
  analyzeResume,
  getTestResults,
  checkAIServiceHealth,
  getTestByApplication  // ✅ AJOUT CRUCIAL
};