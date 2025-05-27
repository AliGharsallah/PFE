// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middlewares/authentication');
const { adminRole } = require('../middlewares/adminRole');
// Toutes les routes admin nécessitent auth + adminRole
router.use(auth, adminRole);

/**
 * GET /api/admin/users - Récupérer tous les utilisateurs
 */
router.get('/users', async (req, res) => {
  try {
    console.log('🔍 Route GET /api/admin/users appelée par:', req.admin.email);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construire les filtres
    const filters = {};
    if (req.query.role) {
      filters.role = req.query.role;
    }
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Récupérer les utilisateurs
    const users = await User.find(filters)
      .select('-password -resetPasswordToken -emailVerificationToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    console.log(`✅ Trouvé ${users.length} utilisateurs sur ${total} total`);

    // Transformer les données pour le frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      nom: user.name.split(' ').pop() || user.name,
      prenom: user.name.split(' ').slice(0, -1).join(' ') || '',
      role: user.role === 'candidate' ? 'Candidat' : 
            user.role === 'recruiter' ? 'Recruteur' : 'Admin',
      dateInscription: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 
                      new Date().toISOString().split('T')[0],
      statut: user.isActive ? 'Actif' : 'Inactif',
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
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des utilisateurs', 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/users/:id - Récupérer un utilisateur par ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    const user = await User.findById(id)
      .select('-password -resetPasswordToken -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const transformedUser = {
      id: user._id,
      email: user.email,
      nom: user.name.split(' ').pop() || user.name,
      prenom: user.name.split(' ').slice(0, -1).join(' ') || '',
      role: user.role === 'candidate' ? 'Candidat' : 
            user.role === 'recruiter' ? 'Recruteur' : 'Admin',
      dateInscription: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 
                      new Date().toISOString().split('T')[0],
      statut: user.isActive ? 'Actif' : 'Inactif',
      profileImage: user.profileImage,
      companyInfo: user.companyInfo,
      candidateInfo: user.candidateInfo
    };

    res.json(transformedUser);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'utilisateur', 
      error: error.message 
    });
  }
});

/**
 * POST /api/admin/users - Créer un nouvel utilisateur
 */
router.post('/users', async (req, res) => {
  try {
    const { email, nom, prenom, role, statut } = req.body;

    // Validation basique
    if (!email || !nom || !prenom || !role) {
      return res.status(400).json({ 
        message: 'Tous les champs obligatoires doivent être remplis',
        required: ['email', 'nom', 'prenom', 'role']
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Transformer le rôle pour la base de données
    const dbRole = role === 'Candidat' ? 'candidate' : 
                   role === 'Recruteur' ? 'recruiter' : 'admin';
    
    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).slice(-8).toUpperCase();
    
    // Créer l'utilisateur
    const newUser = await User.create({
      name: `${prenom} ${nom}`.trim(),
      email: email.toLowerCase(),
      password: tempPassword,
      role: dbRole,
      isActive: statut === 'Actif'
    });

    console.log(`✅ Nouvel utilisateur créé: ${newUser.email} (${newUser.role})`);

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
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'utilisateur', 
      error: error.message 
    });
  }
});

/**
 * PUT /api/admin/users/:id - Mettre à jour un utilisateur
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nom, prenom, role, statut } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    
    if (email) {
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Cet email est déjà utilisé par un autre utilisateur' 
        });
      }
      updateData.email = email.toLowerCase();
    }
    
    if (nom && prenom) {
      updateData.name = `${prenom} ${nom}`.trim();
    } else if (nom || prenom) {
      const currentName = user.name.split(' ');
      const newNom = nom || currentName.pop() || '';
      const newPrenom = prenom || currentName.join(' ') || user.name;
      updateData.name = `${newPrenom} ${newNom}`.trim();
    }
    
    if (role) {
      updateData.role = role === 'Candidat' ? 'candidate' : 
                        role === 'Recruteur' ? 'recruiter' : 'admin';
    }

    if (statut) {
      updateData.isActive = statut === 'Actif';
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -emailVerificationToken');

    console.log(`✅ Utilisateur mis à jour: ${updatedUser.email}`);

    // Transformer les données pour la réponse
    const transformedUser = {
      id: updatedUser._id,
      email: updatedUser.email,
      nom: updatedUser.name.split(' ').pop() || updatedUser.name,
      prenom: updatedUser.name.split(' ').slice(0, -1).join(' ') || '',
      role: updatedUser.role === 'candidate' ? 'Candidat' : 
            updatedUser.role === 'recruiter' ? 'Recruteur' : 'Admin',
      dateInscription: updatedUser.createdAt ? updatedUser.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      statut: updatedUser.isActive ? 'Actif' : 'Inactif'
    };

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: transformedUser
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'utilisateur', 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/admin/users/:id - Supprimer un utilisateur
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression de son propre compte
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ 
        message: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    console.log(`✅ Utilisateur supprimé: ${user.email} par ${req.admin.email}`);

    res.json({
      message: 'Utilisateur supprimé avec succès',
      deletedUserId: id
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'utilisateur', 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/users/statistics - Statistiques des utilisateurs
 */
router.get('/users/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    
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
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersToday,
      newUsersThisWeek
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques', 
      error: error.message 
    });
  }
});

module.exports = router;