// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();

const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus
} = require('../controllers/applicationController');

// Routes pour les candidats
router.post('/jobs/:id/apply', applyForJob); // Postuler à une offre
router.get('/my-applications', getMyApplications); // Récupérer mes candidatures

// Routes pour les recruteurs
router.get('/job/:id', getJobApplications); // Récupérer les candidatures pour une offre

// Routes communes
router.get('application/:id', getApplication); // Récupérer une candidature spécifique
router.patch('/:id/status', updateApplicationStatus); // Mettre à jour le statut d'une candidature

module.exports = router;