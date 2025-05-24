// models/TechnicalTest.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Le texte de la question est requis']
  },
  options: [String], // Pour les questions à choix multiples
  correctAnswer: {
    type: String,
    required: [true, 'La réponse correcte est requise']
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'coding', 'short_answer'],
    default: 'multiple_choice'
  },
  explanation: String // Explication de la réponse correcte
});

const TechnicalTestSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Veuillez fournir une offre d\'emploi']
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Veuillez fournir une candidature']
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Veuillez fournir un candidat']
  },
  questions: [QuestionSchema],
  duration: {
    type: Number, // en minutes
    default: 60
  },
  candidateAnswers: [Object], // Réponses fournies par le candidat
  score: Number, // Score obtenu (pourcentage)
  status: {
    type: String, 
    enum: ['created', 'in_progress', 'completed'],
    default: 'created'
  },
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('TechnicalTest', TechnicalTestSchema);