// AdminController.js (Node.js/Express)
const express = require('express');
const router = express.Router();
const AdminService = require('../services/AdminService');
const UserService = require('../services/UserService');
const ConfigService = require('../services/ConfigService');
const AIService = require('../services/AIService');
const ContentService = require('../services/ContentService');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminRole');
const { validationResult, body, param } = require('express-validator');

// Middleware pour vérifier les droits d'administration
router.use(auth, admin);

/**
 * Récupère les données pour le tableau de bord admin
 */
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await AdminService.getDashboardStats();
    const recentActivities = await AdminService.getRecentActivities(5);
    const systemAlerts = await AdminService.getSystemAlerts();

    res.json({
      stats,
      recentActivities,
      systemAlerts
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données du tableau de bord' });
  }
});

/**
 * Récupère la liste des activités récentes
 */
router.get('/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await AdminService.getRecentActivities(limit);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des activités' });
  }
});

/**
 * Récupère les alertes système
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await AdminService.getSystemAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des alertes système' });
  }
});

/**
 * Rafraîchit les alertes système
 */
router.post('/alerts/refresh', async (req, res) => {
  try {
    const alerts = await AdminService.refreshSystemAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error refreshing system alerts:', error);
    res.status(500).json({ message: 'Erreur lors du rafraîchissement des alertes système' });
  }
});

/**
 * Récupère les statistiques
 */
router.get('/statistics', async (req, res) => {
  try {
    const period = req.query.period || 'all';
    const statistics = await AdminService.getStatistics(period);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * Exporte les statistiques
 */
router.get('/statistics/export', async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const statistics = await AdminService.exportStatistics(format);
    
    // Définir les en-têtes de téléchargement
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=statistics.${format}`);
    
    res.send(statistics);
  } catch (error) {
    console.error('Error exporting statistics:', error);
    res.status(500).json({ message: 'Erreur lors de l\'exportation des statistiques' });
  }
});

/**
 * Génère un rapport
 */
router.post('/reports/generate', 
  body('reportType').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { reportType } = req.body;
      const report = await AdminService.generateReport(reportType);
      
      // Définir les en-têtes de téléchargement
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.pdf`);
      
      res.send(report);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
    }
});

/**
 * Récupère les métriques de surveillance
 */
router.get('/monitoring/metrics', async (req, res) => {
  try {
    const metrics = await AdminService.getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching monitoring metrics:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des métriques de surveillance' });
  }
});

/**
 * Récupère les logs système
 */
router.get('/monitoring/logs', async (req, res) => {
  try {
    const level = req.query.level || 'all';
    const limit = parseInt(req.query.limit) || 100;
    const logs = await AdminService.getSystemLogs(level, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des logs système' });
  }
});

// Routes pour la gestion des utilisateurs
router.use('/users', require('./UserController'));

// Routes pour la configuration système
router.use('/config', require('./ConfigController'));

// Routes pour les paramètres IA
router.use('/ai', require('./AIController'));

// Routes pour la gestion du contenu
router.use('/content', require('./ContentController'));

module.exports = router;