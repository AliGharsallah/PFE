// src/components/CreateJobForm.tsx
import React, { useState } from 'react';
import { jobService } from '../services/api';
import { toast } from 'react-toastify';
import '../Styles/CreateJobForm.css';

const CreateJobForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
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
      // Convert comma-separated text fields to arrays
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

      await jobService.createJob(jobData);
      toast.success('Offre d\'emploi créée avec succès!');
      
      // Reset form
      setFormData({
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
    } catch (err: any) {
      console.error('Error creating job:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la création de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-container">
      <h2>Publier une nouvelle offre d'emploi</h2>
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
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Publication en cours...' : 'Publier l\'offre'}
        </button>
      </form>
    </div>
  );
};

export default CreateJobForm;