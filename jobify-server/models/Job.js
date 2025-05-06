// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Veuillez fournir un titre']
  },
  company: {
    type: String,
    required: [true, 'Veuillez fournir le nom de l\'entreprise']
  },
  description: {
    type: String,
    required: [true, 'Veuillez fournir une description']
  },
  location: String,
  // Nouveaux champs pour les compétences et exigences
  requirements: {
    type: [String],
    default: []
  },
  technicalSkills: {
    type: [String],
    default: []
  },
  // Critères pour le test technique
  testCriteria: {
    topics: {
      type: [String],
      default: []
    },
    duration: {
      type: Number,
      default: 60 // Durée par défaut en minutes
    },
    numberOfQuestions: {
      type: Number,
      default: 5
    }
  },
  // Champ existant
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Veuillez fournir un utilisateur']
  },
  // Statut de l'offre
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);