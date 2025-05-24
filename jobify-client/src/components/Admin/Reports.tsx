// Reports.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, TextField,
  List, ListItem, ListItemText, ListItemIcon, Divider,
  Chip, Card, CardContent
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  DateRange as DateRangeIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';

// Importez le fichier CSS
import '../../Styles/Reports.css';

interface ReportsProps {
  showNotification: (message: string, severity?: string) => void;
}

interface Report {
  id: number;
  type: string;
  titre: string;
  description: string;
  dateGeneration: string;
  taille: string;
  format: string;
}

// Données de rapports simulées
const mockReports: Report[] = [
  { 
    id: 1, 
    type: "users", 
    titre: "Rapport des utilisateurs", 
    description: "Statistiques détaillées sur les utilisateurs de la plateforme.", 
    dateGeneration: "2025-05-10", 
    taille: "1.2 MB", 
    format: "PDF"
  },
  { 
    id: 2, 
    type: "jobs", 
    titre: "Rapport des offres d'emploi", 
    description: "Analyse des offres d'emploi publiées et des candidatures.", 
    dateGeneration: "2025-05-08", 
    taille: "945 KB", 
    format: "PDF"
  },
  { 
    id: 3, 
    type: "tests", 
    titre: "Rapport des tests techniques", 
    description: "Résultats et statistiques des tests techniques passés.", 
    dateGeneration: "2025-05-05", 
    taille: "1.5 MB", 
    format: "PDF"
  },
  { 
    id: 4, 
    type: "interviews", 
    titre: "Rapport des entretiens IA", 
    description: "Analyse des entretiens IA et des performances globales.", 
    dateGeneration: "2025-04-25", 
    taille: "2.1 MB", 
    format: "PDF"
  },
  { 
    id: 5, 
    type: "system", 
    titre: "Rapport d'utilisation du système", 
    description: "Métriques d'utilisation et performances de la plateforme.", 
    dateGeneration: "2025-04-20", 
    taille: "850 KB", 
    format: "PDF"
  }
];

// Types de rapports disponibles
const reportTypes = [
  { id: "users", name: "Utilisateurs", description: "Statistiques sur les utilisateurs (inscriptions, activité, répartition)" },
  { id: "jobs", name: "Offres d'emploi", description: "Données sur les offres publiées et les candidatures" },
  { id: "tests", name: "Tests techniques", description: "Résultats et analyse des tests techniques" },
  { id: "interviews", name: "Entretiens IA", description: "Performances et analyse des entretiens IA" },
  { id: "recruiter", name: "Recruteurs", description: "Activités et statistiques des recruteurs" },
  { id: "candidate", name: "Candidats", description: "Parcours et statistiques des candidats" },
  { id: "system", name: "Système", description: "Utilisation et performances de la plateforme" },
  { id: "custom", name: "Personnalisé", description: "Créer un rapport personnalisé" },
];

const Reports: React.FC<ReportsProps> = ({ showNotification }) => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [customOptions, setCustomOptions] = useState({
    includeUsers: true,
    includeJobs: true,
    includeTests: true,
    includeCharts: true
  });

  useEffect(() => {
    // Simuler le chargement des rapports récents
    setLoading(true);
    setTimeout(() => {
      setRecentReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const handleReportTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setReportType(event.target.value as string);
  };

  const handleDateRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDateRange(event.target.value as string);
  };

  const handleFormatChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormat(event.target.value as string);
  };

  const handleCustomOptionChange = (option: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomOptions({
      ...customOptions,
      [option]: event.target.checked
    });
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      showNotification("Veuillez sélectionner un type de rapport", "error");
      return;
    }
    
    setGenerating(true);
    
    // Simuler la génération d'un rapport
    setTimeout(() => {
      setGenerating(false);
      
      // Ajouter le nouveau rapport à la liste
      const newReport: Report = {
        id: Math.max(...recentReports.map(r => r.id)) + 1,
        type: reportType,
        titre: `Rapport ${reportTypes.find(r => r.id === reportType)?.name}`,
        description: `Rapport généré pour la période: ${getDateRangeText(dateRange)}`,
        dateGeneration: new Date().toISOString().split('T')[0],
        taille: `${Math.floor(Math.random() * 20) / 10 + 0.8} MB`,
        format: format.toUpperCase()
      };
      
      setRecentReports([newReport, ...recentReports]);
      showNotification("Rapport généré avec succès", "success");
    }, 2000);
  };

  const handleDownloadReport = (reportId: number) => {
    setLoading(true);
    
    // Simuler le téléchargement
    setTimeout(() => {
      setLoading(false);
      showNotification("Rapport téléchargé avec succès", "success");
    }, 1000);
  };

  // Fonction pour obtenir le texte de la période
  const getDateRangeText = (range: string): string => {
    switch (range) {
      case 'day':
        return "Aujourd'hui";
      case 'week':
        return "Cette semaine";
      case 'month':
        return "Ce mois-ci";
      case 'quarter':
        return "Ce trimestre";
      case 'year':
        return "Cette année";
      case 'all':
        return "Toutes les données";
      default:
        return range;
    }
  };

  return (
    <Box className="reports-container">
      <Box className="header-container">
        <Typography variant="h5" className="section-title">
          Génération de rapports
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Section de génération de rapports */}
        <Grid item xs={12} lg={6}>
          <Paper className="form-paper">
            <Typography variant="h6" className="subsection-title">
              Créer un nouveau rapport
            </Typography>
            
            <Grid container spacing={2} className="form-container">
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" className="form-field">
                  <InputLabel id="report-type-label">Type de rapport</InputLabel>
                  <Select
                    labelId="report-type-label"
                    value={reportType}
                    onChange={handleReportTypeChange}
                    label="Type de rapport"
                    disabled={generating}
                  >
                    <MenuItem value="">Sélectionnez un type</MenuItem>
                    {reportTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {reportType && (
                <>
                  <Grid item xs={12}>
                    <Typography className="type-description">
                      {reportTypes.find(t => t.id === reportType)?.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" className="form-field">
                      <InputLabel id="date-range-label">Période</InputLabel>
                      <Select
                        labelId="date-range-label"
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        label="Période"
                        disabled={generating}
                        startAdornment={<DateRangeIcon className="select-icon" />}
                      >
                        <MenuItem value="day">Aujourd'hui</MenuItem>
                        <MenuItem value="week">Cette semaine</MenuItem>
                        <MenuItem value="month">Ce mois-ci</MenuItem>
                        <MenuItem value="quarter">Ce trimestre</MenuItem>
                        <MenuItem value="year">Cette année</MenuItem>
                        <MenuItem value="all">Toutes les données</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" className="form-field">
                      <InputLabel id="format-label">Format</InputLabel>
                      <Select
                        labelId="format-label"
                        value={format}
                        onChange={handleFormatChange}
                        label="Format"
                        disabled={generating}
                      >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="excel">Excel</MenuItem>
                        <MenuItem value="csv">CSV</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {reportType === 'custom' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" className="custom-options-title">
                        Options personnalisées
                      </Typography>
                      <Grid container spacing={1} className="custom-options">
                        {/* Ici vous pouvez ajouter des checkboxes pour personnaliser le rapport */}
                      </Grid>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} className="action-container">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateReport}
                      disabled={generating || !reportType}
                      className="generate-button"
                      startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <DescriptionIcon />}
                    >
                      {generating ? "Génération en cours..." : "Générer le rapport"}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Section rapports récents */}
        <Grid item xs={12} lg={6}>
          <Paper className="reports-list-paper">
            <Typography variant="h6" className="subsection-title">
              Rapports récents
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : recentReports.length > 0 ? (
              <List className="reports-list">
                {recentReports.map((report) => (
                  <React.Fragment key={report.id}>
                    <ListItem className="report-item">
                      <ListItemIcon className="report-icon">
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={report.titre}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" className="report-description">
                              {report.description}
                            </Typography>
                            <Box className="report-meta">
                              <Typography component="span" variant="caption" className="report-date">
                                <HistoryIcon fontSize="small" /> {report.dateGeneration}
                              </Typography>
                              <Chip 
                                label={report.format} 
                                size="small" 
                                className="format-chip"
                                icon={<BookmarkIcon />}
                              />
                              <Typography component="span" variant="caption" className="report-size">
                                {report.taille}
                              </Typography>
                            </Box>
                          </React.Fragment>
                        }
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleDownloadReport(report.id)}
                        className="download-button"
                        startIcon={<DownloadIcon />}
                      >
                        Télécharger
                      </Button>
                    </ListItem>
                    <Divider component="li" className="list-divider" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box className="empty-list">
                <Typography color="textSecondary">
                  Aucun rapport généré récemment
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Section des rapports planifiés */}
      <Grid container spacing={3} className="scheduled-reports-container">
        <Grid item xs={12}>
          <Paper className="scheduled-reports-paper">
            <Typography variant="h6" className="subsection-title">
              Rapports programmés
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography className="info-text">
                  Configurez des rapports pour qu'ils soient générés automatiquement selon une planification.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card className="scheduled-card">
                  <CardContent>
                    <Box className="scheduled-header">
                      <Typography className="scheduled-title">
                        Rapport utilisateurs hebdomadaire
                      </Typography>
                      <Chip 
                        label="Actif" 
                        size="small" 
                        className="status-chip status-active"
                      />
                    </Box>
                    <Typography className="scheduled-description">
                      Génère automatiquement un rapport des utilisateurs chaque lundi à 8h00.
                    </Typography>
                    <Box className="scheduled-actions">
                      <Button size="small" color="primary">Modifier</Button>
                      <Button size="small" color="secondary">Désactiver</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card className="scheduled-card">
                  <CardContent>
                    <Box className="scheduled-header">
                      <Typography className="scheduled-title">
                        Rapport statistiques mensuel
                      </Typography>
                      <Chip 
                        label="Actif" 
                        size="small" 
                        className="status-chip status-active"
                      />
                    </Box>
                    <Typography className="scheduled-description">
                      Génère un rapport complet des statistiques le 1er de chaque mois.
                    </Typography>
                    <Box className="scheduled-actions">
                      <Button size="small" color="primary">Modifier</Button>
                      <Button size="small" color="secondary">Désactiver</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} className="action-container">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<DescriptionIcon />}
                  className="add-scheduled-button"
                >
                  Ajouter un rapport programmé
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;