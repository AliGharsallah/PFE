
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, TextField, FormControl, 
  InputLabel, Select, MenuItem, Button, FormControlLabel,
  Switch
} from '@mui/material';
import { Grid } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { AIService } from '../../services/AIService';
import '../../Styles/AISettings.css';
interface AISettingsProps {
  showNotification: (message: string, severity?: string) => void;
}

interface AISettingsData {
  // CodeLlama
  codeLlamaModel: string;
  codeLlamaVersion: string;
  codeLlamaTemp: number;
  codeLlamaMaxTokens: number;
  
  // LLaMA3
  llama3Model: string;
  llama3Version: string;
  llama3Temp: number;
  llama3MaxTokens: number;
  
  // IABotVideo
  iaBotVideoModel: string;
  iaBotVideoVersion: string;
  iaBotVideoSensitivity: number;
  
  // Seuils d'évaluation
  seuilTechnique: number;
  seuilPsychologique: number;
  seuilEntretien: number;
  
  // Intégrations
  enableCodeEvaluation: boolean;
  enableEmotionDetection: boolean;
  enableLanguageAnalysis: boolean;
}

const AISettings: React.FC<AISettingsProps> = ({ showNotification }) => {
  const [aiSettings, setAiSettings] = useState<AISettingsData>({
    // CodeLlama
    codeLlamaModel: "CodeLlama-34B",
    codeLlamaVersion: "3.0",
    codeLlamaTemp: 0.7,
    codeLlamaMaxTokens: 2048,
    
    // LLaMA3
    llama3Model: "LLaMA-70B",
    llama3Version: "3.1",
    llama3Temp: 0.8,
    llama3MaxTokens: 4096,
    
    // IABotVideo
    iaBotVideoModel: "EmotionAI-v2",
    iaBotVideoVersion: "2.5",
    iaBotVideoSensitivity: 0.75,
    
    // Seuils d'évaluation
    seuilTechnique: 0.65,
    seuilPsychologique: 0.70,
    seuilEntretien: 0.75,
    
    // Intégrations
    enableCodeEvaluation: true,
    enableEmotionDetection: true,
    enableLanguageAnalysis: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAISettings();
  }, []);

  const fetchAISettings = async () => {
    try {
      setLoading(true);
      const settings = await AIService.getAISettings();
      setAiSettings(settings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      showNotification('Erreur lors du chargement des paramètres IA', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string | number;

    setAiSettings({
      ...aiSettings,
      [name]: name.includes('seuil') || name.includes('Temp') || name.includes('Sensitivity') ? 
        parseFloat(value as string) : value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAiSettings({
      ...aiSettings,
      [name]: checked
    });
  };

  const handleSaveSettings = async () => {
    try {
      await AIService.updateAISettings(aiSettings);
      showNotification("Paramètres IA enregistrés avec succès", "success");
    } catch (error) {
      console.error('Error saving AI settings:', error);
      showNotification('Erreur lors de l\'enregistrement des paramètres IA', 'error');
    }
  };

  if (loading) {
    return <Typography>Chargement des paramètres IA...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Paramètres des modèles IA</Typography>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">CodeLlama (Évaluation technique)</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="code-llama-model-label">Modèle</InputLabel>
              <Select
                labelId="code-llama-model-label"
                name="codeLlamaModel"
                value={aiSettings.codeLlamaModel}
                onChange={handleInputChange}
                label="Modèle"
              >
                <MenuItem value="CodeLlama-7B">CodeLlama-7B</MenuItem>
                <MenuItem value="CodeLlama-13B">CodeLlama-13B</MenuItem>
                <MenuItem value="CodeLlama-34B">CodeLlama-34B</MenuItem>
                <MenuItem value="CodeLlama-70B">CodeLlama-70B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Version"
              name="codeLlamaVersion"
              value={aiSettings.codeLlamaVersion}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Température (0-1)"
              name="codeLlamaTemp"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              value={aiSettings.codeLlamaTemp}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tokens max"
              name="codeLlamaMaxTokens"
              type="number"
              value={aiSettings.codeLlamaMaxTokens}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiSettings.enableCodeEvaluation}
                  onChange={handleSwitchChange}
                  name="enableCodeEvaluation"
                  color="primary"
                />
              }
              label="Activer l'évaluation automatique de code"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">LLaMA3 (Évaluation psychologique)</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="llama3-model-label">Modèle</InputLabel>
              <Select
                labelId="llama3-model-label"
                name="llama3Model"
                value={aiSettings.llama3Model}
                onChange={handleInputChange}
                label="Modèle"
              >
                <MenuItem value="LLaMA-7B">LLaMA-7B</MenuItem>
                <MenuItem value="LLaMA-13B">LLaMA-13B</MenuItem>
                <MenuItem value="LLaMA-70B">LLaMA-70B</MenuItem>
                <MenuItem value="LLaMA-140B">LLaMA-140B</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Version"
              name="llama3Version"
              value={aiSettings.llama3Version}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Température (0-1)"
              name="llama3Temp"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              value={aiSettings.llama3Temp}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tokens max"
              name="llama3MaxTokens"
              type="number"
              value={aiSettings.llama3MaxTokens}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiSettings.enableLanguageAnalysis}
                  onChange={handleSwitchChange}
                  name="enableLanguageAnalysis"
                  color="primary"
                />
              }
              label="Activer l'analyse linguistique avancée"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">IABotVideo (Entretien vidéo)</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" className="form-field">
              <InputLabel id="iabotvideo-model-label">Modèle</InputLabel>
              <Select
                labelId="iabotvideo-model-label"
                name="iaBotVideoModel"
                value={aiSettings.iaBotVideoModel}
                onChange={handleInputChange}
                label="Modèle"
              >
                <MenuItem value="EmotionAI-v1">EmotionAI-v1</MenuItem>
                <MenuItem value="EmotionAI-v2">EmotionAI-v2</MenuItem>
                <MenuItem value="EmotionAI-Pro">EmotionAI-Pro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Version"
              name="iaBotVideoVersion"
              value={aiSettings.iaBotVideoVersion}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Sensibilité détection (0-1)"
              name="iaBotVideoSensitivity"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.05 }}
              value={aiSettings.iaBotVideoSensitivity}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={aiSettings.enableEmotionDetection}
                  onChange={handleSwitchChange}
                  name="enableEmotionDetection"
                  color="primary"
                />
              }
              label="Activer la détection des émotions"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} className="paper-section">
        <Typography variant="h6" className="section-title">Seuils d'évaluation</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Seuil de réussite test technique"
              name="seuilTechnique"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.05 }}
              value={aiSettings.seuilTechnique}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Seuil de réussite test psychologique"
              name="seuilPsychologique"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.05 }}
              value={aiSettings.seuilPsychologique}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Seuil de réussite entretien"
              name="seuilEntretien"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.05 }}
              value={aiSettings.seuilEntretien}
              onChange={handleInputChange}
              variant="outlined"
              className="form-field"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box className="action-buttons-container">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveSettings}
          startIcon={<SaveIcon />}
        >
          Enregistrer les paramètres IA
        </Button>
      </Box>
    </Box>
  );
};

export default AISettings;