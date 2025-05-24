// Statistics.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Download as DownloadIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Importez le fichier CSS
import '../../Styles/Statistics.css';

interface StatisticsProps {
  showNotification: (message: string, severity?: string) => void;
}

// Données de statistiques simulées
const mockUserGrowthData = [
  { name: 'Jan', nouveauxUtilisateurs: 25, cumul: 25 },
  { name: 'Fév', nouveauxUtilisateurs: 32, cumul: 57 },
  { name: 'Mar', nouveauxUtilisateurs: 41, cumul: 98 },
  { name: 'Avr', nouveauxUtilisateurs: 29, cumul: 127 },
  { name: 'Mai', nouveauxUtilisateurs: 18, cumul: 145 }
];

const mockApplicationsData = [
  { name: 'Jan', candidatures: 12, entretiens: 5 },
  { name: 'Fév', candidatures: 19, entretiens: 8 },
  { name: 'Mar', candidatures: 25, entretiens: 12 },
  { name: 'Avr', candidatures: 38, entretiens: 20 },
  { name: 'Mai', candidatures: 30, entretiens: 15 }
];

const mockPassRateData = [
  { name: 'Jan', technique: 68, psychologique: 72, entretien: 75 },
  { name: 'Fév', technique: 70, psychologique: 69, entretien: 78 },
  { name: 'Mar', technique: 72, psychologique: 75, entretien: 80 },
  { name: 'Avr', technique: 75, psychologique: 78, entretien: 82 },
  { name: 'Mai', technique: 73, psychologique: 76, entretien: 79 }
];

const mockUserTypesData = [
  { name: 'Candidats', value: 98, color: '#2ecc71' },
  { name: 'Recruteurs', value: 46, color: '#3498db' },
  { name: 'Admins', value: 1, color: '#9b59b6' }
];

const mockTestStatsData = {
  totalTests: 108,
  testsPasses: 67,
  testsEchoues: 41,
  tauxReussite: '62%',
  tempsMoyen: '28 min'
};

const mockJobStatsData = {
  totalOffres: 32,
  offresActives: 25,
  candidaturesMoyennes: 3.9,
  tauxConversion: '14%'
};

const Statistics: React.FC<StatisticsProps> = ({ showNotification }) => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPeriod(event.target.value as string);
    setLoading(true);
    
    // Simuler le chargement de nouvelles données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Simuler l'exportation des statistiques
    setTimeout(() => {
      showNotification('Statistiques exportées avec succès', 'success');
    }, 1000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Chargement des statistiques...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="statistics-container">
      <Box className="header-container">
        <Typography variant="h5" className="section-title">
          Statistiques de la plateforme
        </Typography>
        
        <Box className="header-actions">
          <FormControl variant="outlined" size="small" className="period-selector">
            <InputLabel id="period-label">Période</InputLabel>
            <Select
              labelId="period-label"
              value={period}
              onChange={handlePeriodChange}
              label="Période"
              startAdornment={<DateRangeIcon className="select-icon" />}
            >
              <MenuItem value="week">Semaine</MenuItem>
              <MenuItem value="month">Mois</MenuItem>
              <MenuItem value="quarter">Trimestre</MenuItem>
              <MenuItem value="year">Année</MenuItem>
              <MenuItem value="all">Tout</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            className="export-button"
          >
            Exporter
          </Button>
        </Box>
      </Box>
      
      {/* Cartes de statistiques */}
      <Grid container spacing={3} className="stat-cards-container">
        <Grid item xs={12} sm={6} lg={3}>
          <Paper className="stat-card">
            <Typography className="stat-card-title">Utilisateurs</Typography>
            <Typography className="stat-card-value">{145}</Typography>
            <Typography className="stat-card-subtitle">+18 ce mois-ci</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper className="stat-card">
            <Typography className="stat-card-title">Offres d'emploi</Typography>
            <Typography className="stat-card-value">{32}</Typography>
            <Typography className="stat-card-subtitle">25 actives</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper className="stat-card">
            <Typography className="stat-card-title">Candidatures</Typography>
            <Typography className="stat-card-value">{124}</Typography>
            <Typography className="stat-card-subtitle">+30 ce mois-ci</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper className="stat-card">
            <Typography className="stat-card-title">Tests</Typography>
            <Typography className="stat-card-value">{108}</Typography>
            <Typography className="stat-card-subtitle">Taux réussite: {mockTestStatsData.tauxReussite}</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Graphiques */}
      <Grid container spacing={3}>
        {/* Croissance utilisateurs */}
        <Grid item xs={12} lg={6}>
          <Paper className="chart-container">
            <Typography className="chart-title">Croissance des utilisateurs</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={mockUserGrowthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="nouveauxUtilisateurs" 
                  stroke="#3498db" 
                  strokeWidth={2}
                  name="Nouveaux utilisateurs"
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumul" 
                  stroke="#2ecc71" 
                  strokeWidth={2}
                  name="Total cumulé"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Répartition des utilisateurs */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper className="chart-container">
            <Typography className="chart-title">Répartition des utilisateurs</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockUserTypesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockUserTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} utilisateurs`, 'Nombre']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Tests et entretiens */}
        <Grid item xs={12} sm={6} lg={3}>
          <Paper className="stat-details-container">
            <Typography className="chart-title">Détails des tests</Typography>
            <Box className="stat-details">
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Tests passés</Typography>
                <Typography className="stat-detail-value">{mockTestStatsData.testsPasses}</Typography>
              </Box>
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Tests échoués</Typography>
                <Typography className="stat-detail-value">{mockTestStatsData.testsEchoues}</Typography>
              </Box>
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Taux de réussite</Typography>
                <Typography className="stat-detail-value success">{mockTestStatsData.tauxReussite}</Typography>
              </Box>
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Temps moyen</Typography>
                <Typography className="stat-detail-value">{mockTestStatsData.tempsMoyen}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Candidatures et entretiens */}
        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography className="chart-title">Candidatures et entretiens</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={mockApplicationsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="candidatures" fill="#3498db" name="Candidatures" />
                <Bar dataKey="entretiens" fill="#9b59b6" name="Entretiens" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Détails des offres */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="stat-details-container">
            <Typography className="chart-title">Détails des offres</Typography>
            <Box className="stat-details">
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Total offres</Typography>
                <Typography className="stat-detail-value">{mockJobStatsData.totalOffres}</Typography>
              </Box>
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Offres actives</Typography>
                <Typography className="stat-detail-value success">{mockJobStatsData.offresActives}</Typography>
              </Box>
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Candidatures/Offre</Typography>
                <Typography className="stat-detail-value">{mockJobStatsData.candidaturesMoyennes}</Typography>
              </Box>
              <Box className="stat-detail-item">
                <Typography className="stat-detail-label">Taux conversion</Typography>
                <Typography className="stat-detail-value">{mockJobStatsData.tauxConversion}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Taux de réussite */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="chart-container">
            <Typography className="chart-title">Taux de réussite (%)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={mockPassRateData}
                margin={{ top: 20, right: 5, left: 5, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="technique" stroke="#f39c12" name="Technique" />
                <Line type="monotone" dataKey="psychologique" stroke="#9b59b6" name="Psychologique" />
                <Line type="monotone" dataKey="entretien" stroke="#3498db" name="Entretien" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;