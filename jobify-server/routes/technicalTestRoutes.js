// routes/technicalTestRoutes.js
const express = require('express');
const router = express.Router();

const {
  createTest,
  submitTest,
  getTest,
  startTest,
  getTestByApplication  
} = require('../controllers/technicalTestController');

// Générer un test pour une candidature
router.post('/applications/:id/create', createTest);

router.get('/applications/:applicationId/test', getTestByApplication);
// Récupérer un test
router.get('/:id', getTest);

// Marquer un test comme commencé
router.patch('/:id/start', startTest);

// Soumettre les réponses
router.post('/:id/submit', submitTest);

module.exports = router;