// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate',
  },
  
  // Champs pour tous les utilisateurs
  profileImage: {
    type: String,  // URL de l'image ou chemin
    default: 'default-profile.jpg'
  },
  
  // Statut du compte (pour la gestion admin)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Date de dernière connexion
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Token de réinitialisation de mot de passe
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Token de vérification d'email
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
 
  // Champs spécifiques aux recruteurs
  companyInfo: {
    companyName: {
      type: String,
      // Required seulement si role est recruiter
    },
    industry: String,
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    companyLogo: String,
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    
    // Coordonnées de l'entreprise
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String
    },
    contactPhone: {
      type: String,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String
    }
  },
 
  // Champs spécifiques aux candidats
  candidateInfo: {
    resume: String,  // URL du CV
    
    // Compétences techniques
    skills: [{
      type: String,
      trim: true
    }],
    
    // Niveau d'expérience
    experienceLevel: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead', 'executive']
    },
    
    // Salaire souhaité
    expectedSalary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'EUR'
      }
    },
    
    // Disponibilité
    availability: {
      type: String,
      enum: ['immediately', '2weeks', '1month', '3months', 'negotiable'],
      default: 'negotiable'
    },
    
    // Préférences de travail
    workPreferences: {
      remote: {
        type: Boolean,
        default: false
      },
      hybrid: {
        type: Boolean,
        default: false
      },
      onsite: {
        type: Boolean,
        default: true
      },
      partTime: {
        type: Boolean,
        default: false
      },
      freelance: {
        type: Boolean,
        default: false
      }
    },
    
    // Éducation
    education: [{
      institution: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      fieldOfStudy: String,
      from: {
        type: Date,
        required: true
      },
      to: Date,
      current: {
        type: Boolean,
        default: false
      },
      grade: String,
      description: String
    }],
    
    // Expérience professionnelle
    experience: [{
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: String,
      from: {
        type: Date,
        required: true
      },
      to: Date,
      current: {
        type: Boolean,
        default: false
      },
      description: String,
      technologies: [String]
    }],
    
    // Certifications
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expirationDate: Date,
      credentialId: String,
      url: String
    }],
    
    // Langues
    languages: [{
      language: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }],
    
    // Portfolio/Projets
    portfolio: [{
      title: String,
      description: String,
      url: String,
      technologies: [String],
      date: Date
    }]
  },
  
  // Préférences utilisateur
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      contactInfoVisible: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      enum: ['fr', 'en', 'es', 'de'],
      default: 'fr'
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    }
  }
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les recherches
UserSchema.index({ role: 1 });
UserSchema.index({ 'companyInfo.companyName': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isActive: 1 });

// Virtual pour le nom complet
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual pour obtenir l'initiale
UserSchema.virtual('initials').get(function() {
  return this.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
});

// Validation conditionnelle - si role est 'recruiter', companyName devient obligatoire
UserSchema.path('role').validate(function(value) {
  if (value === 'recruiter') {
    if (!this.companyInfo || !this.companyInfo.companyName) {
      this.invalidate('companyInfo.companyName', 'Company name is required for recruiters');
    }
  }
  return true;
});

// Hash password avant sauvegarde
UserSchema.pre('save', async function (next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode pour mettre à jour la dernière connexion
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Méthode pour désactiver/activer le compte
UserSchema.methods.toggleActiveStatus = function() {
  this.isActive = !this.isActive;
  return this.save({ validateBeforeSave: false });
};

// Méthode statique pour rechercher des utilisateurs
UserSchema.statics.searchUsers = function(searchTerm, filters = {}) {
  const query = { ...filters };
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { 'companyInfo.companyName': { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  return this.find(query).select('-password');
};

// Middleware pour supprimer les données sensibles lors de la conversion en JSON
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.emailVerificationToken;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);