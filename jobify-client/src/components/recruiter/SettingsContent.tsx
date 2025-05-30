import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, Globe, Save, Eye, EyeOff, Bell, Lock } from 'lucide-react';
import '../../Styles/SettingsContent.css';
import { userService } from '../../services/api';

const SettingsContent = () => {
  // États
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    website: '',
    phone: '',
    linkedin: '',
    twitter: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    smsNotifications: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    showPasswords: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        const userData = response.data.user;

        if (userData.role === 'recruiter') {
          setProfileData({
            fullName: userData.name || '',
            email: userData.email || ''
          });

          setCompanyData({
            name: userData.companyInfo?.companyName || '',
            address: `${userData.companyInfo?.address?.street || ''}, ${userData.companyInfo?.address?.city || ''}, ${userData.companyInfo?.address?.country || ''}`,
            website: userData.companyInfo?.website || '',
            phone: userData.companyInfo?.contactPhone || '',
            linkedin: userData.companyInfo?.socialMedia?.linkedin || '',
            twitter: userData.companyInfo?.socialMedia?.twitter || '',
          });
        }

        if (userData.preferences?.notifications) {
          setNotificationSettings({
            emailNotifications: userData.preferences.notifications.email || false,
            browserNotifications: userData.preferences.notifications.push || false,
            smsNotifications: userData.preferences.notifications.sms || false,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError("Impossible de charger les paramètres. Vérifiez votre connexion.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Gestionnaires d'événements
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const toggleShowPasswords = () => {
    setPasswordData(prev => ({ ...prev, showPasswords: !prev.showPasswords }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Profil sauvegardé (simulation)');
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    alert('Informations entreprise sauvegardées (simulation)');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    alert('Préférences de notification sauvegardées (simulation)');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    alert('Mot de passe mis à jour (simulation)');
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="settings-content">
      {/* Section Profil */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Paramètres du profil</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSaveProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email professionnel</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                <Save size={16} /> Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section Entreprise */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Informations de l'entreprise</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSaveCompany}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise</label>
                <div className="input-wrapper">
                  <Building size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={companyData.name}
                    onChange={handleCompanyChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Adresse</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    name="address"
                    value={companyData.address}
                    onChange={handleCompanyChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Site web</label>
                <div className="input-wrapper">
                  <Globe size={18} className="input-icon" />
                  <input
                    type="text"
                    name="website"
                    value={companyData.website}
                    onChange={handleCompanyChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="text"
                    name="phone"
                    value={companyData.phone}
                    onChange={handleCompanyChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <div className="input-wrapper">
                  <Globe size={18} className="input-icon" />
                  <input
                    type="text"
                    name="linkedin"
                    value={companyData.linkedin}
                    onChange={handleCompanyChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Twitter</label>
                <div className="input-wrapper">
                  <Globe size={18} className="input-icon" />
                  <input
                    type="text"
                    name="twitter"
                    value={companyData.twitter}
                    onChange={handleCompanyChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                <Save size={16} /> Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section Notifications */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Paramètres de notification</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSaveNotifications}>
            <div className="notification-section">
              <h3 className="section-title">Canaux de notification</h3>
              <div className="checkbox-grid">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="custom-checkbox"
                  />
                  <label htmlFor="emailNotifications" className="checkbox-label">
                    Notifications par email
                  </label>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="browserNotifications"
                    name="browserNotifications"
                    checked={notificationSettings.browserNotifications}
                    onChange={handleNotificationChange}
                    className="custom-checkbox"
                  />
                  <label htmlFor="browserNotifications" className="checkbox-label">
                    Notifications navigateur
                  </label>
                </div>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationChange}
                    className="custom-checkbox"
                  />
                  <label htmlFor="smsNotifications" className="checkbox-label">
                    Notifications SMS
                  </label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                <Save size={16} /> Enregistrer les préférences
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section Mot de passe */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Sécurité</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSavePassword}>
            <h3 className="section-title">Changer le mot de passe</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mot de passe actuel</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={passwordData.showPasswords ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nouveau mot de passe</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={passwordData.showPasswords ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirmez le nouveau mot de passe</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={passwordData.showPasswords ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="toggle-password-container">
              <button
                type="button"
                onClick={toggleShowPasswords}
                className="toggle-password-button"
              >
                {passwordData.showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                {passwordData.showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
              </button>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                <Save size={16} /> Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;