// src/components/Sidebar.tsx
import React from 'react';
import '../Styles/SideBar.css';
import { Home, Users, FileText, BarChart3, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Proxym_logo from '../assets/proxym_logo.jpg';
import jobify_logo from '../assets/jobify-logo.svg'


const Sidebar = () => {
    const navigate = useNavigate();

    const companyName = "Proxym Group"; // à remplacer dynamiquement plus tard

    const handleLogout = () => {
        localStorage.removeItem('token'); // ou sessionStorage.removeItem
        navigate('/auth'); // Rediriger vers la page de connexion
    };
    

    return (
        <aside className="sidebar">
            <img  className="sidebar-logo"src={jobify_logo} alt=""  />

            <nav className="sidebar-nav">
                <ul>
                    <li onClick={() => navigate('/')}>
                        <Home size={18} /> <span>Accueil</span>
                    </li>
                    <li onClick={() => navigate('/recruiters')}>
                        <Users size={18} /> <span>Recruteurs</span>
                    </li>
                    <li>
                        <FileText size={18} /> <span>Offres</span>
                    </li>
                    <li>
                        <BarChart3 size={18} /> <span>Statistiques</span>
                    </li>
                    <li>
                        <Settings size={18} /> <span>Paramètres</span>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="company-info">
                    <img src={Proxym_logo} alt="Logo" className="company-logo" />
                    <span className="company-name">{companyName}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
