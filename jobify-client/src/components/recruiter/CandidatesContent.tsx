import React, { useState } from 'react';
import { Eye, Search, Filter, UserCheck, Mail, Phone, FileText, Check, X, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import '../../Styles/CandidatesContent.css';

interface CandidatesContentProps {
  applications: any[];
  loading: boolean;
  navigate: any;
}

const CandidatesContent: React.FC<CandidatesContentProps> = ({ applications, loading, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [downloadingCV, setDownloadingCV] = useState<string | null>(null);

  const handleViewApplication = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  const handleApproveCandidate = (applicationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir approuver ce candidat ?')) {
      // Ajouter la logique d'approbation ici
      alert('Fonctionnalité d\'approbation à implémenter');
    }
  };

  const handleRejectCandidate = (applicationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir rejeter ce candidat ?')) {
      // Ajouter la logique de rejet ici
      alert('Fonctionnalité de rejet à implémenter');
    }
  };

  // Fonction pour télécharger le CV
  const handleDownloadCV = async (application: any) => {
    if (!application.resume) {
      toast.error('Aucun CV disponible pour ce candidat');
      return;
    }

    try {
      setDownloadingCV(application._id);
      
      // Créer l'URL complète du CV
      const cvUrl = `http://localhost:5000/${application.resume}`;
      
      // Méthode 1: Téléchargement direct via lien
      const link = document.createElement('a');
      link.href = cvUrl;
      link.download = `CV_${application.candidate.name.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      
      // Ajouter le lien au DOM temporairement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`CV de ${application.candidate.name} téléchargé avec succès`);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      
      // Méthode de fallback: ouvrir dans un nouvel onglet
      try {
        const cvUrl = `http://localhost:5000/${application.resume}`;
        window.open(cvUrl, '_blank');
        toast.info(`CV de ${application.candidate.name} ouvert dans un nouvel onglet`);
      } catch (fallbackError) {
        toast.error('Erreur lors du téléchargement du CV');
      }
    } finally {
      setDownloadingCV(null);
    }
  };

  // Alternative avec fetch pour téléchargement authentifié
  const handleDownloadCVWithAuth = async (application: any) => {
    if (!application.resume) {
      toast.error('Aucun CV disponible pour ce candidat');
      return;
    }

    try {
      setDownloadingCV(application._id);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/${application.resume}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      // Obtenir le blob du fichier
      const blob = await response.blob();
      
      // Créer l'URL de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire l'extension du fichier ou utiliser .pdf par défaut
      const fileExtension = application.resume.split('.').pop() || 'pdf';
      link.download = `CV_${application.candidate.name.replace(/\s+/g, '_')}.${fileExtension}`;
      
      // Effectuer le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);
      
      toast.success(`CV de ${application.candidate.name} téléchargé avec succès`);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      toast.error('Erreur lors du téléchargement du CV');
    } finally {
      setDownloadingCV(null);
    }
  };

  // Filtrer les candidatures selon les critères
  const filteredApplications = applications.filter(app => {
    // Filtre par status
    if (filterStatus !== 'all' && app.status !== filterStatus) {
      return false;
    }
    
    // Filtre par terme de recherche
    if (searchTerm && 
        !app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Fonction pour obtenir la classe CSS appropriée pour un statut donné
  const getStatusClassName = (status: string) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // Fonction pour obtenir la classe CSS appropriée pour un score IA donné
  const getScoreClassName = (score: number) => {
    if (score >= 75) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  return (
    <>
      {/* Actions et Filtres */}
      <div className="card filters-card">
        <div className="card-header">
          <div className="filters-container">
            <div className="search-wrapper">
              <Search size={18} color="#64748b" className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-wrapper">
              <Filter size={18} color="#64748b" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des candidats */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Candidats ({filteredApplications.length})</h2>
        </div>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Chargement des candidats...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={48} className="empty-icon" />
            <h3 className="empty-title">Aucun candidat trouvé</h3>
            <p className="empty-message">Aucun candidat ne correspond à vos critères de recherche</p>
            {searchTerm || filterStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="reset-button"
              >
                Réinitialiser les filtres
              </button>
            ) : null}
          </div>
        ) : (
          <div className="table-container">
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Poste</th>
                  <th>Score IA</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(application => (
                  <tr key={application._id}>
                    <td>
                      <div className="candidate-info">
                        <strong>{application.candidate.name}</strong>
                        <div className="candidate-contact">
                          <div className="contact-item">
                            <Mail size={14} />
                            <span>{application.candidate.email}</span>
                          </div>
                          {application.candidate.phone && (
                            <div className="contact-item">
                              <Phone size={14} />
                              <span>{application.candidate.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {application.job && application.job.title ? 
                        application.job.title : 'Offre non spécifiée'}
                    </td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${getScoreClassName(application.aiAnalysis?.score || 0)}`}
                            style={{ width: `${application.aiAnalysis?.score || 0}%` }}
                          ></div>
                        </div>
                        <span>{application.aiAnalysis?.score || 'N/A'}%</span>
                      </div>
                    </td>
                    <td>
                      {new Date(application.createdAt).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClassName(application.status)}`}>
                        {application.status === 'approved' ? 'Approuvé' : 
                        application.status === 'rejected' ? 'Rejeté' : 
                        'En attente'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-container">
                        {/* Bouton Voir détails - INCHANGÉ */}
                        <button
                          className="action-button view-button"
                          onClick={() => handleViewApplication(application._id)}
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {/* Bouton Télécharger CV - NOUVEAU */}
                        <button
                          className="action-button download-button"
                          onClick={() => handleDownloadCV(application)}
                          title={`Télécharger CV de ${application.candidate.name}`}
                          disabled={downloadingCV === application._id || !application.resume}
                        >
                          {downloadingCV === application._id ? (
                            <div className="download-spinner"></div>
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                        
                        {application.status === 'pending' && (
                          <>
                            <button
                              className="action-button approve-button"
                              onClick={() => handleApproveCandidate(application._id)}
                              title="Approuver"
                            >
                              <Check size={16} />
                            </button>
                            
                            <button
                              className="action-button reject-button"
                              onClick={() => handleRejectCandidate(application._id)}
                              title="Rejeter"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidatesContent;