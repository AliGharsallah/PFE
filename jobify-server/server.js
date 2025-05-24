const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const technicalTestRoutes = require("./routes/technicalTestRoutes");
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
}

// Servir les fichiers statiques depuis le dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use("/api/auth", authRoutes); // Routes d'authentification
app.use("/api/jobs", jobRoutes); // Routes pour les offres d'emploi
app.use("/api/applications", auth, applicationRoutes); // Routes pour les candidatures
app.use("/api/tests", auth, technicalTestRoutes); // Routes pour les tests techniques

// Route par défaut
app.get("/", (req, res) => {
  res.send("API running");
});

// Middleware de gestion des erreurs
app.use(errorHandlerMiddleware);

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));