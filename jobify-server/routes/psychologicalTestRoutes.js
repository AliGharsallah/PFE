// routes/psychologicalTestRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPsychologicalTest,
  getPsychologicalTest,
  startPsychologicalTest,
  submitPsychologicalTest,
  getPsychologicalTestResults
} = require('../controllers/psychologicalTestController');

// ✅ AJOUT: Middleware de debug pour toutes les routes
router.use((req, res, next) => {
  console.log(`🔗 Route psychologique atteinte: ${req.method} ${req.path}`);
  console.log('📋 Params complets:', req.params);
  console.log('👤 User from middleware:', req.user ? 'présent' : 'absent');
  next();
});

// ✅ AJOUT: Route de test de santé (sans auth pour vérifier le montage des routes)
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Route psychological-tests accessible',
    timestamp: new Date(),
    user: req.user ? 'authentifié' : 'non authentifié'
  });
});

// Créer un test psychologique basé sur un test technique
router.post('/technical-test/:technicalTestId/create', (req, res, next) => {
  console.log(`🎯 Route CREATE atteinte avec technicalTestId: ${req.params.technicalTestId}`);
  next();
}, createPsychologicalTest);

// Récupérer un test psychologique
router.get('/:testId', getPsychologicalTest);

// Démarrer un test psychologique
router.patch('/:testId/start', startPsychologicalTest);

// Soumettre les réponses du test psychologique
router.post('/:testId/submit', submitPsychologicalTest);

// Récupérer les résultats du test psychologique
router.get('/:testId/results', (req, res, next) => {
  console.log(`🎯 Route atteinte: /:testId/results avec testId = ${req.params.testId}`);
  next();
}, getPsychologicalTestResults);

// Route de debug temporaire
router.get('/debug/technical-tests', async (req, res) => {
  try {
    const TechnicalTest = require('../models/TechnicalTest');
    const tests = await TechnicalTest.find({}).limit(5).select('_id candidate status');
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;