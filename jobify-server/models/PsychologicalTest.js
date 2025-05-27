const mongoose = require('mongoose');

// Schéma pour l'analyse vocale
const VoiceAnalysisSchema = new mongoose.Schema({
  speechRate: { type: Number, required: true }, // mots/minute
  emotionalTone: {
    type: String,
    enum: ['neutral', 'stressed', 'confident', 'hesitant'],
    required: true
  },
  linguisticComplexity: { type: Number, min: 0, max: 100, required: true },
  coherenceScore: { type: Number, min: 0, max: 100, required: true },
  totalWords: { type: Number, required: true }
}, { _id: false });

// Schéma pour les réponses détaillées

const DetailedAnswerSchema = new mongoose.Schema({
  transcript: { 
    type: String, 
    required: false,  // ✅ CHANGÉ: Ne plus exiger le transcript
    default: ''       // ✅ AJOUTÉ: Valeur par défaut
  },
  analysis: VoiceAnalysisSchema,
  duration: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const PsychologicalTestSchema = new mongoose.Schema({
  // Relations
  technicalTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TechnicalTest',
    required: [true, 'Test technique requis']
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Candidature requise']
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidat requis']
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Offre d\'emploi requise']
  },

  // Questions adaptées au frontend
  questions: [{
    id: { type: String, required: true },
    question: { type: String, required: true },
    category: {
      type: String,
      enum: ['linguistic', 'stress', 'emotional', 'personality'], // ✅ Aligné avec frontend
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'], // ✅ Ajouté pour le frontend
      required: true
    },
    type: {
      type: String,
      enum: ['open', 'choice'],
      default: 'open'
    },
    options: [String] // Pour les questions à choix multiples
  }],

  // Réponses détaillées avec analyse vocale
  answers: {
    type: Map,
    of: DetailedAnswerSchema // ✅ Structure complète
  },

  // Résultats de l'analyse IA améliorés
  analysisResults: {
    // Traits de personnalité Big Five
    personality_traits: {
      openness: { type: Number, min: 0, max: 100 },
      conscientiousness: { type: Number, min: 0, max: 100 },
      extraversion: { type: Number, min: 0, max: 100 },
      agreeableness: { type: Number, min: 0, max: 100 },
      neuroticism: { type: Number, min: 0, max: 100 }
    },
    
    // Capacités cognitives
    cognitive_abilities: {
      problem_solving: { type: Number, min: 0, max: 100 },
      analytical_thinking: { type: Number, min: 0, max: 100 },
      creativity: { type: Number, min: 0, max: 100 },
      attention_to_detail: { type: Number, min: 0, max: 100 }
    },
    
    // Intelligence émotionnelle
    emotional_intelligence: {
      self_awareness: { type: Number, min: 0, max: 100 },
      empathy: { type: Number, min: 0, max: 100 },
      social_skills: { type: Number, min: 0, max: 100 },
      emotional_regulation: { type: Number, min: 0, max: 100 }
    },
    
    // Patterns comportementaux
    behavioral_patterns: {
      leadership_potential: { type: Number, min: 0, max: 100 },
      team_collaboration: { type: Number, min: 0, max: 100 },
      stress_management: { type: Number, min: 0, max: 100 },
      adaptability: { type: Number, min: 0, max: 100 }
    },

    // ✅ Nouvelles métriques vocales
    vocal_patterns: {
      average_speech_rate: { type: Number },
      emotional_stability: { type: Number, min: 0, max: 100 },
      linguistic_sophistication: { type: Number, min: 0, max: 100 },
      response_coherence: { type: Number, min: 0, max: 100 },
      stress_indicators: { type: Number, min: 0, max: 100 }
    },

    overall_score: { type: Number, min: 0, max: 100 },
    recommendations: [String],
    
    // ✅ Insights détaillés
    detailed_insights: [{
      category: String,
      insight: String,
      confidence: { type: Number, min: 0, max: 100 }
    }]
  },

  // Données comportementales enrichies
  behavioralData: {
    // Sécurité et surveillance
    securityViolations: { type: Number, default: 0 },
    handDetectionTime: { type: Number, default: 0 }, // % du temps avec mains détectées
    cameraInterruptions: { type: Number, default: 0 },
    faceDetectionTime: { type: Number, default: 0 }, // % du temps avec visage détecté
    
    // Performance vocale
    totalSpeakingTime: { type: Number, default: 0 }, // en secondes
    averageResponseTime: { type: Number, default: 0 }, // temps avant de commencer à parler
    pausesCount: { type: Number, default: 0 },
    
    // Engagement et attention
    attentionScore: { type: Number, default: 100, min: 0, max: 100 },
    emotionalState: { 
      type: String, 
      enum: ['calm', 'neutral', 'stressed', 'anxious', 'confident'],
      default: 'neutral' 
    },
    
    // Flags comportementaux
    behavioralFlags: [{
      type: String,
      timestamp: Date,
      description: String
    }],
    
   testDuration: { 
  type: Number, 
  default: 0,
  validate: {
    validator: function(v) {
      // Requis seulement si le test est complété
      if (this.status === 'completed') {
        return v > 0;
      }
      return true;
    },
    message: 'La durée du test est requise quand le test est complété'
  }
}
  },

  // Statut et timing
  status: {
    type: String,
    enum: ['created', 'in_progress', 'completed', 'cancelled'],
    default: 'created'
  },
  
  startedAt: Date,
  completedAt: Date,
  
  // ✅ Métadonnées techniques
  technicalMetadata: {
    browserInfo: String,
    microphoneQuality: String,
    cameraQuality: String,
    networkStability: String
  }

}, { 
  timestamps: true,
  // ✅ Index pour les performances
  indexes: [
    { candidate: 1, status: 1 },
    { technicalTest: 1 },
    { application: 1 }
  ]
});

// ✅ Méthodes utilitaires
PsychologicalTestSchema.methods.calculateOverallScore = function() {
  const results = this.analysisResults;
  if (!results) return 0;
  
  // Pondération des différentes catégories
  const weights = {
    personality: 0.25,
    cognitive: 0.25,
    emotional: 0.25,
    behavioral: 0.15,
    vocal: 0.10
  };
  
  let totalScore = 0;
  let validCategories = 0;
  
  // Calculer score personality
  if (results.personality_traits) {
    const traits = Object.values(results.personality_traits);
    const avgPersonality = traits.reduce((sum, val) => sum + (val || 0), 0) / traits.length;
    totalScore += avgPersonality * weights.personality;
    validCategories++;
  }
  
  // Calculer score cognitive
  if (results.cognitive_abilities) {
    const abilities = Object.values(results.cognitive_abilities);
    const avgCognitive = abilities.reduce((sum, val) => sum + (val || 0), 0) / abilities.length;
    totalScore += avgCognitive * weights.cognitive;
    validCategories++;
  }
  
  // Calculer score émotionnel
  if (results.emotional_intelligence) {
    const emotional = Object.values(results.emotional_intelligence);
    const avgEmotional = emotional.reduce((sum, val) => sum + (val || 0), 0) / emotional.length;
    totalScore += avgEmotional * weights.emotional;
    validCategories++;
  }
  
  // Calculer score comportemental
  if (results.behavioral_patterns) {
    const behavioral = Object.values(results.behavioral_patterns);
    const avgBehavioral = behavioral.reduce((sum, val) => sum + (val || 0), 0) / behavioral.length;
    totalScore += avgBehavioral * weights.behavioral;
    validCategories++;
  }
  
  // Calculer score vocal
  if (results.vocal_patterns) {
    const vocal = Object.values(results.vocal_patterns);
    const avgVocal = vocal.reduce((sum, val) => sum + (val || 0), 0) / vocal.length;
    totalScore += avgVocal * weights.vocal;
    validCategories++;
  }
  
  return validCategories > 0 ? Math.round(totalScore / validCategories * 4) : 0;
};

// ✅ Validation personnalisée
PsychologicalTestSchema.pre('save', function(next) {
  // Calculer le score global automatiquement
  if (this.analysisResults && this.status === 'completed') {
    this.analysisResults.overall_score = this.calculateOverallScore();
  }
  next();
});

module.exports = mongoose.model('PsychologicalTest', PsychologicalTestSchema);