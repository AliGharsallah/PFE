const User = require("../models/User"); // Assure-toi que le chemin est correct
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Vérifier si tous les champs de base sont présents
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    // Parser les données companyInfo et candidateInfo si elles sont des strings JSON
    let companyInfo = req.body.companyInfo;
    let candidateInfo = req.body.candidateInfo;
    
    if (typeof companyInfo === 'string') {
      try {
        companyInfo = JSON.parse(companyInfo);
      } catch (e) {
        companyInfo = null;
      }
    }
    
    if (typeof candidateInfo === 'string') {
      try {
        candidateInfo = JSON.parse(candidateInfo);
      } catch (e) {
        candidateInfo = null;
      }
    }

    // Validation spécifique selon le rôle
    if (role === 'recruiter') {
      if (!companyInfo || !companyInfo.companyName) {
        return res.status(400).json({ 
          message: "Le nom de l'entreprise est requis pour les recruteurs" 
        });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Créer l'utilisateur avec les informations de base
    const userData = {
      name,
      email,
      password,
      role
    };

    // Ajouter les informations conditionnelles selon le rôle
    if (role === 'recruiter' && companyInfo) {
      userData.companyInfo = companyInfo;
    } else if (role === 'candidate' && candidateInfo) {
      userData.candidateInfo = candidateInfo;
    }

    const newUser = await User.create(userData);
    const token = generateToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.status(200).json({ 
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        companyInfo: user.role === 'recruiter' ? user.companyInfo : undefined,
        candidateInfo: user.role === 'candidate' ? user.candidateInfo : undefined
      }
    });
  } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mettre à jour le profil de l'utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    
    // Champs de base pouvant être mis à jour
    const basicFields = ['name', 'email'];
    basicFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });
    
    // Mise à jour des champs spécifiques au rôle
    const user = await User.findById(req.user.userId);
    
    if (user.role === 'recruiter' && req.body.companyInfo) {
      fieldsToUpdate.companyInfo = {
        ...user.companyInfo || {},
        ...req.body.companyInfo
      };
    } else if (user.role === 'candidate' && req.body.candidateInfo) {
      fieldsToUpdate.candidateInfo = {
        ...user.candidateInfo || {},
        ...req.body.candidateInfo
      };
    }
    
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Télécharger une image de profil
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({ message: "Veuillez télécharger une image" });
    }

    const file = req.files.profileImage;
    
    // Vérifier le type de fichier
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({ message: "Veuillez télécharger une image" });
    }
    
    // Vérifier la taille (max 1MB)
    if (file.size > 1000000) {
      return res.status(400).json({ message: "L'image ne doit pas dépasser 1MB" });
    }
    
    // Créer un nom de fichier personnalisé
    file.name = `photo_${req.user.userId}${path.parse(file.name).ext}`;
    
    // Déplacer le fichier
    const uploadPath = path.join(process.cwd(), 'uploads', file.name);
    
    file.mv(uploadPath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Problème lors du téléchargement du fichier" });
      }
      
      // Mettre à jour l'utilisateur avec le chemin de l'image
      await User.findByIdAndUpdate(req.user.userId, { profileImage: `/uploads/${file.name}` });
      
      res.status(200).json({
        success: true,
        image: `/uploads/${file.name}`
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Télécharger un logo d'entreprise
exports.uploadCompanyLogo = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un recruteur
    const user = await User.findById(req.user.userId);
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: "Seuls les recruteurs peuvent télécharger un logo d'entreprise" });
    }
    
    if (!req.files || !req.files.companyLogo) {
      return res.status(400).json({ message: "Veuillez télécharger une image" });
    }

    const file = req.files.companyLogo;
    
    // Vérifier le type de fichier
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({ message: "Veuillez télécharger une image" });
    }
    
    // Vérifier la taille (max 1MB)
    if (file.size > 1000000) {
      return res.status(400).json({ message: "L'image ne doit pas dépasser 1MB" });
    }
    
    // Créer un nom de fichier personnalisé
    file.name = `company_${req.user.userId}${path.parse(file.name).ext}`;
    
    // Déplacer le fichier
    const uploadPath = path.join(process.cwd(), 'uploads', file.name);
    
    file.mv(uploadPath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Problème lors du téléchargement du fichier" });
      }
      
      // Mise à jour du champ companyInfo.companyLogo
      user.companyInfo = user.companyInfo || {};
      user.companyInfo.companyLogo = `/uploads/${file.name}`;
      await user.save();
      
      res.status(200).json({
        success: true,
        logo: `/uploads/${file.name}`
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};