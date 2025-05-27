// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadCompanyLogo
} = require("../controllers/authController");
const { auth } = require("../middlewares/authentication");
const User = require("../models/User");

// Routes publiques
router.post("/register", register);
router.post("/login", login);

// Routes protégées
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/upload-profile-image", auth, uploadProfileImage);
router.post("/upload-company-logo", auth, uploadCompanyLogo);

// Route admin pour supprimer un utilisateur (ancienne version - gardée pour compatibilité)
router.delete('/delete-user', auth, async (req, res) => {
  const { name } = req.body;
  try {
    // Vérifier si l'utilisateur est admin
    const requestingUser = await User.findById(req.user.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    // Trouver et supprimer l'utilisateur par nom
    const user = await User.findOneAndDelete({ name });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `User ${name} deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;