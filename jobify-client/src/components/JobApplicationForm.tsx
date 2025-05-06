import React, { useState } from 'react';
import { applicationService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/JobApplicationForm.css';

interface JobApplicationFormProps {
  jobId: string;
  onApplicationSubmitted: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, onApplicationSubmitted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Veuillez sélectionner un CV');
      return;
    }

    setLoading(true);

    // Créer un FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await applicationService.applyForJob(jobId, formData);
      toast.success('Candidature envoyée avec succès!');
      setFile(null);
      onApplicationSubmitted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-application-form">
      <h3>Postuler à cette offre</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Télécharger votre CV (PDF, DOC, DOCX)</label>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            onChange={handleFileChange} 
            required 
            disabled={loading}
          />
          {file && (
            <p className="file-selected">
              Fichier sélectionné: {file.name}
            </p>
          )}
        </div>
        <button 
          type="submit" 
          disabled={loading || !file} 
          className="apply-button"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
        </button>
      </form>
    </div>
  );
};

export default JobApplicationForm;