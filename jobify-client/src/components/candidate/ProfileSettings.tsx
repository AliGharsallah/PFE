import React, { useState, useEffect } from 'react';
import '../../Styles/ProfileSettings.css';
import defaultPic from '../../assets/proxym_logo.jpg';
import { Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const ProfileSettings = () => {
  const { user, updateUserInContext } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulaire de données utilisateur basé sur le modèle MongoDB
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Champs candidat
    phone: '',
    location: '',
    skills: [] as string[],
    // Champs entreprise (pour recruteurs)
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    contactPhone: ''
  });

  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getProfile();
        const userData = response.data.user || response.data;
        
        // Mapper les données selon le modèle MongoDB
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          // Données candidat
          phone: userData.candidateInfo?.phone || '',
          location: userData.candidateInfo?.location || '',
          skills: userData.candidateInfo?.skills || [],
          // Données entreprise
          companyName: userData.companyInfo?.companyName || '',
          industry: userData.companyInfo?.industry || '',
          companySize: userData.companyInfo?.companySize || '',
          website: userData.companyInfo?.website || '',
          contactPhone: userData.companyInfo?.contactPhone || ''
        });

        // Mettre à jour l'image de profil
        if (userData.profileImage && userData.profileImage !== 'default-profile.jpg') {
          // L'image sera chargée via l'URL du serveur
        }

      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Erreur lors du chargement du profil');
        // Utiliser les données du contexte comme fallback
        if (user.name) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || ''
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    if (user.isAuthenticated) {
      fetchUserProfile();
    }
  }, [user.isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Préparer les données selon le rôle de l'utilisateur
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      // Ajouter les données spécifiques selon le rôle
      if (user.role === 'candidate') {
        updateData.candidateInfo = {
          phone: formData.phone,
          location: formData.location,
          skills: formData.skills
        };
      } else if (user.role === 'recruiter') {
        updateData.companyInfo = {
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize,
          website: formData.website,
          contactPhone: formData.contactPhone
        };
      }

      // Sauvegarder les modifications
      const response = await userService.updateProfile(updateData);
      
      // Mettre à jour le contexte
      if (updateUserInContext) {
        updateUserInContext(response.data.user || response.data);
      }

      setEditing(false);
      alert("Modifications sauvegardées avec succès !");
      
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validation
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }

      try {
        setProfilePic(file);

        // Upload vers le serveur
        const formData = new FormData();
        formData.append('profileImage', file);
        
        const response = await userService.uploadProfileImage(formData);
        
        if (response.data.success && updateUserInContext) {
          updateUserInContext({ profileImage: response.data.filename });
          alert('Photo de profil mise à jour avec succès !');
        }
      } catch (err: any) {
        console.error('Error uploading image:', err);
        alert('Erreur lors du téléchargement de l\'image');
        setProfilePic(null);
      }
    }
  };

  // Obtenir l'URL de l'image de profil
  const getProfileImageUrl = () => {
    if (profilePic) {
      return URL.createObjectURL(profilePic);
    }
    if (user.profileImage && user.profileImage !== 'default-profile.jpg') {
      return `http://localhost:5000/uploads/profiles/${user.profileImage}`;
    }
    return defaultPic;
  };

  if (loading) {
    return (
      <div className="profile-settings">
        <div className="loading-spinner">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-settings">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image-section">
            <label htmlFor="pic-upload">
              <img
                src={getProfileImageUrl()}
                alt="profile"
                className="profile-img"
              />
            </label>
            <input id="pic-upload" type="file" accept="image/*" onChange={handleImageChange} hidden />
            <span>Changer photo</span>
          </div>
          <div className="profile-info">
            <h2>{formData.name || 'Utilisateur'}</h2>
            <p>{formData.email}</p>
            <button onClick={() => setEditing(!editing)} className="edit-btn">
              <Pencil size={16} /> {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>

        <div className="profile-details">
          {/* Champs communs */}
          <div className="profile-field">
            <label>Nom complet</label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom complet"
              />
            ) : (
              <p>{formData.name || 'Non renseigné'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Votre email"
              />
            ) : (
              <p>{formData.email || 'Non renseigné'}</p>
            )}
          </div>

          {/* Champs spécifiques aux candidats */}
          {user.role === 'candidate' && (
            <>
              <div className="profile-field">
                <label>Téléphone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Votre numéro de téléphone"
                  />
                ) : (
                  <p>{formData.phone || 'Non renseigné'}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Localisation</label>
                {editing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Votre ville"
                  />
                ) : (
                  <p>{formData.location || 'Non renseignée'}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Compétences</label>
                {editing ? (
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="JavaScript, React, Node.js (séparées par des virgules)"
                  />
                ) : (
                  <p>{formData.skills.length > 0 ? formData.skills.join(', ') : 'Aucune compétence renseignée'}</p>
                )}
              </div>
            </>
          )}

          {/* Champs spécifiques aux recruteurs */}
          {user.role === 'recruiter' && (
            <>
              <div className="profile-field">
                <label>Nom de l'entreprise</label>
                {editing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                  />
                ) : (
                  <p>{formData.companyName || 'Non renseigné'}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Secteur d'activité</label>
                {editing ? (
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Secteur d'activité"
                  />
                ) : (
                  <p>{formData.industry || 'Non renseigné'}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Taille de l'entreprise</label>
                {editing ? (
                  <input
                    type="text"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    placeholder="1-10, 11-50, 51-200, etc."
                  />
                ) : (
                  <p>{formData.companySize || 'Non renseignée'}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Site web</label>
                {editing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.exemple.com"
                  />
                ) : (
                  <p>{formData.website || 'Non renseigné'}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Téléphone entreprise</label>
                {editing ? (
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Téléphone de l'entreprise"
                  />
                ) : (
                  <p>{formData.contactPhone || 'Non renseigné'}</p>
                )}
              </div>
            </>
          )}

          {editing && (
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              💾 {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;