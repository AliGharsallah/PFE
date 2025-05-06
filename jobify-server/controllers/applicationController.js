// controllers/applicationController.js
const Application = require('../models/application');
const Job = require('../models/job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const { analyzeResume } = require('../utils/aiService');
const path = require('path');
const fs = require('fs');

// Gérer l'upload du CV et créer une candidature
const applyForJob = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;

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

  // Analyser le CV avec l'IA
  const aiAnalysis = await analyzeResume(uploadPath, job);

  // Créer la candidature
  const application = await Application.create({
    job: jobId,
    candidate: userId,
    resume: uploadPath,
    aiAnalysis,
    status: aiAnalysis.match ? 'approved' : 'rejected'
  });

  res.status(StatusCodes.CREATED).json({
    application,
    message: aiAnalysis.match 
      ? 'Votre candidature a été acceptée. Vous pouvez maintenant passer le test technique.'
      : 'Votre candidature a été rejetée car votre profil ne correspond pas suffisamment aux exigences du poste.'
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
  
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
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