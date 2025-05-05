// src/Dashboard.tsx
import React from 'react';
import '../Styles/Dashbord-recuiters.css';
import Sidebar from './SideBar';
import { Bell } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-container">
        <div className="topbar">
          <input
            type="text"
            placeholder="Rechercher..."
            className="search-input"
          />
          <div className="notification-icon">
            <Bell size={20} />
          </div>
        </div>
        <h1>Overview</h1>

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="card-title">✅ 12</p>
            <p>Offres actives</p>
          </div>
          <div className="stat-card">
            <p className="card-title">👥 128</p>
            <p>Candidats reçus</p>
          </div>
          <div className="stat-card">
            <p className="card-title">⚙️ 72 %</p>
            <p>Score moyen IA</p>
          </div>
          <div className="stat-card">
            <p className="card-title">📅 5</p>
            <p>Entretiens prévus aujourd’hui</p>
          </div>
        </div>

        {/* Offres et Candidats */}
        <div className="cards-grid">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Offres d'emploi récentes</h2>
              <button className="simple-button">Créer une nouvelle</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Offre d’emploi</th>
                  <th>Location</th>
                  <th>Date création</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Développeur Full Stack</td>
                  <td>Paris</td>
                  <td>01/04/2025</td>
                </tr>
                <tr>
                  <td>UX/UI Designer</td>
                  <td>Lyon</td>
                  <td>28/06/2025</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Candidats récents</h2>
              <button className="simple-button">Voir une nouvelle offre</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Score IA</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Amina B.</td>
                  <td>amina@email.com</td>
                  <td>96%</td>
                  <td>👁 Voir</td>
                </tr>
                <tr>
                  <td>Samir L.</td>
                  <td>sami@email.com</td>
                  <td>75%</td>
                  <td>👁 Voir</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Compétences + Graphique */}
        <div className="cards-grid">
          <div className="card">
            <h2 className="card-title">Compétences des candidats</h2>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Compétences</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>amina.jb@esthnalib.com</td>
                  <td>React, Node.js, MobX</td>
                </tr>
                <tr>
                  <td>samir.l@email.com</td>
                  <td>UI Design, Figma</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="card-title">Répartition des scores IA</h2>
            <div className="pie-chart"></div>
            <ul>
              <li>🔵 0 – 50%</li>
              <li>🟡 50 – 75%</li>
              <li>🟢 75 – 100%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
