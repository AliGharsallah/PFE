// controllers/applicationController.js
const Application = require('../models/application');
const Job = require('../models/job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const { analyzeResume } = require('../utils/aiService'); // Import corrigé
const path = require('path');
const fs = require('fs');

// Variable pour gérer l'intervalle entre requêtes
let lastRequestTime = 0;
const MINIMUM_REQUEST_INTERVAL = 5000; // 5 secondes entre requêtes

// Gérer l'upload du CV et créer une candidature
const applyForJob = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;

  console.log('🚀 Début de la candidature pour le job:', jobId);

  // Vérifier si l'offre existe
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`Pas d'offre d'emploi avec l'id ${jobId}`);
  }

  // Vérifier si l'utilisateur a déjà postulé
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: userId
  });
  
  if (existingApplication) {
    throw new BadRequestError('Vous avez déjà postulé pour cette offre');
  }

  // Vérifier si un fichier a été téléchargé
  if (!req.files || !req.files.resume) {
    throw new BadRequestError('Veuillez télécharger votre CV');
  }

  const resume = req.files.resume;

  // Vérifier le type de fichier
  const fileTypes = /pdf|doc|docx/;
  const extname = fileTypes.test(path.extname(resume.name).toLowerCase());
  const mimetype = fileTypes.test(resume.mimetype);

  if (!extname || !mimetype) {
    throw new BadRequestError('Veuillez télécharger un fichier PDF ou Word');
  }

  // Vérifier la taille du fichier (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (resume.size > maxSize) {
    throw new BadRequestError('Le fichier ne doit pas dépasser 5MB');
  }

  // Créer le dossier uploads s'il n'existe pas
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Générer un nom de fichier unique
  const fileName = `${Date.now()}-${userId}${path.extname(resume.name)}`;
  const uploadPath = `uploads/${fileName}`;

  // Déplacer le fichier
  await resume.mv(uploadPath);

  // Attendre entre les requêtes pour éviter la surcharge
  const now = Date.now();
  if (now - lastRequestTime < MINIMUM_REQUEST_INTERVAL) {
    const waitTime = MINIMUM_REQUEST_INTERVAL - (now - lastRequestTime);
    console.log(`⏳ Attente de ${waitTime}ms pour éviter la surcharge...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  // Analyser le CV avec l'IA
  console.log('📄 Début de l\'analyse du CV...');
  console.log('📂 Fichier:', uploadPath);
  console.log('💼 Job details:', {
    title: job.title,
    skills: job.technicalSkills,
    experience: job.experience
  });
  
  const aiAnalysis = await analyzeResume(uploadPath, job);
  
  // Logs détaillés pour debug
  console.log('🔍 === RÉSULTAT DE L\'ANALYSE ===');
  console.log('  - AI Analysis reçu:', aiAnalysis);
  console.log('  - Match (brut):', aiAnalysis.match);
  console.log('  - Score (brut):', aiAnalysis.score);
  console.log('  - Type de match:', typeof aiAnalysis.match);
  console.log('  - Type de score:', typeof aiAnalysis.score);

  // Forcer le calcul correct du match basé sur le score
  let calculatedMatch = false;
  let normalizedScore = 0;
  
  if (typeof aiAnalysis.score === 'number') {
    normalizedScore = aiAnalysis.score;
    calculatedMatch = aiAnalysis.score >= 75;
  } else if (typeof aiAnalysis.score === 'string') {
    normalizedScore = parseFloat(aiAnalysis.score);
    calculatedMatch = normalizedScore >= 75;
  }

  // Utiliser le match calculé ou celui de l'IA
  let finalMatch = aiAnalysis.match;
  if (normalizedScore >= 75 && !finalMatch) {
    console.log('⚠️ CORRECTION: Score >= 75 mais match était false, correction appliquée');
    finalMatch = true;
  }

  console.log('  - Score normalisé:', normalizedScore);
  console.log('  - Match calculé:', calculatedMatch);
  console.log('  - Match final:', finalMatch);

  // Définir le statut basé sur le match final
  const applicationStatus = finalMatch ? 'approved' : 'rejected';
  
  console.log('✅ Statut final:', applicationStatus);

  // Créer la candidature avec le format du modèle existant
  const application = await Application.create({
    job: jobId,
    candidate: userId,
    resume: uploadPath,
    aiAnalysis: {
      match: finalMatch,
      score: normalizedScore,
      feedback: aiAnalysis.feedback || `Score: ${normalizedScore}%`,
      missingSkills: aiAnalysis.missingSkills || []
    },
    status: applicationStatus
  });

  let message;
  if (finalMatch) {
    message = `🎉 Félicitations ! Votre candidature a été acceptée avec un score de ${normalizedScore}%. Vous pouvez maintenant passer le test technique.`;
  } else {
    message = `❌ Votre candidature a été rejetée (score: ${normalizedScore}%). Votre profil ne correspond pas suffisamment aux exigences du poste.`;
    if (aiAnalysis.missingSkills && aiAnalysis.missingSkills.length > 0) {
      message += ` Compétences manquantes: ${aiAnalysis.missingSkills.join(', ')}.`;
    }
  }

  console.log('💬 Message final:', message);

  res.status(StatusCodes.CREATED).json({
    application,
    message,
    analysis: {
      score: normalizedScore,
      match: finalMatch,
      status: applicationStatus,
      debug: {
        originalMatch: aiAnalysis.match,
        calculatedMatch: calculatedMatch,
        scoreType: typeof aiAnalysis.score
      }
    }
  });
};

// Récupérer toutes les candidatures d'un candidat
const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user.userId })
    .populate('job')
    .sort('-createdAt');
  
  res.status(StatusCodes.OK).json({ applications, count: applications.length });
};

// Récupérer toutes les candidatures pour une offre d'emploi (pour recruteurs)
const getJobApplications = async (req, res) => {
  const { id: jobId } = req.params;
  
  // Vérifier si l'offre existe et appartient au recruteur
  const job = await Job.findOne({ 
    _id: jobId,
    createdBy: req.user.userId
  });
  
  if (!job) {
    throw new NotFoundError(`Pas d'offre d'emploi avec l'id ${jobId}`);
  }
  
  const applications = await Application.find({ job: jobId })
    .populate('candidate', 'name email')
    .sort('-createdAt');
  
  res.status(StatusCodes.OK).json({ applications, count: applications.length });
};

// Récupérer une candidature spécifique
const getApplication = async (req, res) => {
  const { id: applicationId } = req.params;
  const userId = req.user.userId;
  
  const application = await Application.findOne({ _id: applicationId })
    .populate('job')
    .populate('candidate', 'name email');
  
  if (!application) {
    throw new NotFoundError(`Pas de candidature avec l'id ${applicationId}`);
  }
  
  // Vérifier que l'utilisateur est autorisé à voir cette candidature
  const isCandidate = application.candidate._id.toString() === userId;
  const isRecruiter = application.job.createdBy.toString() === userId;
  
  if (!isCandidate && !isRecruiter) {
    throw new UnauthenticatedError('Accès non autorisé');
  }
  
  res.status(StatusCodes.OK).json({ application });
};

// Mettre à jour le statut d'une candidature (pour recruteurs)
const updateApplicationStatus = async (req, res) => {
  const { id: applicationId } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'approved', 'rejected', 'test_in_progress', 'test_completed'].includes(status)) {
    throw new BadRequestError('Veuillez fournir un statut valide');
  }
  
  const application = await Application.findOne({ _id: applicationId })
    .populate('job');
  
  if (!application) {
    throw new NotFoundError(`Pas de candidature avec l'id ${applicationId}`);
  }
  
  // Vérifier que l'utilisateur est le recruteur
  if (application.job.createdBy.toString() !== req.user.userId) {
    throw new UnauthenticatedError('Accès non autorisé');
  }
  
  // Log pour debug
  console.log(`🔄 Mise à jour du statut de ${application.status} vers ${status}`);
  
  application.status = status;
  await application.save();
  
  res.status(StatusCodes.OK).json({ application });
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus
};