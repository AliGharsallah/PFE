import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../services/api';
import { toast } from 'react-toastify';
import JobApplicationForm from '../components/JobApplicationForm'; 
import { useAuth } from '../context/AuthContext';
import '../Styles/JobDetailPage.css';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await jobService.getJob(id);
        setJob(response.data.job);
      } catch (err) {
        toast.error('Erreur lors du chargement des détails de l\'offre');
        navigate('/Condidates');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleApplyClick = () => {
    if (!user.isAuthenticated) {
      toast.info('Veuillez vous connecter pour postuler');
      navigate('/auth');
      return;
    }

    if (user.role !== 'candidate') {
      toast.info('Seuls les candidats peuvent postuler aux offres');
      return;
    }

    setShowApplicationForm(true);
  };

  const handleApplicationSubmitted = () => {
    setShowApplicationForm(false);
    toast.success('Votre candidature a été soumise avec succès. Une analyse de votre CV par IA sera effectuée.');
  };

  if (loading) {
    return <div className="loading">Chargement des détails de l'offre...</div>;
  }

  if (!job) {
    return <div className="error-message">Offre introuvable</div>;
  }

  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <button className="back-button" onClick={() => navigate(user.role === 'candidate' ? '/Condidates' : '/recruiters')}>
          &larr; Retour
        </button>
        <h1>{job.title}</h1>
        <p className="company-name">{job.company}</p>
        <div className="job-meta">
          <span className="job-location">📍 {job.location || 'Non spécifié'}</span>
          <span className="job-date">📅 Publié le {new Date(job.createdAt).toLocaleDateString()}</span>
          <span className={`job-status ${job.status}`}>
            {job.status === 'active' ? '✅ Active' : '❌ Inactive'}
          </span>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-description">
          <h2>Description du poste</h2>
          <p>{job.description}</p>
        </div>

        <div className="job-requirements">
          <h2>Exigences</h2>
          {job.requirements && job.requirements.length > 0 ? (
            <ul>
              {job.requirements.map((req: string, index: number) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          ) : (
            <p>Aucune exigence spécifiée</p>
          )}
        </div>

        <div className="job-skills">
          <h2>Compétences techniques</h2>
          {job.technicalSkills && job.technicalSkills.length > 0 ? (
            <div className="skills-tags">
              {job.technicalSkills.map((skill: string, index: number) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p>Aucune compétence technique spécifiée</p>
          )}
        </div>

        {user.role === 'candidate' && job.status === 'active' && (
          <div className="job-apply-section">
            {!showApplicationForm ? (
              <button 
                className="apply-now-button" 
                onClick={handleApplyClick}
              >
                Postuler maintenant
              </button>
            ) : (
              <JobApplicationForm 
                jobId={id!} 
                onApplicationSubmitted={handleApplicationSubmitted} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;