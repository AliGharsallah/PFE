import React, { useState } from 'react';
import '../Styles/ProfileSettings.css';
import defaultPic from '../assets/proxym_logo.jpg'; // Assurez-vous d’avoir une image par défaut
import { Pencil } from 'lucide-react';

const ProfileSettings = () => {
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: 'Ali',
    lastName: 'Ben Ahmed',
    email: 'ali@example.com',
    phone: '+213 123 456 789',
    city: 'Alger'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditing(false);
    alert("Modifications sauvegardées !");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  return (
    <div className="profile-settings">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image-section">
            <label htmlFor="pic-upload">
              <img
                src={profilePic ? URL.createObjectURL(profilePic) : defaultPic}
                alt="profile"
                className="profile-img"
              />
            </label>
            <input id="pic-upload" type="file" onChange={handleImageChange} hidden />
            <span>Changer photo</span>
          </div>
          <div className="profile-info">
            <h2>{formData.firstName} {formData.lastName}</h2>
            <p>{formData.email}</p>
            <button onClick={() => setEditing(!editing)} className="edit-btn">
              <Pencil size={16} /> {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>

        <div className="profile-details">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="profile-field">
              <label>{key === 'firstName' ? 'Prénom' : key === 'lastName' ? 'Nom' : key === 'email' ? 'Email' : key === 'phone' ? 'Téléphone' : 'Ville'}</label>
              {editing ? (
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                />
              ) : (
                <p>{value}</p>
              )}
            </div>
          ))}
          {editing && <button className="save-btn" onClick={handleSave}>💾 Sauvegarder</button>}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
