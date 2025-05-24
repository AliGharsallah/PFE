// UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import '../../Styles/UserManagement.css';

// Données utilisateur de test
const mockUsers = [
  { id: 1, email: "admin@example.com", nom: "Admin", prenom: "Super", role: "Admin", dateInscription: "2024-01-01", statut: "Actif" },
  { id: 2, email: "recruteur1@company.com", nom: "Dupont", prenom: "Marie", role: "Recruteur", dateInscription: "2025-02-15", statut: "Actif" },
  { id: 3, email: "recruteur2@company.com", nom: "Martin", prenom: "Jean", role: "Recruteur", dateInscription: "2025-03-10", statut: "Actif" },
  { id: 4, email: "candidat1@gmail.com", nom: "Petit", prenom: "Sophie", role: "Candidat", dateInscription: "2025-04-05", statut: "Actif" },
  { id: 5, email: "candidat2@outlook.com", nom: "Lefebvre", prenom: "Thomas", role: "Candidat", dateInscription: "2025-04-20", statut: "Inactif" },
  { id: 6, email: "candidat3@hotmail.com", nom: "Dubois", prenom: "Julie", role: "Candidat", dateInscription: "2025-05-01", statut: "Actif" },
  { id: 7, email: "recruteur3@company.com", nom: "Moreau", prenom: "Philippe", role: "Recruteur", dateInscription: "2025-04-15", statut: "Inactif" },
];

interface UserManagementProps {
  showNotification: (message: string, severity?: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ showNotification }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    role: 'Candidat',
    statut: 'Actif'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un chargement de données depuis une API
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const filterUsers = () => {
    let filtered = [...users];
    
    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtre par rôle
    if (filterRole) {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(filtered);
  };

  const handleOpenDialog = (action: 'add' | 'edit', user: any = null) => {
    setDialogAction(action);
    setSelectedUser(user);
    
    if (action === 'edit' && user) {
      setFormData({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        statut: user.statut
      });
    } else {
      setFormData({
        email: '',
        nom: '',
        prenom: '',
        role: 'Candidat',
        statut: 'Actif'
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFormSubmit = () => {
    if (dialogAction === 'add') {
      const newUser = {
        id: users.length + 1,
        ...formData,
        dateInscription: new Date().toISOString().split('T')[0]
      };
      
      setUsers([...users, newUser]);
      showNotification("Utilisateur ajouté avec succès", "success");
    } else if (dialogAction === 'edit' && selectedUser) {
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      
      setUsers(updatedUsers);
      showNotification("Utilisateur mis à jour avec succès", "success");
    }
    
    handleCloseDialog();
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      showNotification("Utilisateur supprimé avec succès", "success");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Chargement des utilisateurs...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="user-management-container">
      <Box className="header-container">
        <Typography variant="h5" className="section-title">
          Gestion des utilisateurs
        </Typography>
      </Box>
      
      {/* Filtres et recherche */}
      <Grid container spacing={2} className="filter-container">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Rechercher un utilisateur"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
            className="search-field"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="filter-role-label">Filtrer par rôle</InputLabel>
            <Select
              labelId="filter-role-label"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as string)}
              label="Filtrer par rôle"
              startAdornment={<FilterIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Recruteur">Recruteur</MenuItem>
              <MenuItem value="Candidat">Candidat</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            className="add-button"
          >
            Ajouter un utilisateur
          </Button>
        </Grid>
      </Grid>
      
      {/* Tableau des utilisateurs */}
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell className="header-cell">Nom</TableCell>
              <TableCell className="header-cell">Email</TableCell>
              <TableCell className="header-cell">Rôle</TableCell>
              <TableCell className="header-cell">Date d'inscription</TableCell>
              <TableCell className="header-cell">Statut</TableCell>
              <TableCell className="header-cell" align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{`${user.prenom} ${user.nom}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      className={`role-chip role-${user.role.toLowerCase()}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.dateInscription}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.statut} 
                      className={`status-chip status-${user.statut.toLowerCase()}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenDialog('edit', user)}
                      size="small"
                      className="edit-button"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteUser(user.id)}
                      size="small"
                      className="delete-button"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography className="empty-text">
                    Aucun utilisateur trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialogue Ajout/Édition utilisateur */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="dialog-title">
          {dialogAction === 'add' ? 'Ajouter un utilisateur' : 'Modifier un utilisateur'}
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Grid container spacing={2}>
            <Grid item xs={12} className="form-field">
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <FormControl fullWidth variant="outlined">
                <InputLabel id="user-role-label">Rôle</InputLabel>
                <Select
                  labelId="user-role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rôle"
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Recruteur">Recruteur</MenuItem>
                  <MenuItem value="Candidat">Candidat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <FormControl fullWidth variant="outlined">
                <InputLabel id="user-status-label">Statut</InputLabel>
                <Select
                  labelId="user-status-label"
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  label="Statut"
                >
                  <MenuItem value="Actif">Actif</MenuItem>
                  <MenuItem value="Inactif">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {dialogAction === 'add' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Un mot de passe temporaire sera généré et envoyé à l'adresse email.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            color="primary"
            className="submit-button"
          >
            {dialogAction === 'add' ? 'Ajouter' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;