import React, { useState, useEffect } from 'react';
import { applicationService, testService } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../../Styles/MyApplications.css';
import { Brain, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// ✅ Interface pour les props de configuration
interface MyApplicationsProps {
  isEmbedded?: boolean;      // Si utilisé dans Profile
  maxItems?: number;         // Nombre max d'éléments à afficher
  showHeader?: boolean;      // Afficher le titre principal
  showDebugInfo?: boolean;   // Afficher les infos de debug
}

// ✅ CORRECTION: Service pour les tests psychologiques avec URLs correctes
const psychologicalTestService = {
  // Créer un test psychologique
  createPsychologicalTest: async (technicalTestId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/psychological-tests/technical-test/${technicalTestId}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du test psychologique');
    }
    
    return await response.json();
  },

  // Récupérer les résultats du test psychologique
  getPsychologicalTestResults: async (testId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/psychological-tests/${testId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des résultats');
    }
    
    return await response.json();
  }
};

const MyApplications: React.FC<MyApplicationsProps> = ({ 
  isEmbedded = false,
  maxItems,
  showHeader = true,
  showDebugInfo = true
}) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();

  // ✅ FONCTION: Déterminer le statut du test psychologique
  const getPsychologicalTestStatus = (application: any) => {
    console.log(`🔍 Vérification statut psychologique pour ${application._id}:`, {
      status: application.status,
      psychResults: !!application.psychologicalTestResults,
      testResults: !!application.testResults,
      score: application.testResults?.score
    });

    // Si le test psychologique est complété
    if (application.status === 'psychological_test_completed' || application.psychologicalTestResults) {
      return 'completed';
    }
    
    // Si le test technique est complété avec un score suffisant
    if (application.status === 'test_completed' && 
        application.testResults && 
        application.testResults.score >= 70) {
      return 'available';
    }
    
    return 'not_available';
  };

  // ✅ FONCTION: Mettre à jour le statut local
  const updateApplicationStatus = (applicationId: string, newStatus: string, additionalData?: any) => {
    setApplications(prevApps => 
      prevApps.map(app => 
        app._id === applicationId 
          ? { ...app, status: newStatus, ...additionalData }
          : app
      )
    );
  };

  // ✅ FONCTION: Debug des IDs
  const debugApplicationIds = (application: any) => {
    console.log('🔍 === DEBUG IDs POUR CANDIDATURE ===');
    console.log('📋 Application ID:', application._id);
    console.log('📋 Job ID:', application.job?._id);
    console.log('📋 Test Results:', application.testResults);
    console.log('📋 Test Results Test ID:', application.testResults?.testId);
    console.log('📋 Technical Test Details:', application.technicalTestDetails);
    console.log('📋 Technical Test Details ID:', application.technicalTestDetails?._id);
    console.log('🔍 === FIN DEBUG ===');
  };

  // Fonction pour chercher l'ID du test en base
  const fetchTechnicalTestId = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      // ✅ CORRECTION: URL correcte selon votre backend
      const response = await fetch(`http://localhost:5000/api/tests/applications/${applicationId}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Test trouvé via API:', data.test._id);
        return data.test._id;
      }
    } catch (error) {
      console.error('❌ Erreur recherche test:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        console.log('🔑 Token existe:', !!token);
        console.log('👤 Rôle utilisateur:', role);
        
        if (!token) {
          console.error('❌ Pas de token d\'authentification');
          if (!isEmbedded) {
            toast.error('Session expirée - Reconnectez-vous');
            navigate('/auth');
          }
          return;
        }
        
        console.log('🚀 Appel API getMyApplications...');
        const response = await applicationService.getMyApplications();
        
        const apps = response.data.applications || [];
        console.log('📋 Applications brutes:', apps);
        console.log('🔢 Nombre de candidatures:', apps.length);
        
        // Debug pour chaque candidature
        if (apps.length > 0) {
          apps.forEach((app: any, index: number) => {
            console.log(`📋 Candidature ${index + 1}:`, {
              id: app._id,
              jobId: app.job?._id,
              jobTitle: app.job?.title,
              company: app.job?.company,
              status: app.status,
              createdAt: app.createdAt,
              testResults: app.testResults ? 'Présent' : 'Absent',
              testResultsTestId: app.testResults?.testId,
              psychResults: app.psychologicalTestResults ? 'Présent' : 'Absent'
            });
          });
        }
        
        const candidaturesAvecTests = await Promise.all(
          apps.map(async (app: any) => {
            if (app.status === 'test_completed' && app.testResults) {
              try {
                console.log(`🔍 Récupération détails test pour candidature ${app._id}`);
                
                const token = localStorage.getItem('token');
                // ✅ CORRECTION: URL selon votre backend (/api/tests au lieu de /api/technical-tests)
                const response = await fetch(`http://localhost:5000/api/tests/applications/${app._id}/test`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (!response.ok) {
                  throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                const testData = await response.json();
                console.log(`✅ Test récupéré pour ${app._id}:`, testData);
                
                return { ...app, technicalTestDetails: testData.test };
              } catch (error) {
                console.error(`❌ Erreur récupération test technique pour ${app._id}:`, error);
                return app;
              }
            }
            return app;
          })
        );
        
        setApplications(candidaturesAvecTests);
        setDebugInfo({
          totalFound: candidaturesAvecTests.length,
          apiStatus: response.status,
          hasToken: !!token,
          userRole: role,
          rawApplications: apps.length
        });
        
      } catch (err: any) {
        console.error('❌ Erreur complète:', err);
        
        setDebugInfo({
          error: err.message,
          status: err.response?.status,
          responseData: err.response?.data
        });
        
        if (!isEmbedded) {
          if (err.response?.status === 401) {
            toast.error('Non autorisé - Reconnectez-vous');
            navigate('/auth');
          } else if (err.response?.status === 404) {
            toast.error('Service non trouvé - Vérifiez que le serveur est démarré');
          } else {
            toast.error('Erreur lors du chargement de vos candidatures');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate, isEmbedded]);

  // ✅ FONCTION: Créer test technique
  const handleCreateTest = async (applicationId: string) => {
    try {
      console.log('🧪 Création test technique pour:', applicationId);
      const response = await testService.createTest(applicationId);
      console.log("✅ Réponse test API:", response.data);

      updateApplicationStatus(applicationId, 'test_in_progress');

      toast.success('Test créé avec succès!');
      // ✅ CORRECTION: URL selon App.tsx
      navigate(`/technical-test/${response.data.testId}`);
    } catch (err: any) {
      console.error("❌ Erreur création test:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Erreur lors de la création du test');
    }
  };

  // ✅ FONCTION CORRIGÉE: Voir résultats test technique
  const handleViewTest = (application: any) => {
    console.log('📊 Navigation vers résultats test pour candidature:', application._id);
    
    debugApplicationIds(application);
    
    let realTestId = null;
    
    if (application.testResults?.testId) {
      realTestId = application.testResults.testId;
      console.log('✅ ID trouvé dans testResults.testId');
    } else if (application.technicalTestDetails?._id) {
      realTestId = application.technicalTestDetails._id;
      console.log('✅ ID trouvé dans technicalTestDetails._id');
    } else {
      console.log('❌ Aucun ID de test technique trouvé, recherche en base...');
      
      fetchTechnicalTestId(application._id)
        .then(testId => {
          if (testId) {
            // ✅ CORRECTION: URL selon App.tsx
            navigate(`/test-results/${testId}`);
          } else {
            toast.error('Impossible de trouver le test technique');
          }
        });
      return;
    }
    
    console.log('🎯 Navigation avec ID:', realTestId);
    // ✅ CORRECTION: URL selon App.tsx
    navigate(`/test-results/${realTestId}`);
  };

  // ✅ FONCTION CORRIGÉE: Créer test psychologique
  const handleCreatePsychologicalTest = async (application: any) => {
    try {
      console.log('🧠 Tentative création test psychologique pour:', application._id);
      
      debugApplicationIds(application);
      
      // Vérifier le score du test technique
      if (!application.testResults || application.testResults.score < 70) {
        console.log('❌ Score insuffisant:', application.testResults?.score);
        toast.error(`Score insuffisant au test technique (${application.testResults?.score || 0}%). Un minimum de 70% est requis pour le test psychologique.`);
        return;
      }

      // Trouver l'ID du test technique
      let technicalTestId = null;
      
      if (application.testResults?.testId) {
        technicalTestId = application.testResults.testId;
        console.log('🔍 ID trouvé dans testResults.testId:', technicalTestId);
      } else if (application.technicalTestDetails?._id) {
        technicalTestId = application.technicalTestDetails._id;
        console.log('🔍 ID trouvé dans technicalTestDetails._id:', technicalTestId);
      } else {
        console.log('🔍 Recherche du test technique dans la base pour candidature:', application._id);
        
        const searchResponse = await fetch(`http://localhost:5000/api/tests/applications/${application._id}/test`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          technicalTestId = searchData.test._id;
          console.log('🔍 ID trouvé via recherche:', technicalTestId);
        }
      }
      
      if (!technicalTestId) {
        toast.error('Impossible de trouver l\'ID du test technique');
        return;
      }
      
      console.log('🎯 ID final utilisé:', technicalTestId);
      
      // Créer le test psychologique
      const response = await psychologicalTestService.createPsychologicalTest(technicalTestId);
      console.log('✅ Test psychologique créé:', response);
      
      updateApplicationStatus(application._id, 'psychological_test_in_progress', {
        psychologicalTestId: response.testId
      });
      
      toast.success('Test psychologique créé avec succès!', {
        icon: <Brain size={20} style={{ color: '#22c55e' }} />
      });
      
      // ✅ CORRECTION: URL selon App.tsx
      navigate(`/test-psychologique/${technicalTestId}`);
      
    } catch (err: any) {
      console.error("❌ Erreur création test psychologique:", err);
      toast.error(err.message || 'Erreur lors de la création du test psychologique');
    }
  };

  // ✅ FONCTION COMPLÈTEMENT CORRIGÉE: Voir résultats test psychologique
  const handleViewPsychologicalResults = async (application: any) => {
    try {
      let psychTestId = null;
      
      // Chercher l'ID du test psychologique
      if (application.psychologicalTestResults?.testId) {
        psychTestId = application.psychologicalTestResults.testId;
      } else if (application.psychologicalTestId) {
        psychTestId = application.psychologicalTestId;
      }
      
      console.log('🧠 Navigation vers résultats psychologiques:', psychTestId);
      
      if (psychTestId) {
        // ✅ CORRECTION MAJEURE: URL selon App.tsx
        navigate(`/psychological-tests/${psychTestId}/results`);
      } else {
        toast.error('Résultats du test psychologique non disponibles');
      }
    } catch (err: any) {
      console.error("❌ Erreur récupération résultats:", err);
      toast.error('Erreur lors de la récupération des résultats');
    }
  };

  // ✅ FONCTION: Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Refusée';
      case 'test_in_progress': return 'Test technique en cours';
      case 'test_completed': return 'Test technique terminé';
      case 'psychological_test_in_progress': return 'Test psychologique en cours';
      case 'psychological_test_completed': return 'Tests complétés';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className={isEmbedded ? "loading-embedded" : "loading"}>
        <p>Chargement de vos candidatures...</p>
        {!isEmbedded && <p>🔍 Vérification des données...</p>}
      </div>
    );
  }

  if (applications.length === 0 && !loading) {
    return (
      <div className={isEmbedded ? "no-applications-embedded" : "no-applications"}>
        {!isEmbedded && <h2>Aucune candidature trouvée</h2>}
        
        {process.env.NODE_ENV === 'development' && debugInfo && showDebugInfo && (
          <details style={{ 
            background: '#f0f0f0', 
            padding: '15px', 
            borderRadius: '8px',
            fontSize: '12px',
            marginTop: '15px',
            marginBottom: '15px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              🐛 Informations de debug (cliquez pour développer)
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              background: 'white', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '11px'
            }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
        
        <p>
          {debugInfo?.error 
            ? `Erreur: ${debugInfo.error}` 
            : isEmbedded 
              ? 'Aucune candidature pour le moment'
              : 'Consultez les offres disponibles et postulez pour voir vos candidatures ici.'
          }
        </p>
        
        {!isEmbedded && (
          <>
            <button onClick={() => navigate('/Condidates')}>Retour au dashboard</button>
            <button onClick={() => navigate('/offers')} style={{ marginLeft: '10px' }}>
              Voir les offres d'emploi
            </button>
          </>
        )}
        
        {isEmbedded && (
          <button 
            className="btn" 
            onClick={() => navigate('/jobs')}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Voir les offres d'emploi
          </button>
        )}
      </div>
    );
  }

  // ✅ Déterminer quelles candidatures afficher
  const applicationsToShow = maxItems ? applications.slice(0, maxItems) : applications;

  return (
    <div className={isEmbedded ? "applications-embedded" : "my-applications-container"}>
      {showHeader && <h1>Mes candidatures ({applications.length})</h1>}
      
      {process.env.NODE_ENV === 'development' && debugInfo && showDebugInfo && (
        <details style={{ 
          marginBottom: '20px', 
          background: '#f8f9fa', 
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#495057' }}>
            🐛 Informations de debug ({applications.length} candidatures)
          </summary>
          <pre style={{ 
            fontSize: '11px', 
            overflow: 'auto',
            marginTop: '10px',
            background: 'white',
            padding: '8px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}

      <div className="applications-list">
        {/* ✅ DEBUG: Déplacer les logs en dehors du JSX */}
        {(() => {
          if (!isEmbedded) {
            console.log('🔍 === DEBUG TOUTES LES CANDIDATURES ===');
            applications.forEach((app, index) => {
              console.log(`Candidature ${index + 1}:`, {
                candidatureId: app._id,
                testResultsTestId: app.testResults?.testId,
                technicalTestDetailsId: app.technicalTestDetails?._id,
                status: app.status,
                psychResults: !!app.psychologicalTestResults
              });
            });
            console.log('🔍 === FIN DEBUG ===');
          }
          return null; // Ne rien rendre dans le JSX
        })()}

        {applicationsToShow.map((application, index) => (
          <div key={application._id || index} className={`application-card ${application.status}`}>

            {/* ✅ Affichage conditionnel des infos job selon le mode */}
            {!isEmbedded && (
              <div className="job-info">
                <h2>{application.job?.title || 'Titre non disponible'}</h2>
                <h3>{application.job?.company || 'Entreprise non disponible'}</h3>
                <p>{application.job?.description?.substring(0, 100) || 'Aucune description'}...</p>
              </div>
            )}

            <div className="application-info">
              <div className="application-status">
                
                {/* ✅ Affichage titre pour mode embedded */}
                {isEmbedded && (
                  <div className="job-title-embedded">
                    <h4>{application.job?.title || 'Titre non disponible'}</h4>
                    {application.job?.company && (
                      <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                        chez {application.job.company}
                      </p>
                    )}
                  </div>
                )}
                
                <span className={`status-badge ${application.status}`}>
                  {getStatusText(application.status)}
                </span>
                <p>Postulée le {new Date(application.createdAt).toLocaleDateString()}</p>
              </div>

              {application.aiAnalysis && (
                <div className="ai-score">
                  <span>Score CV: {application.aiAnalysis.score}%</span>
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: `${application.aiAnalysis.score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {(application.testResults || application.psychologicalTestResults) && (
                <div className="test-scores">
                  {application.testResults && (
                    <div className="score-item">
                      <span className="score-label">Test Technique:</span>
                      <span className={`score-value ${application.testResults.score >= 70 ? 'success' : 'warning'}`}>
                        {application.testResults.score}%
                      </span>
                      {application.testResults.score >= 70 && (
                        <CheckCircle size={16} style={{ color: '#22c55e', marginLeft: '4px' }} />
                      )}
                    </div>
                  )}
                  
                  {application.psychologicalTestResults && (
                    <div className="score-item">
                      <span className="score-label">Test Psychologique:</span>
                      <span className="score-value success">
                        {application.psychologicalTestResults.overallScore || application.psychologicalTestResults.overall_score}%
                      </span>
                      <Brain size={16} style={{ color: '#6366f1', marginLeft: '4px' }} />
                    </div>
                  )}
                </div>
              )}

              <div className="test-actions-section">
                
                {application.status === 'approved' && (
                  <button
                    className="take-test-btn"
                    onClick={() => handleCreateTest(application._id)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      padding: isEmbedded ? '10px 16px' : '12px 20px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      margin: '8px auto',
                      fontSize: isEmbedded ? '14px' : '16px'
                    }}
                  >
                    <Clock size={isEmbedded ? 14 : 16} />
                    Prendre le test technique
                  </button>
                )}

                {application.status === 'test_completed' && application.testResults && (
                  <button
                    className="view-results-btn"
                    onClick={() => handleViewTest(application)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                      color: 'white',
                      border: 'none',
                      padding: isEmbedded ? '10px 16px' : '12px 20px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      margin: '8px auto',
                      fontSize: isEmbedded ? '14px' : '16px'
                    }}
                  >
                    📊 Résultats techniques ({application.testResults.score}%)
                  </button>
                )}

                {getPsychologicalTestStatus(application) === 'available' && (
                  <button
                    className="psychological-test-btn"
                    onClick={() => handleCreatePsychologicalTest(application)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: isEmbedded ? '10px 16px' : '12px 20px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      margin: '8px auto',
                      fontSize: isEmbedded ? '14px' : '16px'
                    }}
                  >
                    <Brain size={isEmbedded ? 14 : 16} />
                    Passer au Test Psychologique
                  </button>
                )}

                {getPsychologicalTestStatus(application) === 'completed' && (
                  <button
                    className="view-psychological-results-btn"
                    onClick={() => handleViewPsychologicalResults(application)}
                    style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      border: 'none',
                      padding: isEmbedded ? '10px 16px' : '12px 20px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      margin: '8px auto',
                      fontSize: isEmbedded ? '14px' : '16px'
                    }}
                  >
                    <Brain size={isEmbedded ? 14 : 16} />
                    🧠 Résultats Psychologiques
                  </button>
                )}

                {application.status === 'test_completed' && 
                 application.testResults && 
                 application.testResults.score < 70 && (
                  <div className="score-message warning" style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: isEmbedded ? '10px' : '12px',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle size={isEmbedded ? 14 : 16} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: isEmbedded ? '12px' : '14px', color: '#92400e' }}>
                      Score insuffisant pour le test psychologique (minimum 70% requis)
                    </span>
                  </div>
                )}
              </div>

              {/* ✅ Debug info seulement en mode non-embedded */}
              {process.env.NODE_ENV === 'development' && !isEmbedded && (
                <details style={{ 
                  marginTop: '10px', 
                  fontSize: '10px', 
                  color: '#666',
                  background: '#f8f9ff',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  <summary style={{ cursor: 'pointer' }}>Debug candidature</summary>
                  <div style={{ marginTop: '6px' }}>
                    <div>ID: {application._id}</div>
                    <div>Status: {application.status}</div>
                    <div>Job ID: {application.job?._id}</div>
                    <div>Test Results: {application.testResults ? 'Oui' : 'Non'}</div>
                    <div>Score: {application.testResults?.score || 'N/A'}</div>
                    <div>TestId in testResults: {application.testResults?.testId || 'N/A'}</div>
                    <div>Psych Test: {getPsychologicalTestStatus(application)}</div>
                    <div>Psych Results: {application.psychologicalTestResults ? 'Oui' : 'Non'}</div>
                    <div>Real Test ID would be: {
                      application.testResults?.testId || 
                      application.technicalTestDetails?._id || 
                      'Non trouvé'
                    }</div>
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* ✅ Message si limité par maxItems */}
      {isEmbedded && maxItems && applications.length > maxItems && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px', 
          padding: '12px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <p style={{ 
            margin: 0, 
            color: '#4c51bf', 
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {applications.length - maxItems} candidature(s) supplémentaire(s) disponible(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default MyApplications;