// models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Veuillez fournir une offre d\'emploi']
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Veuillez fournir un candidat']
  },
  resume: {
    type: String,
    required: [true, 'Veuillez fournir un CV']
  },
  // Nouveaux champs pour l'analyse IA du CV
  aiAnalysis: {
    match: Boolean,
    score: Number,
    feedback: String,
    missingSkills: [String]
  },
  // Statut de la candidature
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'test_in_progress', 'test_completed'],
    default: 'pending'
  },
  // Résultats du test technique
  testResults: {
    score: Number,
    completedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);