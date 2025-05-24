// middlewares/authentication.js
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  // Vérifier le header d'authentification
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentification invalide');
  }
 
  const token = authHeader.split(' ')[1];
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attacher l'utilisateur à la requête
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentification invalide');
  }
};

// Middleware pour vérifier que l'utilisateur est un recruteur
const recruiterOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'recruiter') {
    throw new UnauthenticatedError('Accès réservé aux recruteurs');
  }
  next();
};

module.exports = { auth, recruiterOnly };