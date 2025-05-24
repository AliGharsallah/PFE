// AIController.js (Node.js/Express)
const express = require('express');
const router = express.Router();
const AIService = require('../services/AIService');
const { validationResult, body, param } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminRole');

// Middleware pour vérifier les droits d'administration
router.use(auth, admin);

/**
 * Récupère les paramètres IA
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await AIService.getAISettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paramètres IA' });
  }
});

/**
 * Met à jour les paramètres IA
 */
router.put('/settings', async (req, res) => {
  try {
    // Validation des données
    const settings = req.body;
    
    // Vérification des types et des plages de valeurs
    // CodeLlama
    if (!['CodeLlama-7B', 'CodeLlama-13B', 'CodeLlama-34B', 'CodeLlama-70B'].includes(settings.codeLlamaModel)) {
      return res.status(400).json({ message: 'Modèle CodeLlama invalide' });
    }
    
    if (typeof settings.codeLlamaVersion !== 'string' || settings.codeLlamaVersion.trim() === '') {
      return res.status(400).json({ message: 'Version CodeLlama invalide' });
    }
    
    if (typeof settings.codeLlamaTemp !== 'number' || settings.codeLlamaTemp < 0 || settings.codeLlamaTemp > 1) {
      return res.status(400).json({ message: 'La température doit être un nombre entre 0 et 1' });
    }
    
    if (typeof settings.codeLlamaMaxTokens !== 'number' || settings.codeLlamaMaxTokens <= 0) {
      return res.status(400).json({ message: 'Le nombre maximum de tokens doit être un nombre positif' });
    }
    
    // LLaMA3
    if (!['LLaMA-7B', 'LLaMA-13B', 'LLaMA-70B', 'LLaMA-140B'].includes(settings.llama3Model)) {
      return res.status(400).json({ message: 'Modèle LLaMA3 invalide' });
    }
    
    if (typeof settings.llama3Version !== 'string' || settings.llama3Version.trim() === '') {
      return res.status(400).json({ message: 'Version LLaMA3 invalide' });
    }
    
    if (typeof settings.llama3Temp !== 'number' || settings.llama3Temp < 0 || settings.llama3Temp > 1) {
      return res.status(400).json({ message: 'La température doit être un nombre entre 0 et 1' });
    }
    
    if (typeof settings.llama3MaxTokens !== 'number' || settings.llama3MaxTokens <= 0) {
      return res.status(400).json({ message: 'Le nombre maximum de tokens doit être un nombre positif' });
    }
    
    // IABotVideo
    if (!['EmotionAI-v1', 'EmotionAI-v2', 'EmotionAI-Pro'].includes(settings.iaBotVideoModel)) {
      return res.status(400).json({ message: 'Modèle IABotVideo invalide' });
    }
    
    if (typeof settings.iaBotVideoVersion !== 'string' || settings.iaBotVideoVersion.trim() === '') {
      return res.status(400).json({ message: 'Version IABotVideo invalide' });
    }
    
    if (typeof settings.iaBotVideoSensitivity !== 'number' || settings.iaBotVideoSensitivity < 0 || settings.iaBotVideoSensitivity > 1) {
      return res.status(400).json({ message: 'La sensibilité doit être un nombre entre 0 et 1' });
    }
    
    // Seuils d'évaluation
    if (typeof settings.seuilTechnique !== 'number' || settings.seuilTechnique < 0 || settings.seuilTechnique > 1) {
      return res.status(400).json({ message: 'Le seuil technique doit être un nombre entre 0 et 1' });
    }
    
    if (typeof settings.seuilPsychologique !== 'number' || settings.seuilPsychologique < 0 || settings.seuilPsychologique > 1) {
      return res.status(400).json({ message: 'Le seuil psychologique doit être un nombre entre 0 et 1' });
    }
    
    if (typeof settings.seuilEntretien !== 'number' || settings.seuilEntretien < 0 || settings.seuilEntretien > 1) {
      return res.status(400).json({ message: 'Le seuil d\'entretien doit être un nombre entre 0 et 1' });
    }
    
    // Intégrations
    if (typeof settings.enableCodeEvaluation !== 'boolean') {
      return res.status(400).json({ message: 'Le paramètre enableCodeEvaluation doit être un booléen' });
    }
    
    if (typeof settings.enableEmotionDetection !== 'boolean') {
      return res.status(400).json({ message: 'Le paramètre enableEmotionDetection doit être un booléen' });
    }
    
    if (typeof settings.enableLanguageAnalysis !== 'boolean') {
      return res.status(400).json({ message: 'Le paramètre enableLanguageAnalysis doit être un booléen' });
    }
    
    // Validation réussie, mettre à jour les paramètres
    const updatedSettings = await AIService.updateAISettings(settings);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating AI settings:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres IA' });
  }
});

/**
 * Réinitialise les paramètres IA aux valeurs par défaut
 */
router.post('/settings/reset', async (req, res) => {
  try {
    const defaultSettings = await AIService.resetAISettings();
    res.json(defaultSettings);
  } catch (error) {
    console.error('Error resetting AI settings:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation des paramètres IA' });
  }
});

/**
 * Récupère les informations sur un modèle IA spécifique
 */
router.get('/models/:name',
  param('name').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const modelInfo = await AIService.getModelInfo(req.params.name);
      if (!modelInfo) {
        return res.status(404).json({ message: 'Modèle IA non trouvé' });
      }
      res.json(modelInfo);
    } catch (error) {
      console.error(`Error getting model info for ${req.params.name}:`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération des informations du modèle' });
    }
});

/**
 * Récupère la liste de tous les modèles IA disponibles
 */
router.get('/models', async (req, res) => {
  try {
    const models = await AIService.getAllModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching all models:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des modèles IA' });
  }
});

/**
 * Récupère les métriques de performance IA
 */
router.get('/metrics', async (req, res) => {
  try {
    const modelName = req.query.model;
    const period = req.query.period || 'month';
    
    const metrics = await AIService.getAIPerformanceMetrics(modelName, period);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching AI performance metrics:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des métriques de performance IA' });
  }
});

/**
 * Vérifie l'état de santé des services IA
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await AIService.checkAIHealth();
    res.json(healthStatus);
  } catch (error) {
    console.error('Error checking AI health:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification de l\'état des services IA' });
  }
});

/**
 * Rafraîchit le cache des modèles IA
 */
router.post('/refresh-cache', async (req, res) => {
  try {
    const modelName = req.query.model;
    const result = await AIService.refreshModelCache(modelName);
    res.json(result);
  } catch (error) {
    console.error('Error refreshing model cache:', error);
    res.status(500).json({ message: 'Erreur lors du rafraîchissement du cache des modèles IA' });
  }
});

/**
 * Teste un modèle IA avec des données d'exemple
 */
router.post('/test/:modelName',
  param('modelName').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const testData = req.body;
      const result = await AIService.testModel(req.params.modelName, testData);
      res.json(result);
    } catch (error) {
      console.error(`Error testing model ${req.params.modelName}:`, error);
      res.status(500).json({ message: 'Erreur lors du test du modèle IA' });
    }
});

/**
 * Récupère les données d'entraînement recommandées
 */
router.get('/training-recommendations', async (req, res) => {
  try {
    const recommendations = await AIService.getTrainingRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching training recommendations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des recommandations d\'entraînement' });
  }
});

module.exports = router;