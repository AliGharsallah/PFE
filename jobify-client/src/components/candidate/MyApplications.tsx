// src/components/MyApplications.tsx
import React, { useState, useEffect } from 'react';
import { applicationService, testService } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../../Styles/MyApplications.css';

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getMyApplications();
        setApplications(response.data.applications);
      } catch (err) {
        toast.error('Erreur lors du chargement de vos candidatures');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleCreateTest = async (applicationId: string) => {
    try {
      const response = await testService.createTest(applicationId);
      console.log("Réponse test API:", response.data);

      toast.success('Test créé avec succès!');
      navigate(`/technical-test/${response.data.testId}`);
    } catch (err: any) {
      console.error("Erreur création test:", err.response?.data || err.message);
    }
  };

  const handleViewTest = (testId: string) => {
    navigate(`/test-results/${testId}`);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Refusée';
      case 'test_in_progress': return 'Test en cours';
      case 'test_completed': return 'Test terminé';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading">Chargement de vos candidatures...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="no-applications">
        <h2>Vous n'avez pas encore de candidatures</h2>
        <p>Consultez les offres disponibles et postulez pour voir vos candidatures ici.</p>
        <button onClick={() => navigate('/jobs')}>Voir les offres d'emploi</button>
      </div>
    );
  }

  return (
    <div className="my-applications-container">
      <h1>Mes candidatures</h1>

      <div className="applications-list">
        {applications.map((application) => (

          <div key={application._id} className={`application-card ${application.status}`}>

            <div className="job-info">
              <h2>{application.job?.title || 'Titre non disponible'}</h2>
              <h3>{application.job?.company || 'Entreprise non disponible'}</h3>
              <p>{application.job?.description?.substring(0, 100) || 'Aucune description'}...</p>
            </div>

            <div className="application-info">
              <div className="application-status">
                <span className={`status-badge ${application.status}`}>
                  {getStatusText(application.status)}
                </span>
                <p>Postuléee le {new Date(application.createdAt).toLocaleDateString()}</p>
              </div>

              {application.aiAnalysis && (
                <div className="ai-score">
                  <span>Score AI: {application.aiAnalysis.score}%</span>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${application.aiAnalysis.score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="application-actions">
                {application.status === 'approved' && (
                  <button
                    className="take-test-btn"
                    onClick={() => handleCreateTest(application._id)}
                  >
                    Prendre le test technique
                  </button>
                )}

                {application.status === 'test_completed' && application.testResults && (
                  <button
                    className="view-results-btn"
                    onClick={() => handleViewTest(application._id)}
                  >
                    Voir les résultats du test
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;