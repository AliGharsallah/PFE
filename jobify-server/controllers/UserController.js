// controllers/UserController.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middlewares/authentication');
const { validationResult, body, param } = require('express-validator');

// Middleware pour vérifier que l'utilisateur est admin
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent effectuer cette action.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * GET /api/admin/users - Récupérer tous les utilisateurs
 */
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtres optionnels
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filters)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    // Transformer les données pour correspondre au format frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      nom: user.name.split(' ').pop() || '', // Prendre le dernier mot comme nom
      prenom: user.name.split(' ').slice(0, -1).join(' ') || user.name, // Le reste comme prénom
      role: user.role === 'candidate' ? 'Candidat' : user.role === 'recruiter' ? 'Recruteur' : 'Admin',
      dateInscription: user.createdAt ? user.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      statut: 'Actif', // Pour l'instant, tous les utilisateurs sont actifs
      profileImage: user.profileImage,
      companyInfo: user.companyInfo,
      candidateInfo: user.candidateInfo
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
});

/**
 * GET /api/admin/users/:id - Récupérer un utilisateur par ID
 */
router.get('/:id', 
  auth, 
  adminOnly,
  param('id').isMongoId().withMessage('ID utilisateur invalide'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Transformer les données
      const transformedUser = {
        id: user._id,
        email: user.email,
        nom: user.name.split(' ').pop() || '',
        prenom: user.name.split(' ').slice(0, -1).join(' ') || user.name,
        role: user.role === 'candidate' ? 'Candidat' : user.role === 'recruiter' ? 'Recruteur' : 'Admin',
        dateInscription: user.createdAt ? user.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        statut: 'Actif',
        profileImage: user.profileImage,
        companyInfo: user.companyInfo,
        candidateInfo: user.candidateInfo
      };

      res.json(transformedUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
    }
  }
);

/**
 * POST /api/admin/users - Créer un nouvel utilisateur
 */
router.post('/',
  auth,
  adminOnly,
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('role').isIn(['Candidat', 'Recruteur', 'Admin']).withMessage('Rôle invalide'),
    body('statut').optional().isIn(['Actif', 'Inactif']).withMessage('Statut invalide')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, nom, prenom, role, statut } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
      }

      // Transformer le rôle pour la base de données
      const dbRole = role === 'Candidat' ? 'candidate' : role === 'Recruteur' ? 'recruiter' : 'admin';
      
      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Créer l'utilisateur
      const newUser = await User.create({
        name: `${prenom} ${nom}`,
        email,
        password: tempPassword,
        role: dbRole
      });

      // Retourner les données transformées
      const transformedUser = {
        id: newUser._id,
        email: newUser.email,
        nom,
        prenom,
        role,
        dateInscription: newUser.createdAt.toISOString().split('T')[0],
        statut: statut || 'Actif'
      };

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: transformedUser,
        tempPassword // À envoyer par email en production
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
    }
  }
);

/**
 * PUT /api/admin/users/:id - Mettre à jour un utilisateur
 */
router.put('/:id',
  auth,
  adminOnly,
  [
    param('id').isMongoId().withMessage('ID utilisateur invalide'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('prenom').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('role').optional().isIn(['Candidat', 'Recruteur', 'Admin']).withMessage('Rôle invalide'),
    body('statut').optional().isIn(['Actif', 'Inactif']).withMessage('Statut invalide')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, nom, prenom, role, statut } = req.body;
      
      // Vérifier si l'utilisateur existe
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Préparer les données à mettre à jour
      const updateData = {};
      
      if (email) {
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
        if (existingUser) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
        }
        updateData.email = email;
      }
      
      if (nom || prenom) {
        const currentName = user.name.split(' ');
        const newNom = nom || currentName.pop() || '';
        const newPrenom = prenom || currentName.slice(0, -1).join(' ') || user.name;
        updateData.name = `${newPrenom} ${newNom}`;
      }
      
      if (role) {
        updateData.role = role === 'Candidat' ? 'candidate' : role === 'Recruteur' ? 'recruiter' : 'admin';
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      // Transformer les données pour la réponse
      const transformedUser = {
        id: updatedUser._id,
        email: updatedUser.email,
        nom: updatedUser.name.split(' ').pop() || '',
        prenom: updatedUser.name.split(' ').slice(0, -1).join(' ') || updatedUser.name,
        role: updatedUser.role === 'candidate' ? 'Candidat' : updatedUser.role === 'recruiter' ? 'Recruteur' : 'Admin',
        dateInscription: updatedUser.createdAt.toISOString().split('T')[0],
        statut: statut || 'Actif'
      };

      res.json({
        message: 'Utilisateur mis à jour avec succès',
        user: transformedUser
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
    }
  }
);

/**
 * DELETE /api/admin/users/:id - Supprimer un utilisateur
 */
router.delete('/:id',
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('ID utilisateur invalide'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Empêcher la suppression de son propre compte
      if (user._id.toString() === req.user.userId) {
        return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
      }

      // Supprimer l'utilisateur
      await User.findByIdAndDelete(req.params.id);

      res.json({
        message: 'Utilisateur supprimé avec succès',
        deletedUserId: req.params.id
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
    }
  }
);

/**
 * POST /api/admin/users/search - Recherche avancée d'utilisateurs
 */
router.post('/search',
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { searchTerm, role, status, dateFrom, dateTo } = req.body;
      
      const filters = {};
      
      // Recherche par terme
      if (searchTerm) {
        filters.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      // Filtre par rôle
      if (role && role !== 'Tous') {
        const dbRole = role === 'Candidat' ? 'candidate' : role === 'Recruteur' ? 'recruiter' : 'admin';
        filters.role = dbRole;
      }
      
      // Filtre par date
      if (dateFrom || dateTo) {
        filters.createdAt = {};
        if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filters.createdAt.$lte = new Date(dateTo);
      }

      const users = await User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(100); // Limiter les résultats

      // Transformer les données
      const transformedUsers = users.map(user => ({
        id: user._id,
        email: user.email,
        nom: user.name.split(' ').pop() || '',
        prenom: user.name.split(' ').slice(0, -1).join(' ') || user.name,
        role: user.role === 'candidate' ? 'Candidat' : user.role === 'recruiter' ? 'Recruteur' : 'Admin',
        dateInscription: user.createdAt.toISOString().split('T')[0],
        statut: 'Actif'
      }));

      res.json(transformedUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Erreur lors de la recherche d\'utilisateurs', error: error.message });
    }
  }
);

/**
 * GET /api/admin/users/statistics - Statistiques des utilisateurs
 */
router.get('/statistics', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Nouveaux utilisateurs aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: today } 
    });

    // Nouveaux utilisateurs cette semaine
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: weekAgo } 
    });

    res.json({
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalAdmins,
      newUsersToday,
      newUsersThisWeek
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
});

module.exports = router;