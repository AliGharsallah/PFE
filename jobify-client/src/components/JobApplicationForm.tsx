// src/components/JobApplicationForm.tsx
import React, { useState } from 'react';
import { applicationService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/JobApplicationForm.css';

interface JobApplicationFormProps {
  jobId: string;
  onApplicationSubmitted: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ jobId, onApplicationSubmitted }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Veuillez télécharger votre CV');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('resume', selectedFile);
      
      await applicationService.applyForJob(jobId, formData);
      
      toast.success('Candidature soumise avec succès!');
      onApplicationSubmitted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-application-form">
      <h3>Postuler à cette offre</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>CV (PDF, DOC, DOCX)</label>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
            disabled={isSubmitting}
          />
          {selectedFile && (
            <p className="file-selected">Fichier sélectionné: {selectedFile.name}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="apply-button"
          disabled={!selectedFile || isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
        </button>
      </form>
    </div>
  );
};

export default JobApplicationForm;