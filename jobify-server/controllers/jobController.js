// controllers/jobController.js
const Job = require('../models/job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');

// Créer une offre d'emploi
const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// Récupérer toutes les offres d'emploi actives
const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ status: 'active' })
    .sort('-createdAt');
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

// Récupérer les offres d'emploi du recruteur connecté
const getMyJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId })
    .sort('-createdAt');
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

// Récupérer une offre d'emploi spécifique
const getJob = async (req, res) => {
  const { id: jobId } = req.params;
  
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`Pas d'offre d'emploi avec l'id ${jobId}`);
  }
  
  res.status(StatusCodes.OK).json({ job });
};

// Modifier une offre d'emploi
const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { 
    title, 
    company, 
    description, 
    location, 
    requirements, 
    technicalSkills, 
    testCriteria, 
    status 
  } = req.body;
  
  if (!title || !company || !description) {
    throw new BadRequestError('Veuillez fournir toutes les valeurs requises');
  }
  
  const job = await Job.findOne({ _id: jobId });
  
  if (!job) {
    throw new NotFoundError(`Pas d'offre d'emploi avec l'id ${jobId}`);
  }
  
  // Vérifier que l'utilisateur est bien le créateur de l'offre
  if (job.createdBy.toString() !== req.user.userId) {
    throw new UnauthenticatedError('Non autorisé à modifier cette offre');
  }
  
  // Mettre à jour l'offre
  const updatedJob = await Job.findOneAndUpdate(
    { _id: jobId },
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(StatusCodes.OK).json({ job: updatedJob });
};

// Supprimer une offre d'emploi
const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;
  
  const job = await Job.findOne({ _id: jobId });
  
  if (!job) {
    throw new NotFoundError(`Pas d'offre d'emploi avec l'id ${jobId}`);
  }
  
  // Vérifier que l'utilisateur est bien le créateur de l'offre
  if (job.createdBy.toString() !== req.user.userId) {
    throw new UnauthenticatedError('Non autorisé à supprimer cette offre');
  }
  
  await job.deleteOne();
  res.status(StatusCodes.OK).json({ message: 'Offre supprimée avec succès' });
};

module.exports = {
  createJob,
  getAllJobs,
  getMyJobs,
  getJob,
  updateJob,
  deleteJob
};