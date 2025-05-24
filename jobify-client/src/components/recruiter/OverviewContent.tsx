import React from 'react';
import { Plus, Eye, BarChart2, Users, Award, Calendar } from 'lucide-react';
import '../../styles/OverviewContent.css'; // Assuming you have a CSS file for styles

interface OverviewContentProps {
  activeJobs: any[];
  recentApplications: any[];
  loading: boolean;
  navigate: any;
}

const OverviewContent: React.FC<OverviewContentProps> = ({ 
  activeJobs, 
  recentApplications, 
  loading, 
  navigate 
}) => {
  const handleCreateJob = () => {
    navigate('/create-job');
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/Offers/${jobId}`);
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  // Calculate metrics
  const activeJobsCount = activeJobs.filter(job => job.status === 'active').length;
  const candidatesCount = recentApplications.length;

  const averageAIScore = recentApplications.length > 0
    ? Math.round(recentApplications.reduce((acc, app) => acc + (app.aiAnalysis?.score || 0), 0) / recentApplications.length)
    : 0;

  const interviewsCount = recentApplications.filter(app => app.status === 'approved').length;

  // AI score distribution
  const lowScoreCount = recentApplications.filter(app => (app.aiAnalysis?.score || 0) < 50).length;
  const mediumScoreCount = recentApplications.filter(app => (app.aiAnalysis?.score || 0) >= 50 && (app.aiAnalysis?.score || 0) < 75).length;
  const highScoreCount = recentApplications.filter(app => (app.aiAnalysis?.score || 0) >= 75).length;

  // Calculate percentages for pie chart
  const totalCandidates = highScoreCount + mediumScoreCount + lowScoreCount || 1;
  const highScorePercentage = (highScoreCount / totalCandidates) * 100;
  const mediumScorePercentage = (mediumScoreCount / totalCandidates) * 100;
  const highAndMediumScorePercentage = highScorePercentage + mediumScorePercentage;

  return (
    <>
      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <p className="card-title">{activeJobsCount}</p>
            <div className="stat-icon">
              <Award size={24} />
            </div>
          </div>
          <p>Offres actives</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <p className="card-title">{candidatesCount}</p>
            <div className="stat-icon">
              <Users size={24} />
            </div>
          </div>
          <p>Candidats reçus</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <p className="card-title">{averageAIScore}%</p>
            <div className="stat-icon">
              <BarChart2 size={24} />
            </div>
          </div>
          <p>Score moyen IA</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <p className="card-title">{interviewsCount}</p>
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
          </div>
          <p>Entretiens à organiser</p>
        </div>
      </div>

      {/* Jobs and Candidates */}
      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Offres d'emploi récentes</h2>
            <button className="simple-button" onClick={handleCreateJob}>
              <Plus size={16} /> 
              Créer une nouvelle
            </button>
          </div>
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Chargement des données...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Offre d'emploi</th>
                    <th>Localisation</th>
                    <th>Date création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeJobs.slice(0, 5).map((job) => (
                    <tr key={job._id}>
                      <td><strong>{job.title}</strong></td>
                      <td>{job.location || 'Non spécifié'}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric'
                      })}</td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => handleViewJob(job._id)}
                        >
                          <Eye size={16} />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeJobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-table-message">
                        Aucune offre d'emploi pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Candidats récents</h2>
            <button className="simple-button" onClick={handleCreateJob}>
              <Plus size={16} />
              Publier une offre
            </button>
          </div>
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Chargement des données...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Score IA</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.slice(0, 5).map((application) => (
                    <tr key={application._id}>
                      <td><strong>{application.candidate.name}</strong></td>
                      <td>{application.candidate.email}</td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${
                                application.aiAnalysis?.score >= 75 ? 'high-score' : 
                                application.aiAnalysis?.score >= 50 ? 'medium-score' : 'low-score'
                              }`}
                              style={{ width: `${application.aiAnalysis?.score || 0}%` }}
                            ></div>
                          </div>
                          <span>{application.aiAnalysis?.score || 'N/A'}%</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => handleViewApplication(application._id)}
                        >
                          <Eye size={16} />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentApplications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-table-message">
                        Aucune candidature pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Compétences des candidats</h2>
          </div>
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Chargement des données...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidat</th>
                    <th>Compétences</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.length > 0 ? (
                    recentApplications.filter(app => app.job && app.job.technicalSkills).slice(0, 5).map((application) => (
                      <tr key={application._id}>
                        <td>
                          <strong>{application.candidate.name}</strong>
                          <br />
                          <span className="candidate-email">
                            {application.candidate.email}
                          </span>
                        </td>
                        <td>
                          <div className="skills-container">
                            {application.job.technicalSkills.map((skill, index) => (
                              <span key={index} className="skill-tag">
                                {skill}
                              </span>
                            ))}
                            {application.job.technicalSkills.length === 0 && 'Aucune compétence spécifiée'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="empty-table-message">
                        Aucune candidature pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Répartition des scores IA</h2>
          </div>
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Chargement des données...</p>
            </div>
          ) : (
            <div className="chart-container">
              <div className="pie-chart-wrapper">
                <div className="pie-chart" style={{
                  background: `conic-gradient(
                    #4ade80 0% ${highScorePercentage}%, 
                    #facc15 ${highScorePercentage}% ${highAndMediumScorePercentage}%, 
                    #3b82f6 ${highAndMediumScorePercentage}% 100%
                  )`
                }}>
                </div>
              </div>
              <ul className="score-legend">
                <li className="legend-item">
                  <span className="legend-dot low-score-dot"></span>
                  0 – 50%: <strong>{lowScoreCount}</strong> candidats
                </li>
                <li className="legend-item">
                  <span className="legend-dot medium-score-dot"></span>
                  50 – 75%: <strong>{mediumScoreCount}</strong> candidats
                </li>
                <li className="legend-item">
                  <span className="legend-dot high-score-dot"></span>
                  75 – 100%: <strong>{highScoreCount}</strong> candidats
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OverviewContent;