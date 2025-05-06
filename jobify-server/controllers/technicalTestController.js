// controllers/technicalTestController.js
const TechnicalTest = require('../models/TechnicalTest');
const Application = require('../models/application');
const Job = require('../models/job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const { generateTechnicalTest } = require('../utils/aiService');

// Générer un test technique pour une candidature approuvée
const createTest = async (req, res) => {
  const { id: applicationId } = req.params;
  const userId = req.user.userId;
  
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
  
  // Vérifier si un test existe déjà
  const existingTest = await TechnicalTest.findOne({ application: applicationId });
  if (existingTest) {
    throw new BadRequestError('Un test a déjà été généré pour cette candidature');
  }
  
  // Générer les questions du test
  const questions = await generateTechnicalTest(application.job);
  
  // Créer le test
  const test = await TechnicalTest.create({
    job: application.job._id,
    application: applicationId,
    candidate: userId,
    questions,
    duration: application.job.testCriteria.duration || 60
  });
  
  // Mettre à jour le statut de la candidature
  application.status = 'test_in_progress';
  await application.save();
  
  // Préparer les questions sans les réponses correctes pour le candidat
  const safeQuestions = test.questions.map(q => ({
    _id: q._id,
    questionText: q.questionText,
    type: q.type,
    options: q.options
  }));
  
  res.status(StatusCodes.CREATED).json({
    testId: test._id,
    duration: test.duration,
    questions: safeQuestions
  });
};

// Soumettre les réponses au test
const submitTest = async (req, res) => {
  const { id: testId } = req.params;
  const { answers } = req.body;
  const userId = req.user.userId;
  
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
  let score = 0;
  const evaluatedAnswers = [];
  
  for (let i = 0; i < answers.length; i++) {
    const question = test.questions[i];
    const answer = answers[i];
    const isCorrect = answer === question.correctAnswer;
    
    if (isCorrect) {
      score += 1;
    }
    
    evaluatedAnswers.push({
      questionId: question._id,
      submittedAnswer: answer,
      isCorrect
    });
  }
  
  // Calculer le score en pourcentage
  const percentage = (score / test.questions.length) * 100;
  
  // Mettre à jour le test
  test.candidateAnswers = evaluatedAnswers;
  test.score = percentage;
  test.status = 'completed';
  test.completedAt = new Date();
  await test.save();
  
  // Mettre à jour la candidature
  const application = await Application.findById(test.application);
  application.status = 'test_completed';
  application.testResults = {
    score: percentage,
    completedAt: new Date()
  };
  await application.save();
  
  res.status(StatusCodes.OK).json({
    score: percentage.toFixed(2),
    correctAnswers: score,
    totalQuestions: test.questions.length,
    evaluatedAnswers
  });
};

// Récupérer un test sans les réponses (pour candidat)
const getTest = async (req, res) => {
  const { id: testId } = req.params;
  const userId = req.user.userId;
  
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
  
  res.status(StatusCodes.OK).json({
    testId: test._id,
    duration: test.duration,
    status: test.status,
    questions: safeQuestions,
    startedAt: test.startedAt,
    completedAt: test.completedAt
  });
};

// Marquer un test comme commencé
const startTest = async (req, res) => {
  const { id: testId } = req.params;
  const userId = req.user.userId;
  
  const test = await TechnicalTest.findOne({ _id: testId });
  if (!test) {
    throw new NotFoundError(`Pas de test avec l'id ${testId}`);
  }
  
  // Vérifier que l'utilisateur est le candidat
  if (test.candidate.toString() !== userId) {
    throw new UnauthenticatedError('Accès non autorisé');
  }
  
  // Vérifier le statut du test
  if (test.status !== 'created') {
    throw new BadRequestError('Ce test a déjà été commencé ou complété');
  }
  
  // Mettre à jour le test
  test.status = 'in_progress';
  test.startedAt = new Date();
  await test.save();
  
  res.status(StatusCodes.OK).json({
    message: 'Test commencé',
    startedAt: test.startedAt
  });
};

module.exports = {
  createTest,
  submitTest,
  getTest,
  startTest
};