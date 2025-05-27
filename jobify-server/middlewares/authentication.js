// middlewares/authentication.js
const jwt = require('jsonwebtoken');


const auth = async (req, res, next) => {
  try {
    // ✅ AJOUT: Logs de debug pour l'authentification
    console.log('🔐 Middleware d\'authentification appelé');
    console.log('📋 Headers authorization:', req.headers.authorization ? 'présent' : 'absent');
    
    // Vérifier le header d'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Header authorization manquant ou mal formaté');
      return res.status(401).json({ message: 'Authentification invalide' });
    }
   
    const token = authHeader.split(' ')[1];
    console.log('🔑 Token extrait (10 premiers chars):', token.substring(0, 10));
   
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token valide pour utilisateur:', payload.userId);
    
    // Attacher l'utilisateur à la requête
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    console.error('❌ Erreur authentification:', error.message);
    
    // ✅ IMPORTANT: Utiliser res.status au lieu de throw pour éviter les problèmes
    return res.status(401).json({
      message: 'Authentification invalide',
      error: error.message
    });
  }
};

// Middleware pour vérifier que l'utilisateur est un recruteur
const recruiterOnly = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'recruiter') {
      console.log('❌ Accès refusé: utilisateur non recruteur');
      return res.status(401).json({
        message: 'Accès réservé aux recruteurs'
      });
    }
    next();
  } catch (error) {
    console.error('❌ Erreur middleware recruiter:', error.message);
    return res.status(500).json({
      message: 'Erreur du middleware recruiter'
    });
  }
};

module.exports = { auth, recruiterOnly };