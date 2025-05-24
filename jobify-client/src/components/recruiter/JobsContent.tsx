import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Filter, Search, MapPin, Calendar, Briefcase } from 'lucide-react';
import '../../Styles/JobsContent.css';
import {jobService} from '../../services/api';
import { toast } from 'react-toastify';

interface JobsContentProps {
  jobs: any[];
  loading: boolean;
  navigate: any;
}

const JobsContent: React.FC<JobsContentProps> = ({ jobs, loading, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'closed'
  

  const handleCreateJob = () => {
    navigate('/create-job');
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/Offers/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    console.log("ID pour édition:", jobId);
    navigate(`/edit-job/${jobId}`);
  };

  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        setDeletingJobId(jobId); // Début du chargement
        await jobService.deleteJob(jobId);
        toast.success('Offre supprimée avec succès');

        // Mettre à jour la liste des offres après la suppression
        // Vous pouvez appeler une fonction pour rafraîchir la liste des offres ici
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'offre:', error);
        toast.error('Erreur lors de la suppression de l\'offre');
      } finally {
        setDeletingJobId(null); // Fin du chargement
      }
    }
  };

  // Filtrer les offres selon les critères
  const filteredJobs = jobs.filter(job => {
    // Filtre par status
    if (filterStatus !== 'all' && job.status !== filterStatus) {
      return false;
    }

    // Filtre par terme de recherche
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !job.company?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'draft': return 'status-draft';
      case 'closed': return 'status-closed';
      default: return 'status-closed';
    }
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
                placeholder="Rechercher une offre..."
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
                <option value="active">Actifs</option>
                <option value="draft">Brouillons</option>
                <option value="closed">Clôturés</option>
              </select>
            </div>
          </div>

          <button className="create-button" onClick={handleCreateJob}>
            <Plus size={16} />
            Créer une offre
          </button>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Offres d'emploi ({filteredJobs.length})</h2>
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Chargement des offres d'emploi...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-jobs">
            <Briefcase size={48} className="empty-icon" />
            <h3 className="empty-title">Aucune offre trouvée</h3>
            <p className="empty-message">Aucune offre ne correspond à vos critères de recherche</p>
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
            ) : (
              <button className="create-button create-first" onClick={handleCreateJob}>
                <Plus size={16} />
                Créer votre première offre
              </button>
            )}
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div
                key={job._id}
                className="job-item"
              >
                <div className="job-header">
                  <div className={`status-indicator ${getStatusClassName(job.status)}`}></div>

                  <div className="job-header-content">
                    <div className="job-info">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company || 'Votre entreprise'}</p>

                      <div className="job-meta">
                        <div className="meta-item">
                          <MapPin size={16} />
                          <span>{job.location || 'Non spécifié'}</span>
                        </div>
                        <div className="meta-item">
                          <Calendar size={16} />
                          <span>{new Date(job.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`status-badge ${getStatusClassName(job.status)}`}>
                      {job.status === 'active' ? 'Actif' : job.status === 'draft' ? 'Brouillon' : 'Clôturé'}
                    </div>
                  </div>
                </div>

                <div className="job-body">
                  <p className="job-description">
                    {job.description || 'Aucune description fournie pour cette offre.'}
                  </p>

                  {job.technicalSkills && job.technicalSkills.length > 0 && (
                    <div className="skills-container">
                      {job.technicalSkills.slice(0, 3).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="skill-tag"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.technicalSkills.length > 3 && (
                        <span className="skill-more">
                          +{job.technicalSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="job-actions">
                    <button
                      onClick={() => handleViewJob(job._id)}
                      className="view-job-button"
                    >
                      <Eye size={16} />
                      Voir
                    </button>

                    <button
                      onClick={() => handleEditJob(job._id)}
                      className="edit-job-button"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="delete-job-button"
                      disabled={deletingJobId === job._id}
                    >
                      {deletingJobId === job._id ? <Loader size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default JobsContent;