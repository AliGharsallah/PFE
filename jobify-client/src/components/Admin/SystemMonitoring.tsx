// SystemMonitoring.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Chip, Tabs, Tab, IconButton, Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  SettingsEthernet as NetworkIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip as RechartsTooltip } from 'recharts';

// Importez le fichier CSS
import '../../Styles/SystemMonitoring.css';

interface SystemMonitoringProps {
  showNotification: (message: string, severity?: string) => void;
}

// Données simulées pour les métriques système
const lastHourData = Array(60).fill(0).map((_, i) => ({
  time: i,
  cpu: Math.floor(Math.random() * 40) + 20,
  memory: Math.floor(Math.random() * 30) + 40,
  network: Math.floor(Math.random() * 50) + 10,
}));

// Données simulées pour les logs système
const mockLogs = [
  { id: 1, level: 'error', message: 'Échec de la connexion à la base de données', timestamp: '2025-05-18 10:15:22', source: 'Database', user: 'System' },
  { id: 2, level: 'warning', message: 'Tentative de connexion échouée', timestamp: '2025-05-18 09:30:15', source: 'Auth', user: 'candidate@example.com' },
  { id: 3, level: 'info', message: 'Mise à jour du modèle LLaMA3 effectuée', timestamp: '2025-05-18 08:45:03', source: 'AIManager', user: 'System' },
  { id: 4, level: 'warning', message: 'Utilisation CPU élevée (85%)', timestamp: '2025-05-18 08:20:45', source: 'SystemMonitor', user: 'System' },
  { id: 5, level: 'info', message: 'Sauvegarde quotidienne terminée', timestamp: '2025-05-18 03:00:12', source: 'Backup', user: 'System' },
  { id: 6, level: 'error', message: 'Échec de génération du rapport utilisateurs', timestamp: '2025-05-17 18:42:30', source: 'ReportGenerator', user: 'admin@example.com' },
  { id: 7, level: 'info', message: 'Nouvel utilisateur inscrit', timestamp: '2025-05-17 16:15:22', source: 'Auth', user: 'candidate@example.com' },
  { id: 8, level: 'info', message: 'Nouvelle offre publiée', timestamp: '2025-05-17 15:20:19', source: 'JobManager', user: 'recruiter@company.com' },
  { id: 9, level: 'warning', message: 'API externe non disponible', timestamp: '2025-05-17 14:05:51', source: 'ExternalAPI', user: 'System' },
  { id: 10, level: 'error', message: 'Erreur lors de l\'envoi d\'email', timestamp: '2025-05-17 12:30:08', source: 'EmailService', user: 'System' },
];

// Données simulées pour l'état du système
const mockSystemStatus = {
  uptime: '15 jours 7 heures',
  version: 'v2.5.0',
  cpu: 48,
  memory: 62,
  disk: 35,
  network: 22,
  requests: 1250,
  activeUsers: 32,
  databaseSize: '4.7 GB',
  lastBackup: '2025-05-18 03:00:10',
  status: 'online'
};

// Données simulées pour les services
const mockServices = [
  { id: 1, name: 'Application Web', status: 'online', cpu: 25, memory: 750, uptime: '15j 7h' },
  { id: 2, name: 'API Backend', status: 'online', cpu: 32, memory: 950, uptime: '15j 7h' },
  { id: 3, name: 'Base de données', status: 'online', cpu: 18, memory: 1200, uptime: '15j 7h' },
  { id: 4, name: 'Service Email', status: 'online', cpu: 5, memory: 120, uptime: '15j 7h' },
  { id: 5, name: 'IA CodeLlama', status: 'online', cpu: 45, memory: 1800, uptime: '10j 3h' },
  { id: 6, name: 'IA LLaMA3', status: 'online', cpu: 40, memory: 2200, uptime: '10j 3h' },
  { id: 7, name: 'Service Vidéo', status: 'warning', cpu: 75, memory: 980, uptime: '5j 12h' },
];

const SystemMonitoring: React.FC<SystemMonitoringProps> = ({ showNotification }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('hour');
  const [logLevel, setLogLevel] = useState('all');
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    // Simuler le chargement des données
    setLoading(true);
    setTimeout(() => {
      setMetrics(lastHourData);
      setLogs(mockLogs);
      setServices(mockServices);
      setSystemStatus(mockSystemStatus);
      setLoading(false);
    }, 1500);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simuler le rafraîchissement des données
    setTimeout(() => {
      // Générer de nouvelles données de métriques aléatoires
      const newMetrics = Array(60).fill(0).map((_, i) => ({
        time: i,
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        network: Math.floor(Math.random() * 50) + 10,
      }));
      
      setMetrics(newMetrics);
      
      // Ajouter un nouveau log
      const newLog = {
        id: Math.max(...logs.map(log => log.id)) + 1,
        level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
        message: 'Données système rafraîchies',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        source: 'SystemMonitor',
        user: 'Admin'
      };
      
      setLogs([newLog, ...logs]);
      
      // Mettre à jour l'utilisation CPU/mémoire des services
      const updatedServices = services.map(service => ({
        ...service,
        cpu: Math.min(95, Math.floor(Math.random() * 20) + service.cpu - 10),
        memory: Math.floor(Math.random() * 100) + service.memory - 50
      }));
      
      setServices(updatedServices);
      
      // Mettre à jour le statut système
      setSystemStatus({
        ...systemStatus,
        cpu: Math.floor(Math.random() * 20) + 40,
        memory: Math.floor(Math.random() * 15) + 55,
        requests: systemStatus.requests + Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 10) + 25
      });
      
      setRefreshing(false);
      showNotification("Données système rafraîchies", "success");
    }, 1000);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTimeRange(event.target.value as string);
  };

  const handleLogLevelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLogLevel(event.target.value as string);
  };

  const handleClearLogs = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer tous les logs ?")) {
      setLogs([]);
      showNotification("Logs effacés avec succès", "success");
    }
  };

  const getFilteredLogs = () => {
    if (logLevel === 'all') {
      return logs;
    }
    return logs.filter(log => log.level === logLevel);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getResourceStatusColor = (percentage: number) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Chargement des données système...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="monitoring-container">
      <Box className="header-container">
        <Typography variant="h5" className="section-title">
          Surveillance du système
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          className="refresh-button"
        >
          {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
        </Button>
      </Box>
      
      {/* Vue d'ensemble du système */}
      <Grid container spacing={3} className="overview-container">
        <Grid item xs={12} md={6} lg={3}>
          <Card className="status-card">
            <CardContent>
              <Box className="status-header">
                <Typography className="status-title">
                  CPU
                </Typography>
                <MemoryIcon className="status-icon" />
              </Box>
              <Typography className="status-value">
                {systemStatus.cpu}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemStatus.cpu} 
                color={getResourceStatusColor(systemStatus.cpu)} 
                className="status-progress"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card className="status-card">
            <CardContent>
              <Box className="status-header">
                <Typography className="status-title">
                  Mémoire
                </Typography>
                <StorageIcon className="status-icon" />
              </Box>
              <Typography className="status-value">
                {systemStatus.memory}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={systemStatus.memory} 
                color={getResourceStatusColor(systemStatus.memory)} 
                className="status-progress"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card className="status-card">
            <CardContent>
              <Box className="status-header">
                <Typography className="status-title">
                  Utilisateurs actifs
                </Typography>
                <PersonIcon className="status-icon" />
              </Box>
              <Typography className="status-value">
                {systemStatus.activeUsers}
              </Typography>
              <Box className="status-details">
                <Typography className="status-subtitle">
                  Requêtes: {systemStatus.requests}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card className="status-card">
            <CardContent>
              <Box className="status-header">
                <Typography className="status-title">
                  État système
                </Typography>
                <SecurityIcon className="status-icon" />
              </Box>
              <Box className="status-chip-container">
                <Chip 
                  label={systemStatus.status === 'online' ? 'En ligne' : 'Hors ligne'} 
                  color={getStatusColor(systemStatus.status)} 
                  className="status-chip"
                />
              </Box>
              <Box className="status-details">
                <Typography className="status-subtitle">
                  Uptime: {systemStatus.uptime}
                </Typography>
                <Typography className="status-subtitle">
                  Version: {systemStatus.version}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Onglets */}
      <Paper className="tabs-paper">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className="monitoring-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Métriques" />
          <Tab label="Services" />
          <Tab label="Logs système" />
        </Tabs>
        
        {/* Onglet Métriques */}
        {tabValue === 0 && (
          <Box className="tab-content">
            <Box className="metrics-header">
              <FormControl variant="outlined" size="small" className="time-range-selector">
                <InputLabel id="time-range-label">Période</InputLabel>
                <Select
                  labelId="time-range-label"
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  label="Période"
                >
                  <MenuItem value="hour">Dernière heure</MenuItem>
                  <MenuItem value="day">Dernières 24h</MenuItem>
                  <MenuItem value="week">Dernière semaine</MenuItem>
                  <MenuItem value="month">Dernier mois</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className="chart-paper">
                  <Typography className="chart-title">
                    Utilisation des ressources
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Temps (minutes)', position: 'insideBottomRight', offset: -10 }} 
                      />
                      <YAxis label={{ value: 'Utilisation (%)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="cpu" 
                        stroke="#3498db" 
                        fill="#3498db" 
                        fillOpacity={0.2} 
                        name="CPU" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="memory" 
                        stroke="#9b59b6" 
                        fill="#9b59b6" 
                        fillOpacity={0.2} 
                        name="Mémoire" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="network" 
                        stroke="#2ecc71" 
                        fill="#2ecc71" 
                        fillOpacity={0.2} 
                        name="Réseau" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Onglet Services */}
        {tabValue === 1 && (
          <Box className="tab-content">
            <TableContainer component={Paper} className="services-table-container">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="table-header">Service</TableCell>
                    <TableCell className="table-header">Statut</TableCell>
                    <TableCell className="table-header">CPU</TableCell>
                    <TableCell className="table-header">Mémoire (MB)</TableCell>
                    <TableCell className="table-header">Uptime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={service.status} 
                          color={getStatusColor(service.status)} 
                          size="small" 
                          className="status-chip"
                        />
                      </TableCell>
                      <TableCell>
                        <Box className="resource-cell">
                          <Typography className="resource-value">
                            {service.cpu}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={service.cpu} 
                            color={getResourceStatusColor(service.cpu)} 
                            className="resource-progress"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{service.memory}</TableCell>
                      <TableCell>{service.uptime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {/* Onglet Logs système */}
        {tabValue === 2 && (
          <Box className="tab-content">
            <Box className="logs-header">
              <FormControl variant="outlined" size="small" className="log-level-selector">
                <InputLabel id="log-level-label">Niveau</InputLabel>
                <Select
                  labelId="log-level-label"
                  value={logLevel}
                  onChange={handleLogLevelChange}
                  label="Niveau"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleClearLogs}
                disabled={logs.length === 0}
                className="clear-logs-button"
              >
                Effacer les logs
              </Button>
            </Box>
            
            <TableContainer component={Paper} className="logs-table-container">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="table-header">Niveau</TableCell>
                    <TableCell className="table-header">Timestamp</TableCell>
                    <TableCell className="table-header">Message</TableCell>
                    <TableCell className="table-header">Source</TableCell>
                    <TableCell className="table-header">Utilisateur</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredLogs().length > 0 ? (
                    getFilteredLogs().map((log) => (
                      <TableRow key={log.id} hover className={`log-row log-${log.level}`}>
                        <TableCell>
                          <Box className="log-level">
                            {getLevelIcon(log.level)}
                            <Typography className="log-level-text">
                              {log.level}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell>{log.user}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="empty-logs">
                        {logs.length === 0 ? 'Aucun log disponible' : 'Aucun log correspondant au filtre'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SystemMonitoring;