const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
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
  
  // Champs spécifiques aux recruteurs
  companyInfo: {
    companyName: {
      type: String,
      // Required seulement si role est recruiter
    },
    industry: String,
    companySize: String,
    companyLogo: String,
    description: String,
    website: String,
    foundedYear: Number,
    // Coordonnées de l'entreprise
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String
    },
    contactPhone: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String
    }
  },
  
  // Champs spécifiques aux candidats
  candidateInfo: {
    resume: String,  // URL du CV
    skills: [String],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      from: Date,
      to: Date
    }],
    experience: [{
      title: String,
      company: String,
      from: Date,
      to: Date,
      description: String
    }]
  }
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
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);