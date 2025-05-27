// UserManagement.tsx - Version avec Box (sans Grid)
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, CircularProgress, Pagination, Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { userService } from '../../services/api';
import '../../Styles/UserManagement.css';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  dateInscription: string;
  statut: string;
  profileImage?: string;
  companyInfo?: any;
  candidateInfo?: any;
}

interface UserManagementProps {
  showNotification: (message: string, severity?: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ showNotification }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    role: 'Candidat',
    statut: 'Actif'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Chargement initial des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, [page]);

  // Filtrage des utilisateurs
  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers({
        page,
        limit: 10
      });
      
      if (response.data.users) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalUsers(response.data.pagination?.totalUsers || 0);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

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
    if (filterRole && filterRole !== 'Tous') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(filtered);
  };

  const handleOpenDialog = (action: 'add' | 'edit', user: User | null = null) => {
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
    setError(null);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFormSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Validation basique
      if (!formData.email || !formData.nom || !formData.prenom) {
        setError('Tous les champs obligatoires doivent être remplis');
        return;
      }

      if (dialogAction === 'add') {
        const response = await userService.createUser(formData);
        
        if (response.data.user) {
          // Ajouter le nouvel utilisateur au début de la liste
          setUsers([response.data.user, ...users]);
          setTotalUsers(totalUsers + 1);
          showNotification('Utilisateur ajouté avec succès', 'success');
          
          // Afficher le mot de passe temporaire si disponible
          if (response.data.tempPassword) {
            showNotification(`Mot de passe temporaire: ${response.data.tempPassword}`, 'info');
          }
        }
      } else if (dialogAction === 'edit' && selectedUser) {
        const response = await userService.updateUser(selectedUser.id, formData);
        
        if (response.data.user) {
          const updatedUsers = users.map(user => 
            user.id === selectedUser.id ? response.data.user : user
          );
          setUsers(updatedUsers);
          showNotification('Utilisateur mis à jour avec succès', 'success');
        }
      }
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setSubmitting(true);
      
      await userService.deleteUser(userToDelete.id);
      
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      setTotalUsers(totalUsers - 1);
      
      showNotification('Utilisateur supprimé avec succès', 'success');
      handleCloseDeleteDialog();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    setPage(1);
    setSearchQuery('');
    setFilterRole('');
    fetchUsers();
  };

  const getRoleChipColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Recruteur': return 'primary';
      case 'Candidat': return 'success';
      default: return 'default';
    }
  };

  const getStatusChipColor = (status: string) => {
    return status === 'Actif' ? 'success' : 'default';
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
      {/* En-tête */}
      <Box className="header-container" sx={{ mb: 3 }}>
        <Typography variant="h5" className="section-title">
          Gestion des utilisateurs ({totalUsers})
        </Typography>
      </Box>
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Filtres et recherche - AVEC BOX */}
      <Box 
        className="filter-container" 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}
      >
        {/* Champ de recherche */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
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
        </Box>
        
        {/* Filtre par rôle */}
        <Box sx={{ flex: '0 1 200px', minWidth: '180px' }}>
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
        </Box>
        
        {/* Boutons d'actions */}
        <Box sx={{ display: 'flex', gap: 1, flex: '0 0 auto' }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualiser
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            className="add-button"
          >
            Ajouter un utilisateur
          </Button>
        </Box>
      </Box>
      
      {/* Tableau des utilisateurs */}
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell className="header-cell">Nom complet</TableCell>
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
                      color={getRoleChipColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.dateInscription}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.statut} 
                      color={getStatusChipColor(user.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenDialog('edit', user)}
                      size="small"
                      className="edit-button"
                      title="Modifier l'utilisateur"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenDeleteDialog(user)}
                      size="small"
                      className="delete-button"
                      title="Supprimer l'utilisateur"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography className="empty-text" align="center" sx={{ py: 4 }}>
                    {searchQuery || filterRole ? 'Aucun utilisateur trouvé avec ces critères' : 'Aucun utilisateur trouvé'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      {/* Dialogue Ajout/Édition utilisateur - AVEC BOX */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="dialog-title">
          {dialogAction === 'add' ? 'Ajouter un utilisateur' : 'Modifier un utilisateur'}
        </DialogTitle>
        <DialogContent className="dialog-content">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Formulaire avec Box */}
          <Box sx={{ mt: 2 }}>
            {/* Email */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                required
                disabled={submitting}
              />
            </Box>
            
            {/* Nom et Prénom sur la même ligne */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Nom *"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  disabled={submitting}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Prénom *"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  disabled={submitting}
                />
              </Box>
            </Box>
            
            {/* Rôle et Statut sur la même ligne */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth variant="outlined" disabled={submitting}>
                  <InputLabel id="user-role-label">Rôle *</InputLabel>
                  <Select
                    labelId="user-role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Rôle *"
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Recruteur">Recruteur</MenuItem>
                    <MenuItem value="Candidat">Candidat</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth variant="outlined" disabled={submitting}>
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
              </Box>
            </Box>
            
            {/* Message d'information pour l'ajout */}
            {dialogAction === 'add' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Un mot de passe temporaire sera généré automatiquement et affiché après la création.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            color="primary"
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : (
              dialogAction === 'add' ? 'Ajouter' : 'Enregistrer'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm">
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong>{userToDelete?.prenom} {userToDelete?.nom}</strong> ?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Cette action est irréversible et supprimera définitivement toutes les données associées à cet utilisateur.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={submitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;