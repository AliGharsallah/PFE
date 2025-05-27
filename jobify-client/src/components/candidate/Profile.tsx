import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Profile.css';
import DEFAULTPROFILEPIC from '../../assets/defaultprofilepic.jpg';
import { useAuth } from '../../context/AuthContext';
import { userService, applicationService } from '../../services/api';
import MyApplications from '../../components/candidate/MyApplications';

interface Application {
  _id: string;
  jobId: {
    title: string;
    company?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'interview';
  appliedAt: string;
}

const Profile = () => {
  const { user, updateUserInContext } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [profileImage, setProfileImage] = useState(DEFAULTPROFILEPIC);
  const [userProfile, setUserProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and applications on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile from database
        const profileResponse = await userService.getProfile();
        const userData = profileResponse.data.user || profileResponse.data;
        
        setUserProfile(userData);
        
        // Update profile image if exists
        if (userData.profileImage && userData.profileImage !== 'default-profile.jpg') {
          setProfileImage(`http://localhost:5000/uploads/profiles/${userData.profileImage}`);
        }
        
        // Update context with fresh data (but avoid triggering re-render)
        if (updateUserInContext && JSON.stringify(userData) !== JSON.stringify(user)) {
          updateUserInContext(userData);
        }
        
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Erreur lors du chargement du profil. Vérifiez votre connexion.');
        // If API fails, use context data as fallback
        setUserProfile(user);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated and we're not already loading
    if (user.isAuthenticated) {
      fetchUserData();
    } else {
      setUserProfile(user);
      setLoading(false);
    }
  }, [user.isAuthenticated]); // Only depend on authentication status

  // Handle profile image change
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validation
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }

      try {
        // Preview image immediately
        const reader = new FileReader();
        reader.onload = (e) => setProfileImage(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append('profileImage', file);
        
        const response = await userService.uploadProfileImage(formData);
        
        if (response.data.success) {
          // Update user profile with new image
          const updatedUser = { ...userProfile, profileImage: response.data.filename };
          setUserProfile(updatedUser);
          
          if (updateUserInContext) {
            updateUserInContext(updatedUser);
          }
        }
      } catch (err: any) {
        console.error('Error uploading image:', err);
        alert('Erreur lors du téléchargement de l\'image');
        // Revert preview on error
        if (userProfile.profileImage && userProfile.profileImage !== 'default-profile.jpg') {
          setProfileImage(`http://localhost:5000/uploads/profiles/${userProfile.profileImage}`);
        } else {
          setProfileImage(DEFAULTPROFILEPIC);
        }
      }
    }
  };

  // Navigation handlers
  const handleEditProfile = () => {
    navigate('/profile-settings');
  };

  const handleViewHistory = () => {
    navigate('/application-history');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleApplicationDetails = (applicationId: string) => {
    navigate('/my-applications');
  };

  // Get status translation
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'en attente',
      'accepted': 'acceptée',
      'rejected': 'refusée',
      'interview': 'entretien'
    };
    return statusMap[status] || status;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-container">
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
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-photo-wrapper">
          <img src={profileImage} alt="Profil" className="profile-photo" />
          <label className="upload-btn">
            📷 Modifier
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>
        <h2 className="profile-name">
          {userProfile.name || 'Utilisateur'}
        </h2>
        <div className="profile-buttons">
          <button className="btn" onClick={handleEditProfile}>
            Modifier le Profil
          </button>
          <button className="btn" onClick={handleViewHistory}>
            Voir Historique
          </button>
          <button className="btn" onClick={handleSettings}>
            Paramètres
          </button>
        </div>
      </div>

      <div className="profile-details">
        <h3>📄 Détails personnels</h3>
        <div className="info-grid">
          <div>
            <strong>Email :</strong><br />
            {userProfile.email || 'Non renseigné'}
          </div>
          <div>
            <strong>Téléphone :</strong><br />
            {userProfile.candidateInfo?.phone || 'Non renseigné'}
          </div>
          <div>
            <strong>Localisation :</strong><br />
            {userProfile.candidateInfo?.location || 'Non renseignée'}
          </div>
          {userProfile.candidateInfo?.skills && userProfile.candidateInfo.skills.length > 0 && (
            <div>
              <strong>Compétences :</strong><br />
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {userProfile.candidateInfo.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Experience section for candidates */}
      {userProfile.role === 'candidate' && userProfile.candidateInfo?.experience && userProfile.candidateInfo.experience.length > 0 && (
        <div className="profile-details">
          <h3>💼 Expérience professionnelle</h3>
          {userProfile.candidateInfo.experience.map((exp, index) => (
            <div key={index} className="experience-card">
              <h4>{exp.title}</h4>
              <p><strong>{exp.company}</strong></p>
              <p className="date-range">
                {exp.from ? new Date(exp.from).toLocaleDateString('fr-FR') : ''} - 
                {exp.to ? new Date(exp.to).toLocaleDateString('fr-FR') : 'Présent'}
              </p>
              {exp.description && <p>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education section for candidates */}
      {userProfile.role === 'candidate' && userProfile.candidateInfo?.education && userProfile.candidateInfo.education.length > 0 && (
        <div className="profile-details">
          <h3>🎓 Formation</h3>
          {userProfile.candidateInfo.education.map((edu, index) => (
            <div key={index} className="education-card">
              <h4>{edu.degree}</h4>
              <p><strong>{edu.institution}</strong></p>
              {edu.fieldOfStudy && <p>{edu.fieldOfStudy}</p>}
              <p className="date-range">
                {edu.from ? new Date(edu.from).toLocaleDateString('fr-FR') : ''} - 
                {edu.to ? new Date(edu.to).toLocaleDateString('fr-FR') : 'En cours'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Applications section - only for candidates */}
      {userProfile.role === 'candidate' && (
        <div className="applications-section">
          <h3>🗂️ Mes Candidatures</h3>
          <MyApplications 
            isEmbedded={true}
            maxItems={3}
            showHeader={false}
            showDebugInfo={false}
          />
          
          {/* Bouton pour voir toutes les candidatures */}
          <div className="view-all-applications" style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              className="btn view-all-btn"
              onClick={() => navigate('/my-applications')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Voir toutes mes candidatures →
            </button>
          </div>
        </div>
      )}

      {/* Company info section - only for recruiters */}
      {userProfile.role === 'recruiter' && userProfile.companyInfo && (
        <div className="profile-details">
          <h3>🏢 Informations entreprise</h3>
          <div className="info-grid">
            <div>
              <strong>Entreprise :</strong><br />
              {userProfile.companyInfo.companyName || 'Non renseigné'}
            </div>
            <div>
              <strong>Secteur :</strong><br />
              {userProfile.companyInfo.industry || 'Non renseigné'}
            </div>
            <div>
              <strong>Taille :</strong><br />
              {userProfile.companyInfo.companySize || 'Non renseignée'}
            </div>
            {userProfile.companyInfo.website && (
              <div>
                <strong>Site web :</strong><br />
                <a href={userProfile.companyInfo.website} target="_blank" rel="noopener noreferrer">
                  {userProfile.companyInfo.website}
                </a>
              </div>
            )}
          </div>
          {userProfile.companyInfo.description && (
            <div className="company-description">
              <strong>Description :</strong>
              <p>{userProfile.companyInfo.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;