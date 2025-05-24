// ConfigController.js (Node.js/Express)
const express = require('express');
const router = express.Router();
const ConfigService = require('../services/ConfigService');
const { validationResult, body, param } = require('express-validator');
const multer = require('multer');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminRole');

// Configuration de multer pour gérer les téléchargements de fichiers
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Middleware pour vérifier les droits d'administration
router.use(auth, admin);

/**
 * Récupère la configuration système
 */
router.get('/', async (req, res) => {
  try {
    const config = await ConfigService.getSystemConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching system configuration:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la configuration système' });
  }
});

/**
 * Met à jour la configuration système
 */
router.put('/', async (req, res) => {
  try {
    // Validation des données
    const config = req.body;
    
    // Liste des champs attendus
    const expectedFields = [
      'appName', 'maxUsersPerCompany', 'maxCandidatsPerOffre', 'dureeMaxEntretien',
      'notificationsEmail', 'maintenance', 'debug', 'logLevel',
      'deleteInactiveAccounts', 'backupFrequency', 'language', 'timezone'
    ];
    
    // Vérification des types
    if (typeof config.appName !== 'string' || config.appName.trim() === '') {
      return res.status(400).json({ message: 'Le nom de l\'application est requis' });
    }
    
    if (typeof config.maxUsersPerCompany !== 'number' || config.maxUsersPerCompany <= 0) {
      return res.status(400).json({ message: 'Le nombre maximum d\'utilisateurs par entreprise doit être un nombre positif' });
    }
    
    if (typeof config.maxCandidatsPerOffre !== 'number' || config.maxCandidatsPerOffre <= 0) {
      return res.status(400).json({ message: 'Le nombre maximum de candidats par offre doit être un nombre positif' });
    }
    
    if (typeof config.dureeMaxEntretien !== 'number' || config.dureeMaxEntretien <= 0) {
      return res.status(400).json({ message: 'La durée maximale d\'entretien doit être un nombre positif' });
    }
    
    if (typeof config.notificationsEmail !== 'boolean') {
      return res.status(400).json({ message: 'Le champ notificationsEmail doit être un booléen' });
    }
    
    if (typeof config.maintenance !== 'boolean') {
      return res.status(400).json({ message: 'Le champ maintenance doit être un booléen' });
    }
    
    if (typeof config.debug !== 'boolean') {
      return res.status(400).json({ message: 'Le champ debug doit être un booléen' });
    }
    
    if (!['debug', 'info', 'warning', 'error', 'critical'].includes(config.logLevel)) {
      return res.status(400).json({ message: 'Niveau de journalisation invalide' });
    }
    
    if (typeof config.deleteInactiveAccounts !== 'number' || config.deleteInactiveAccounts < 0) {
      return res.status(400).json({ message: 'La période de suppression des comptes inactifs doit être un nombre positif ou zéro' });
    }
    
    if (!['hourly', 'daily', 'weekly', 'monthly'].includes(config.backupFrequency)) {
      return res.status(400).json({ message: 'Fréquence de sauvegarde invalide' });
    }
    
    // Validation réussie, mettre à jour la configuration
    const updatedConfig = await ConfigService.updateSystemConfig(config);
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating system configuration:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la configuration système' });
  }
});

/**
 * Réinitialise la configuration système aux valeurs par défaut
 */
router.post('/reset', async (req, res) => {
  try {
    const defaultConfig = await ConfigService.resetSystemConfig();
    res.json(defaultConfig);
  } catch (error) {
    console.error('Error resetting system configuration:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation de la configuration système' });
  }
});

/**
 * Récupère un seul paramètre de configuration
 */
router.get('/param/:name',
  param('name').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const paramValue = await ConfigService.getConfigParam(req.params.name);
      if (paramValue === undefined) {
        return res.status(404).json({ message: 'Paramètre de configuration non trouvé' });
      }
      res.json({ name: req.params.name, value: paramValue });
    } catch (error) {
      console.error(`Error getting config param ${req.params.name}:`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération du paramètre de configuration' });
    }
});

/**
 * Met à jour un seul paramètre de configuration
 */
router.patch('/param/:name',
  param('name').isString().notEmpty(),
  body('value').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const config = await ConfigService.updateConfigParam(req.params.name, req.body.value);
      res.json(config);
    } catch (error) {
      console.error(`Error updating config param ${req.params.name}:`, error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du paramètre de configuration' });
    }
});

/**
 * Exporte la configuration
 */
router.get('/export', async (req, res) => {
  try {
    const configData = await ConfigService.exportConfig();
    
    // Définir les en-têtes de téléchargement
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=config-export.json');
    
    res.send(configData);
  } catch (error) {
    console.error('Error exporting configuration:', error);
    res.status(500).json({ message: 'Erreur lors de l\'exportation de la configuration' });
  }
});

/**
 * Importe une configuration
 */
router.post('/import', upload.single('configFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Fichier de configuration requis' });
    }

    const fileBuffer = req.file.buffer;
    
    try {
      const configData = JSON.parse(fileBuffer.toString());
      const updatedConfig = await ConfigService.importConfig(configData);
      res.json(updatedConfig);
    } catch (parseError) {
      console.error('Error parsing config file:', parseError);
      res.status(400).json({ message: 'Le fichier de configuration n\'est pas un JSON valide' });
    }
  } catch (error) {
    console.error('Error importing configuration:', error);
    res.status(500).json({ message: 'Erreur lors de l\'importation de la configuration' });
  }
});

/**
 * Vérifie si le mode maintenance est actif
 */
router.get('/maintenance', async (req, res) => {
  try {
    const isMaintenanceMode = await ConfigService.isMaintenanceMode();
    res.json({ maintenance: isMaintenanceMode });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du mode maintenance' });
  }
});

/**
 * Active ou désactive le mode maintenance
 */
router.post('/maintenance',
  body('active').isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const config = await ConfigService.toggleMaintenanceMode(req.body.active);
      res.json(config);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      res.status(500).json({ message: 'Erreur lors du changement du mode maintenance' });
    }
});

module.exports = router;