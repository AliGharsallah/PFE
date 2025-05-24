// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getAllJobs, 
  getJob, 
  updateJob, 
  deleteJob,
  getMyJobs
} = require('../controllers/jobController');
const { auth } = require('../middlewares/authentication');
router.use(auth);

// Routes pour les offres d'emploi
router.route('/')
  .post(createJob)   // Créer une offre d'emploi
  .get(getAllJobs);  // Récupérer toutes les offres d'emploi actives

router.route('/my-jobs')
  .get(getMyJobs);   // Récupérer les offres d'emploi du recruteur connecté

router.route('/:id')
  .get(getJob)       // Récupérer une offre d'emploi spécifique
  .patch(updateJob)  // Modifier une offre d'emploi
  .delete(deleteJob); // Supprimer une offre d'emploi

module.exports = router;