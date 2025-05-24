// SystemConfiguration.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, TextField, FormControl, 
  InputLabel, Select, MenuItem, Button, FormControlLabel,
  Switch
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { ConfigService } from '../../services/ConfigService';

interface SystemConfigProps {
  showNotification: (message: string, severity?: string) => void;
}

interface ConfigData {
  appName: string;
  maxUsersPerCompany: number;
  maxCandidatsPerOffre: number;
  dureeMaxEntretien: number;
  notificationsEmail: boolean;
  maintenance: boolean;
  debug: boolean;
  logLevel: string;
  deleteInactiveAccounts: number;
  backupFrequency: string;
  language: string;
  timezone: string;
}

const SystemConfiguration: React.FC<SystemConfigProps> = ({ showNotification }) => {
  const [config, setConfig] = useState<ConfigData>({
    appName: "AI Recruitment Platform",
    maxUsersPerCompany: 10,
    maxCandidatsPerOffre: 50,
    dureeMaxEntretien: 30,
    notificationsEmail: true,
    maintenance: false,
    debug: false,
    logLevel: "warning",
    deleteInactiveAccounts: 90,
    backupFrequency: "daily",
    language: "fr",
    timezone: "Europe/Paris"
  });
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const configData = await ConfigService.getSystemConfig();
      setConfig(configData);
      setLoading(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching system configuration:', error);
      showNotification('Erreur lors du chargement de la configuration système', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string | number;
    
    setConfig({
      ...config,
      [name]: value
    });
    setHasChanges(true);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setConfig({
      ...config,
      [name]: checked
    });
    setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    try {
      await ConfigService.updateSystemConfig(config);
      showNotification("Configuration système enregistrée avec succès", "success");
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving system configuration:', error);
      showNotification('Erreur lors de l\'enregistrement de la configuration', 'error');
    }
  };

  const handleResetConfig = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la configuration aux valeurs par défaut ?")) {
      try {
        const defaultConfig = await ConfigService.resetSystemConfig();
        setConfig(defaultConfig);
        showNotification("Configuration réinitialisée aux valeurs par défaut", "info");
        setHasChanges(false);
      } catch (error) {
        console.error('Error resetting configuration:', error);
        showNotification('Erreur lors de la réinitialisation de la configuration', 'error');
      }
    }
  };

  if (loading) {
    return <Typography>Chargement de la configuration...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Configuration du système</Typography>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">Paramètres généraux</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom de l'application"
              name="appName"
              value={config.appName}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="language-label">Langue par défaut</InputLabel>
              <Select
                labelId="language-label"
                name="language"
                value={config.language}
                onChange={handleInputChange}
                label="Langue par défaut"
              >
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="en">Anglais</MenuItem>
                <MenuItem value="es">Espagnol</MenuItem>
                <MenuItem value="de">Allemand</MenuItem>
                <MenuItem value="ar">Arabe</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="timezone-label">Fuseau horaire</InputLabel>
              <Select
                labelId="timezone-label"
                name="timezone"
                value={config.timezone}
                onChange={handleInputChange}
                label="Fuseau horaire"
              >
                <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                <MenuItem value="Europe/London">Europe/London</MenuItem>
                <MenuItem value="America/New_York">America/New_York</MenuItem>
                <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
                <MenuItem value="Africa/Tunis">Africa/Tunis</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.notificationsEmail}
                  onChange={handleSwitchChange}
                  name="notificationsEmail"
                  color="primary"
                />
              }
              label="Activer les notifications par email"
              className="form-switch"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">Limites et quotas</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Utilisateurs max par entreprise"
              name="maxUsersPerCompany"
              type="number"
              value={config.maxUsersPerCompany}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Candidatures max par offre"
              name="maxCandidatsPerOffre"
              type="number"
              value={config.maxCandidatsPerOffre}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Durée max entretien (minutes)"
              name="dureeMaxEntretien"
              type="number"
              value={config.dureeMaxEntretien}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Supprimer comptes inactifs après (jours)"
              name="deleteInactiveAccounts"
              type="number"
              value={config.deleteInactiveAccounts}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="backup-label">Fréquence des sauvegardes</InputLabel>
              <Select
                labelId="backup-label"
                name="backupFrequency"
                value={config.backupFrequency}
                onChange={handleInputChange}
                label="Fréquence des sauvegardes"
              >
                <MenuItem value="hourly">Toutes les heures</MenuItem>
                <MenuItem value="daily">Quotidienne</MenuItem>
                <MenuItem value="weekly">Hebdomadaire</MenuItem>
                <MenuItem value="monthly">Mensuelle</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">Maintenance et debug</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.maintenance}
                  onChange={handleSwitchChange}
                  name="maintenance"
                  color="warning"
                />
              }
              label="Mode maintenance (plateforme hors ligne)"
              className="form-switch"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.debug}
                  onChange={handleSwitchChange}
                  name="debug"
                  color="primary"
                />
              }
              label="Mode debug"
              className="form-switch"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="log-level-label">Niveau de journalisation</InputLabel>
              <Select
                labelId="log-level-label"
                name="logLevel"
                value={config.logLevel}
                onChange={handleInputChange}
                label="Niveau de journalisation"
              >
                <MenuItem value="debug">Debug</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Box className="action-buttons-container">
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleResetConfig}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Réinitialiser
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveConfig}
          startIcon={<SaveIcon />}
          disabled={loading || !hasChanges}
        >
          Enregistrer les modifications
        </Button>
      </Box>
    </Box>
  );
};

export default SystemConfiguration;