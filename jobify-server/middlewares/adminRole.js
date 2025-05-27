// middlewares/adminRole.js
const User = require('../models/User');

/**
 * Middleware pour vérifier que l'utilisateur connecté est un administrateur
 */
const adminRole = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est connecté (le middleware auth doit être appelé avant)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        message: 'Token d\'authentification requis' 
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier que l'utilisateur est un admin
    if (user.role !== 'Admin') {
      return res.status(403).json({ 
        message: 'Accès refusé. Droits d\'administrateur requis.',
        requiredRole: 'admin',
        currentRole: user.role
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.admin = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Erreur dans le middleware adminRole:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la vérification des droits',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { adminRole };