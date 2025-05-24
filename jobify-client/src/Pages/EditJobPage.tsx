// src/pages/EditJobPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/api';
import { toast } from 'react-toastify';
import { Briefcase, ArrowLeft } from 'lucide-react';
import '../Styles/CreateJobForm.css'; // Réutilisation du même style

const EditJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    requirements: '',
    technicalSkills: '',
    topics: '',
    duration: 60,
    numberOfQuestions: 5,
    status: 'active'
  });

  // Charger les données de l'offre existante
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setFetchingJob(true);
        const response = await jobService.getJob(id!);
        const job = response.data.job;

        // Convertir les tableaux en chaînes séparées par des virgules pour les formulaires
        setFormData({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          location: job.location || '',
          requirements: job.requirements ? job.requirements.join(', ') : '',
          technicalSkills: job.technicalSkills ? job.technicalSkills.join(', ') : '',
          topics: job.testCriteria?.topics ? job.testCriteria.topics.join(', ') : '',
          duration: job.testCriteria?.duration || 60,
          numberOfQuestions: job.testCriteria?.numberOfQuestions || 5,
          status: job.status || 'active'
        });
      } catch (err: any) {
        console.error('Erreur lors de la récupération des détails de l\'offre:', err);
        toast.error('Impossible de charger les détails de l\'offre');
        // Rediriger vers la liste des offres en cas d'erreur
        navigate('/jobs');
      } finally {
        setFetchingJob(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convertir les champs texte séparés par des virgules en tableaux
      const jobData = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        location: formData.location,
        requirements: formData.requirements ? formData.requirements.split(',').map(req => req.trim()) : [],
        technicalSkills: formData.technicalSkills ? formData.technicalSkills.split(',').map(skill => skill.trim()) : [],
        status: formData.status,
        testCriteria: {
          topics: formData.topics ? formData.topics.split(',').map(topic => topic.trim()) : [],
          duration: formData.duration,
          numberOfQuestions: formData.numberOfQuestions
        }
      };

      await jobService.updateJob(id!, jobData);
      toast.success('Offre d\'emploi mise à jour avec succès!');
      
      // Rediriger vers la page de détails de l'offre ou la liste des offres
      navigate(`/Offers/${id}`);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l\'offre:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/Offers/${id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Retour aux offres
        </button>
        <div className="page-title">
          <Briefcase size={24} />
          <h1>Modifier l'offre d'emploi</h1>
        </div>
      </div>
      
      <div className="page-content">
        {fetchingJob ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement des détails de l'offre...</p>
          </div>
        ) : (
          <div className="create-job-container">
            <h2>Modifier l'offre d'emploi</h2>
            <form onSubmit={handleSubmit} className="create-job-form">
              <div className="form-group">
                <label>Titre du poste *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Ex: Développeur Full Stack JavaScript"
                />
              </div>

              <div className="form-group">
                <label>Entreprise *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Ex: Votre entreprise"
                />
              </div>

              <div className="form-group">
                <label>Localisation</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ex: Paris, France (ou Remote)"
                />
              </div>

              <div className="form-group">
                <label>Description du poste *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={5}
                  placeholder="Décrivez les responsabilités et le contexte du poste"
                />
              </div>

              <div className="form-group">
                <label>Exigences (séparées par des virgules)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  placeholder="Ex: 3 ans d'expérience, Bac+5, Anglais courant"
                />
              </div>

              <div className="form-group">
                <label>Compétences techniques (séparées par des virgules)</label>
                <textarea
                  name="technicalSkills"
                  value={formData.technicalSkills}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  placeholder="Ex: React, Node.js, MongoDB, Express"
                />
              </div>

              <div className="form-group">
                <label>Sujets du test technique (séparés par des virgules)</label>
                <textarea
                  name="topics"
                  value={formData.topics}
                  onChange={handleChange}
                  disabled={loading}
                  rows={2}
                  placeholder="Ex: JavaScript, Algorithmes, React"
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Durée du test (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleNumberChange}
                    min={15}
                    max={120}
                    disabled={loading}
                  />
                </div>

                <div className="form-group half">
                  <label>Nombre de questions</label>
                  <input
                    type="number"
                    name="numberOfQuestions"
                    value={formData.numberOfQuestions}
                    onChange={handleNumberChange}
                    min={3}
                    max={20}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Statut</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="draft">Brouillon</option>
                  <option value="closed">Clôturée</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Mise à jour en cours...' : 'Mettre à jour l\'offre'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditJobPage;