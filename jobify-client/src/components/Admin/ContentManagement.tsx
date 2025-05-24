// ContentManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, CircularProgress, Tabs, Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Importez le fichier CSS
import '../../Styles/ContentManagement.css';

interface ContentManagementProps {
  showNotification: (message: string, severity?: string) => void;
}

interface ContentItem {
  id: number;
  type: string;
  titre: string;
  contenu: string;
  statut: string;
  derniereMaj: string;
  auteur?: string;
}

// Données de contenu simulées
const mockContent: ContentItem[] = [
  { id: 1, type: "FAQ", titre: "Questions fréquentes sur les tests", contenu: "Contenu de la FAQ...", statut: "Publié", derniereMaj: "2025-04-10", auteur: "Admin" },
  { id: 2, type: "Guide", titre: "Guide du recruteur", contenu: "Contenu du guide...", statut: "Publié", derniereMaj: "2025-03-22", auteur: "Admin" },
  { id: 3, type: "Guide", titre: "Guide du candidat", contenu: "Contenu du guide...", statut: "Publié", derniereMaj: "2025-03-22", auteur: "Admin" },
  { id: 4, type: "Email", titre: "Message de bienvenue", contenu: "Contenu de l'email...", statut: "Publié", derniereMaj: "2025-02-15", auteur: "Admin" },
  { id: 5, type: "Email", titre: "Notification de candidature", contenu: "Contenu de l'email...", statut: "Publié", derniereMaj: "2025-02-15", auteur: "Admin" },
  { id: 6, type: "Page", titre: "À propos de nous", contenu: "Contenu de la page...", statut: "Publié", derniereMaj: "2025-01-30", auteur: "Admin" },
  { id: 7, type: "Page", titre: "Conditions d'utilisation", contenu: "Contenu de la page...", statut: "Brouillon", derniereMaj: "2025-05-16", auteur: "Admin" },
  { id: 8, type: "Page", titre: "Politique de confidentialité", contenu: "Contenu de la page...", statut: "Brouillon", derniereMaj: "2025-05-16", auteur: "Admin" }
];

const ContentManagement: React.FC<ContentManagementProps> = ({ showNotification }) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [filteredContents, setFilteredContents] = useState<ContentItem[]>([]);
  const [filterType, setFilterType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      setContents(mockContent);
      setFilteredContents(mockContent);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterContents();
  }, [filterType, contents]);

  const filterContents = () => {
    if (filterType === '') {
      setFilteredContents(contents);
    } else {
      setFilteredContents(contents.filter(content => content.type === filterType));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (content: ContentItem | null = null) => {
    if (content) {
      setCurrentContent(content);
      setEditorContent(content.contenu);
    } else {
      const newContent: ContentItem = {
        id: Math.max(...contents.map(c => c.id)) + 1,
        type: "Page",
        titre: "",
        contenu: "",
        statut: "Brouillon",
        derniereMaj: new Date().toISOString().split('T')[0],
        auteur: "Admin"
      };
      setCurrentContent(newContent);
      setEditorContent('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentContent(null);
    setEditorContent('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (!currentContent) return;
    
    const { name, value } = e.target as { name: string; value: string };
    
    setCurrentContent({
      ...currentContent,
      [name]: value
    });
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    if (currentContent) {
      setCurrentContent({
        ...currentContent,
        contenu: e.target.value
      });
    }
  };

  const handleSaveContent = () => {
    if (!currentContent) return;
    
    const updatedContent = {
      ...currentContent,
      derniereMaj: new Date().toISOString().split('T')[0]
    };
    
    if (currentContent.id && contents.find(c => c.id === currentContent.id)) {
      // Mise à jour du contenu existant
      setContents(contents.map(c => 
        c.id === currentContent.id ? updatedContent : c
      ));
      showNotification("Contenu mis à jour avec succès", "success");
    } else {
      // Ajout d'un nouveau contenu
      setContents([...contents, updatedContent]);
      showNotification("Nouveau contenu ajouté avec succès", "success");
    }
    
    handleCloseDialog();
  };

  const handleDeleteContent = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      setContents(contents.filter(c => c.id !== id));
      showNotification("Contenu supprimé avec succès", "success");
    }
  };

  const handleChangeStatus = (id: number, newStatus: string) => {
    setContents(contents.map(content => 
      content.id === id ? { ...content, statut: newStatus } : content
    ));
    
    const actionMsg = newStatus === 'Publié' ? 'publié' : 'mis en brouillon';
    showNotification(`Contenu ${actionMsg} avec succès`, newStatus === 'Publié' ? 'success' : 'info');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Chargement du contenu...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="content-management-container">
      <Box className="header-container">
        <Typography variant="h5" className="section-title">
          Gestion du contenu
        </Typography>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        className="content-tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Tous les contenus" />
        <Tab label="Pages" />
        <Tab label="Guides" />
        <Tab label="FAQs" />
        <Tab label="Emails" />
      </Tabs>
      
      <Grid container spacing={2} className="filter-container">
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="filter-type-label">Filtrer par type</InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as string)}
              label="Filtrer par type"
              startAdornment={<FilterIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="">Tous les types</MenuItem>
              <MenuItem value="Page">Pages</MenuItem>
              <MenuItem value="Guide">Guides</MenuItem>
              <MenuItem value="FAQ">FAQs</MenuItem>
              <MenuItem value="Email">Emails</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            className="add-button"
          >
            Ajouter un contenu
          </Button>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="table-header">Type</TableCell>
              <TableCell className="table-header">Titre</TableCell>
              <TableCell className="table-header">Statut</TableCell>
              <TableCell className="table-header">Dernière modification</TableCell>
              <TableCell className="table-header" align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContents.length > 0 ? (
              filteredContents.map((content) => (
                <TableRow key={content.id} hover>
                  <TableCell>{content.type}</TableCell>
                  <TableCell>{content.titre}</TableCell>
                  <TableCell>
                    <Chip 
                      label={content.statut} 
                      className={`status-chip status-${content.statut.toLowerCase()}`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{content.derniereMaj}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenDialog(content)}
                      size="small"
                      className="edit-button"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    
                    {content.statut === 'Publié' ? (
                      <IconButton 
                        onClick={() => handleChangeStatus(content.id, 'Brouillon')}
                        size="small"
                        className="visibility-button"
                        title="Mettre en brouillon"
                      >
                        <VisibilityOffIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton 
                        onClick={() => handleChangeStatus(content.id, 'Publié')}
                        size="small"
                        className="visibility-button"
                        title="Publier"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    <IconButton 
                      onClick={() => handleDeleteContent(content.id)}
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
                <TableCell colSpan={5}>
                  <Typography className="empty-text">
                    Aucun contenu trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialogue de création/édition de contenu */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="dialog-title">
          {currentContent?.id && contents.find(c => c.id === currentContent.id) 
            ? 'Modifier le contenu' 
            : 'Ajouter un nouveau contenu'
          }
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} className="form-field">
              <TextField
                fullWidth
                label="Titre"
                name="titre"
                value={currentContent?.titre || ''}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <FormControl fullWidth variant="outlined">
                <InputLabel id="content-type-label">Type</InputLabel>
                <Select
                  labelId="content-type-label"
                  name="type"
                  value={currentContent?.type || 'Page'}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="Page">Page</MenuItem>
                  <MenuItem value="Guide">Guide</MenuItem>
                  <MenuItem value="FAQ">FAQ</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} className="form-field">
              <TextField
                fullWidth
                label="Contenu"
                name="contenu"
                value={editorContent}
                onChange={handleEditorChange}
                variant="outlined"
                multiline
                rows={10}
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <FormControl fullWidth variant="outlined">
                <InputLabel id="content-status-label">Statut</InputLabel>
                <Select
                  labelId="content-status-label"
                  name="statut"
                  value={currentContent?.statut || 'Brouillon'}
                  onChange={handleInputChange}
                  label="Statut"
                >
                  <MenuItem value="Brouillon">Brouillon</MenuItem>
                  <MenuItem value="Publié">Publié</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSaveContent} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            className="save-button"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManagement;