const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const technicalTestRoutes = require("./routes/technicalTestRoutes");
const psychologicalTestRoutes = require("./routes/psychologicalTestRoutes");
const fs = require("fs");
const path = require("path");
// Correction de l'import - utiliser la destructuration pour obtenir auth
const { auth } = require("./middlewares/authentication");
const errorHandlerMiddleware = require("./middlewares/error-handler");

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialisation de l'application Express
const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Votre frontend Vite
  credentials: true
}));

app.use(express.json()); // Middleware pour parser le JSON

app.use(fileUpload({
  createParentPath: true, // Crée le dossier d'upload s'il n'existe pas
  limits: { fileSize: 1000000 }, // Limite la taille des fichiers à 1MB
}));

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Dossier uploads créé:', uploadDir);
} else {
  console.log('✅ Dossier uploads existe:', uploadDir);
}

// IMPORTANT: Middleware pour servir les fichiers statiques
// Doit être placé AVANT les routes API pour éviter les conflits
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de debug pour les fichiers statiques (optionnel - à retirer en production)
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.path);
  console.log('📁 Demande de fichier:', req.path);
  console.log('📂 Chemin complet:', filePath);
  console.log('✅ Le fichier existe:', fs.existsSync(filePath));
  
  // Si le fichier n'existe pas, logger les fichiers disponibles
  if (!fs.existsSync(filePath)) {
    const files = fs.readdirSync(path.join(__dirname, 'uploads'));
    console.log('📋 Fichiers disponibles dans uploads:', files);
  }
  
  next();
});

// Routes API (APRÈS le middleware static)
app.use("/api/auth", authRoutes); // Routes d'authentification
app.use("/api/jobs", jobRoutes); // Routes pour les offres d'emploi
app.use("/api/applications", auth, applicationRoutes); // Routes pour les candidatures
app.use("/api/tests", auth, technicalTestRoutes); // Routes pour les tests techniques
app.use("/api/psychological-tests", auth, psychologicalTestRoutes);// Routes pour les tests psychologique
app.use("/api/admin", require("./routes/adminRoutes"));

// Route par défaut
app.get("/", (req, res) => {
  res.send("API running");
});

// Route de test pour vérifier les uploads (optionnel - à retirer en production)
app.get("/api/test-uploads", (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.json({
      message: "Contenu du dossier uploads",
      uploadDir,
      files: files.map(file => ({
        name: file,
        path: `/uploads/${file}`,
        fullUrl: `http://localhost:${process.env.PORT || 5000}/uploads/${file}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware de gestion des erreurs (TOUJOURS en dernier)
app.use(errorHandlerMiddleware);

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Static files served from: ${uploadDir}`);
  console.log(`🔗 Test uploads at: http://localhost:${PORT}/api/test-uploads`);
});