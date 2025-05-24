// DashboardOverview.tsx
import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, List, ListItem,
  ListItemText, ListItemSecondaryAction, Chip, CircularProgress
} from '@mui/material';
import { RefreshOutlined as RefreshIcon } from '@mui/icons-material';
import { AdminService } from '../../services/AdminService';
import '../../Styles/DashboardOverview.css'; // Assurez-vous que le chemin est correct
 // Assurez-vous que le chemin est correct

interface DashboardOverviewProps {
  showNotification: (message: string, severity?: string) => void;
}

interface DashboardStats {
  totalUsers: number;
  totalCandidats: number;
  totalRecruteurs: number;
  totalOffres: number;
  totalCandidatures: number;
  newUsersToday: number;
  newOffersToday: number;
  activeTests: number;
}

interface Activity {
  id: number;
  type: string;
  user: string;
  role: string;
  date: string;
}

interface SystemAlert {
  id: number;
  type: string;
  message: string;
  date: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ showNotification }) => {
  // Initialisation avec des valeurs par défaut
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCandidats: 0,
    totalRecruteurs: 0,
    totalOffres: 0,
    totalCandidatures: 0,
    newUsersToday: 0,
    newOffersToday: 0,
    activeTests: 0
  });

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Si l'API n'est pas encore disponible, utiliser des données de test
      let dashboardData;
      try {
        dashboardData = await AdminService.getDashboardOverview();
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        dashboardData = {
          stats: {
            totalUsers: 145,
            totalCandidats: 98,
            totalRecruteurs: 46,
            totalOffres: 32,
            totalCandidatures: 124,
            newUsersToday: 7,
            newOffersToday: 3,
            activeTests: 18
          },
          recentActivities: [
            { id: 1, type: "Inscription", user: "Jean Dupont", role: "Candidat", date: "2025-05-18 09:45" },
            { id: 2, type: "Offre créée", user: "Marie Curie", role: "Recruteur", date: "2025-05-17 16:32" },
            { id: 3, type: "Test passé", user: "Thomas Martin", role: "Candidat", date: "2025-05-17 14:25" },
            { id: 4, type: "Entretien IA", user: "Sophie Berger", role: "Candidat", date: "2025-05-17 11:10" },
            { id: 5, type: "Configuration mise à jour", user: "Admin Système", role: "Admin", date: "2025-05-16 17:05" }
          ],
          systemAlerts: [
            { id: 1, type: "warning", message: "Charge CPU élevée (78%)", date: "2025-05-18 10:15" },
            { id: 2, type: "error", message: "Échec de sauvegarde de la base de données", date: "2025-05-17 23:00" },
            { id: 3, type: "info", message: "Mise à jour du modèle LLaMA3 disponible", date: "2025-05-17 08:30" }
          ]
        };
      }
      
      if (dashboardData && dashboardData.stats) {
        setStats(dashboardData.stats);
      }
      
      if (dashboardData && dashboardData.recentActivities) {
        setRecentActivities(dashboardData.recentActivities);
      }
      
      if (dashboardData && dashboardData.systemAlerts) {
        setSystemAlerts(dashboardData.systemAlerts);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Erreur lors du chargement des données du tableau de bord', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fonction handleRefreshAlerts
  const handleRefreshAlerts = async () => {
    try {
      setLoading(true);
      
      // Si l'API n'est pas encore disponible, utiliser des données de test
      let refreshedAlerts;
      try {
        refreshedAlerts = await AdminService.refreshSystemAlerts();
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        refreshedAlerts = [
          { id: 1, type: "warning", message: "Charge CPU élevée (78%)", date: "2025-05-18 10:15" },
          { id: 2, type: "error", message: "Échec de sauvegarde de la base de données", date: "2025-05-17 23:00" },
          { id: 3, type: "info", message: "Mise à jour du modèle LLaMA3 disponible", date: "2025-05-17 08:30" },
          { id: 4, type: "info", message: "Nouvelles alertes rafraîchies", date: new Date().toLocaleString() }
        ];
      }
      
      setSystemAlerts(refreshedAlerts);
      showNotification('Alertes rafraîchies', 'info');
    } catch (error) {
      console.error('Error refreshing alerts:', error);
      showNotification('Erreur lors du rafraîchissement des alertes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Affichage d'un indicateur de chargement pendant le chargement initial
  if (loading && recentActivities.length === 0 && systemAlerts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des données...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Aperçu du système</Typography>
      
      {/* Statistiques principales */}
      <Grid container spacing={3} className="grid-container">
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} className="dashboard-paper">
            <Typography component="h2" variant="h6" className="card-heading">
              Utilisateurs
            </Typography>
            <Typography component="p" className="card-value">
              {stats?.totalUsers || 0}
            </Typography>
            <Typography className="card-subtitle">
              +{stats?.newUsersToday || 0} aujourd'hui
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} className="dashboard-paper">
            <Typography component="h2" variant="h6" className="card-heading">
              Offres d'emploi
            </Typography>
            <Typography component="p" className="card-value">
              {stats?.totalOffres || 0}
            </Typography>
            <Typography className="card-subtitle">
              +{stats?.newOffersToday || 0} aujourd'hui
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} className="dashboard-paper">
            <Typography component="h2" variant="h6" className="card-heading">
              Candidatures
            </Typography>
            <Typography component="p" className="card-value">
              {stats?.totalCandidatures || 0}
            </Typography>
            <Typography className="card-subtitle">
              {stats?.activeTests || 0} tests en cours
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} className="dashboard-paper">
            <Typography component="h2" variant="h6" className="card-heading">
              Répartition
            </Typography>
            <Typography component="p" variant="h6">
              Candidats: {stats?.totalCandidats || 0}
            </Typography>
            <Typography component="p" variant="h6">
              Recruteurs: {stats?.totalRecruteurs || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Activités récentes et alertes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="paper-section">
            <Typography variant="h6" className="section-title">
              Activités récentes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.type}</TableCell>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.role}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {loading ? 'Chargement...' : 'Aucune activité récente'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box className="action-buttons-container">
              <Button color="primary">Voir toutes les activités</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="paper-section">
            <Typography variant="h6" className="section-title">
              Alertes système
            </Typography>
            <List>
              {systemAlerts && systemAlerts.length > 0 ? (
                systemAlerts.map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemText
                      primary={alert.message}
                      secondary={alert.date}
                      primaryTypographyProps={{
                        color: alert.type === 'error' ? 'error' : 
                              alert.type === 'warning' ? 'warning' : 'info'
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={alert.type} 
                        className={`alert-chip status-chip-${alert.type}`}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={loading ? 'Chargement...' : 'Aucune alerte système'}
                  />
                </ListItem>
              )}
            </List>
            <Box className="action-buttons-container">
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<RefreshIcon />}
                onClick={handleRefreshAlerts}
                disabled={loading}
              >
                Rafraîchir
              </Button>
              <Button color="primary">Voir toutes les alertes</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;