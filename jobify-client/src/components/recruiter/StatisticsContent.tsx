import React, { useState } from 'react';
import { BarChart2, PieChart, LineChart, Calendar, Filter, Download } from 'lucide-react';
import '../../Styles/StatisticsContents.css'; // Assurez-vous d'importer le fichier CSS pour le style

interface StatisticsContentProps {
  jobs: any[];
  applications: any[];
  loading: boolean;
}

const StatisticsContent: React.FC<StatisticsContentProps> = ({ 
  jobs, 
  applications, 
  loading 
}) => {
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

  // Calcul des statistiques simples
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const draftJobs = jobs.filter(job => job.status === 'draft').length;
  const closedJobs = jobs.filter(job => job.status === 'closed').length;
  
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
  
  // Calcul du taux d'acceptation
  const acceptanceRate = totalApplications > 0 
    ? Math.round((approvedApplications / totalApplications) * 100) 
    : 0;
  
  // Calcul du score moyen IA
  const averageAIScore = applications.length > 0
    ? Math.round(applications.reduce((acc, app) => acc + (app.aiAnalysis?.score || 0), 0) / applications.length)
    : 0;

  // Statistiques par compétences
  const skillsStats = applications.reduce((stats, app) => {
    if (app.job && app.job.technicalSkills) {
      app.job.technicalSkills.forEach(skill => {
        if (!stats[skill]) {
          stats[skill] = {
            total: 0,
            approved: 0
          };
        }
        stats[skill].total++;
        if (app.status === 'approved') {
          stats[skill].approved++;
        }
      });
    }
    return stats;
  }, {});

  // Convertir en tableau pour l'affichage
  const skillsArray = Object.entries(skillsStats)
    .map(([skill, data]: [string, any]) => ({
      skill,
      total: data.total,
      approved: data.approved,
      rate: Math.round((data.approved / data.total) * 100) || 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Top 5 compétences

  // Constantes pour les styles des graphiques en camembert
  const activeJobsPercentage = (activeJobs / (totalJobs || 1)) * 100;
  const draftJobsPercentage = (draftJobs / (totalJobs || 1)) * 100;
  const activeAndDraftJobsPercentage = activeJobsPercentage + draftJobsPercentage;
  
  const approvedApplicationsPercentage = (approvedApplications / (totalApplications || 1)) * 100;
  const rejectedApplicationsPercentage = (rejectedApplications / (totalApplications || 1)) * 100;
  const approvedAndRejectedApplicationsPercentage = approvedApplicationsPercentage + rejectedApplicationsPercentage;

  return (
    <>
      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      ) : (
        <>
          {/* Filtres et période */}
          <div className="card period-card">
            <div className="card-header">
              <div className="period-selector">
                <Filter size={18} color="#64748b" />
                <span className="period-label">Période:</span>
                <div className="period-buttons">
                  <button 
                    className={`period-button ${period === 'week' ? 'active' : ''}`}
                    onClick={() => setPeriod('week')}
                  >
                    Semaine
                  </button>
                  <button 
                    className={`period-button ${period === 'month' ? 'active' : ''}`}
                    onClick={() => setPeriod('month')}
                  >
                    Mois
                  </button>
                  <button 
                    className={`period-button ${period === 'year' ? 'active' : ''}`}
                    onClick={() => setPeriod('year')}
                  >
                    Année
                  </button>
                </div>
              </div>
              
              <button className="export-button">
                <Download size={16} />
                Exporter les données
              </button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <p className="card-title">{totalJobs}</p>
                <div className="stat-icon">
                  <BarChart2 size={24} />
                </div>
              </div>
              <p>Offres d'emploi totales</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <p className="card-title">{totalApplications}</p>
                <div className="stat-icon">
                  <LineChart size={24} />
                </div>
              </div>
              <p>Candidatures reçues</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <p className="card-title">{acceptanceRate}%</p>
                <div className="stat-icon">
                  <PieChart size={24} />
                </div>
              </div>
              <p>Taux d'acceptation</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <p className="card-title">{averageAIScore}%</p>
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
              </div>
              <p>Score IA moyen</p>
            </div>
          </div>

          {/* Graphiques et Tableaux */}
          <div className="cards-grid">
            {/* Distribution des offres */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Distribution des offres</h2>
              </div>
              <div className="chart-container">
                <div className="pie-chart-wrapper">
                  <div className="pie-chart jobs-chart" style={{
                    background: `conic-gradient(
                      #4ade80 0% ${activeJobsPercentage}%, 
                      #facc15 ${activeJobsPercentage}% ${activeAndDraftJobsPercentage}%, 
                      #94a3b8 ${activeAndDraftJobsPercentage}% 100%
                    )`
                  }}>
                  </div>
                </div>
                <ul className="chart-legend">
                  <li className="legend-item">
                    <span className="color-dot active-dot"></span>
                    Actives: <strong>{activeJobs}</strong>
                  </li>
                  <li className="legend-item">
                    <span className="color-dot draft-dot"></span>
                    Brouillons: <strong>{draftJobs}</strong>
                  </li>
                  <li className="legend-item">
                    <span className="color-dot closed-dot"></span>
                    Clôturées: <strong>{closedJobs}</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Distribution des candidatures */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Distribution des candidatures</h2>
              </div>
              <div className="chart-container">
                <div className="pie-chart-wrapper">
                  <div className="pie-chart applications-chart" style={{
                    background: `conic-gradient(
                      #4ade80 0% ${approvedApplicationsPercentage}%, 
                      #ef4444 ${approvedApplicationsPercentage}% ${approvedAndRejectedApplicationsPercentage}%, 
                      #facc15 ${approvedAndRejectedApplicationsPercentage}% 100%
                    )`
                  }}>
                  </div>
                </div>
                <ul className="chart-legend">
                  <li className="legend-item">
                    <span className="color-dot approved-dot"></span>
                    Approuvées: <strong>{approvedApplications}</strong>
                  </li>
                  <li className="legend-item">
                    <span className="color-dot rejected-dot"></span>
                    Rejetées: <strong>{rejectedApplications}</strong>
                  </li>
                  <li className="legend-item">
                    <span className="color-dot pending-dot"></span>
                    En attente: <strong>{pendingApplications}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Compétences les plus demandées */}
          <div className="card skills-card">
            <div className="card-header">
              <h2 className="card-title">Top 5 des compétences les plus demandées</h2>
            </div>
            {skillsArray.length > 0 ? (
              <div className="table-container">
                <table className="skills-table">
                  <thead>
                    <tr>
                      <th>Compétence</th>
                      <th>Candidats</th>
                      <th>Approuvés</th>
                      <th>Taux d'approbation</th>
                      <th>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillsArray.map((skill, index) => (
                      <tr key={index}>
                        <td><strong>{skill.skill}</strong></td>
                        <td>{skill.total}</td>
                        <td>{skill.approved}</td>
                        <td>{skill.rate}%</td>
                        <td>
                          <div className="progress-container">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${skill.rate}%` }}
                              ></div>
                            </div>
                            <span>{skill.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-skills">
                Aucune compétence trouvée dans les candidatures
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default StatisticsContent;