import React, { useState } from 'react';
import '../../Styles/Profile.css';
import DEFAULTPROFILEPIC from '../../assets/defaultprofilepic.jpg';

const Profile = () => {
  const [profileImage, setProfileImage] = useState(DEFAULTPROFILEPIC);

  const user = {
    name: "Ali",
    lastName: "Ben Salah",
    email: "ali.bensalah@example.com",
    phone: "+216 12 345 678",
    location: "Tunis, Tunisie",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "CSS", "TypeScript"],
  };

  const applications = [
    { id: 1, title: "Développeur Full Stack", company: "TechTunisie", status: "acceptée" },
    { id: 2, title: "Analyste Données", company: "DataCorp", status: "refusée" },
    { id: 3, title: "Designer UX/UI", company: "DesignPro", status: "postulée" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = e => setProfileImage(e.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-photo-wrapper">
          <img src={profileImage} alt="Profil" className="profile-photo" />
          <label className="upload-btn">
            📷 Modifier
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>
        <h2 className="profile-name">{user.name} {user.lastName}</h2>
        <div className="profile-buttons">
          <button className="btn">Modifier le Profil</button>
          <button className="btn">Voir Historique</button>
          <button className="btn">Paramètres</button>
        </div>
      </div>

      <div className="profile-details">
  <h3>📄 Détails personnels</h3>
  <div className="info-grid">
    <div><strong>Email :</strong><br />{user.email}</div>
    <div><strong>Téléphone :</strong><br />{user.phone}</div>
    <div><strong>Localisation :</strong><br />{user.location}</div>
    <div>
      <strong>Compétences :</strong><br />
      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
        {user.skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </div>
  </div>
</div>

      <div className="applications-section">
        <h3>🗂️ Mes Candidatures</h3>
        {applications.map(app => (
          <div key={app.id} className={`application-card ${app.status}`}>
            <div className="app-info">
              <p><strong>{app.title}</strong> chez <strong>{app.company}</strong></p>
              <span className={`status-badge ${app.status}`}>{app.status}</span>
            </div>
            <button className="btn-details">Détails</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
