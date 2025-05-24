
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/AuthPage.css';
import Jobifylogo from "../assets/jobify-logo.svg";
import { authService } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
    ArrowLeft, Mail, Lock, User, ChevronRight, Eye, EyeOff, CheckCircle, Shield, 
    Building, Phone, MapPin, Globe, Briefcase, Upload 
} from 'lucide-react';

const AuthPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    // État pour l'image de profil
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    
    // Champs pour les recruteurs (entreprises)
    const [companyInfo, setCompanyInfo] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        description: '',
        website: '',
        contactPhone: '',
        address: {
            street: '',
            city: '',
            zipCode: '',
            country: ''
        }
    });
    
    // Logo de l'entreprise pour les recruteurs
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);
    const [companyLogoPreview, setCompanyLogoPreview] = useState<string>('');
    
    // Champs pour les candidats
    const [candidateInfo, setCandidateInfo] = useState({
        skills: [] as string[],
        currentSkill: '' // Pour gérer l'input des compétences
    });

    const navigate = useNavigate();

    // Fonction pour gérer le téléchargement d'image de profil
    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Vérification de la taille (max 1MB)
            if (file.size > 1000000) {
                toast.warn("⚠️ L'image ne doit pas dépasser 1MB");
                return;
            }
            
            // Vérification du type
            if (!file.type.startsWith('image/')) {
                toast.warn("⚠️ Veuillez sélectionner une image");
                return;
            }
            
            setProfileImage(file);
            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Fonction pour supprimer l'image de profil
    const removeProfileImage = () => {
        setProfileImage(null);
        setProfileImagePreview('');
    };

    // Fonction pour gérer le téléchargement du logo d'entreprise
    const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1000000) {
                toast.warn("⚠️ L'image ne doit pas dépasser 1MB");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.warn("⚠️ Veuillez sélectionner une image");
                return;
            }
            
            setCompanyLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Fonction pour supprimer le logo d'entreprise
    const removeCompanyLogo = () => {
        setCompanyLogo(null);
        setCompanyLogoPreview('');
    };

    // Fonction pour mettre à jour les champs de l'entreprise
    const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Gestion des champs imbriqués pour l'adresse
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setCompanyInfo({
                ...companyInfo,
                address: {
                    ...companyInfo.address,
                    [addressField]: value
                }
            });
        } else {
            setCompanyInfo({
                ...companyInfo,
                [name]: value
            });
        }
    };
    
    // Fonction pour ajouter une compétence
    const addSkill = () => {
        if (candidateInfo.currentSkill.trim() && !candidateInfo.skills.includes(candidateInfo.currentSkill.trim())) {
            setCandidateInfo({
                ...candidateInfo,
                skills: [...candidateInfo.skills, candidateInfo.currentSkill.trim()],
                currentSkill: ''
            });
        }
    };
    
    // Fonction pour supprimer une compétence
    const removeSkill = (skillToRemove: string) => {
        setCandidateInfo({
            ...candidateInfo,
            skills: candidateInfo.skills.filter(skill => skill !== skillToRemove)
        });
    };

    // Fonction pour évaluer la force du mot de passe
    const checkPasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        
        // Longueur minimale
        if (pass.length >= 8) score += 1;
        
        // Caractères variés
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        
        return score;
    };

    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(password));
    }, [password]);

    // Effet pour le canvas et les animations
    useEffect(() => {
        // Animation du canvas
        const canvas = document.getElementById('plexus-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const mouse = { x: 0, y: 0 };
        const points = Array.from({ length: 100 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1 // Points de tailles variables
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Ajouter un léger effet de flou pour un aspect plus doux
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(79, 70, 229, 0.3)";
            
            for (const point of points) {
                point.x += point.vx;
                point.y += point.vy;

                if (point.x < 0 || point.x > width) point.vx *= -1;
                if (point.y < 0 || point.y > height) point.vy *= -1;

                ctx.beginPath();
                ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffffff44';
                ctx.fill();

                for (const other of points) {
                    const dx = point.x - other.x;
                    const dy = point.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(255,255,255,${1 - dist / 100})`;
                        ctx.stroke();
                    }
                }
            }

            for (const point of points) {
                const dx = point.x - mouse.x;
                const dy = point.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(99,102,241,${1 - dist / 120})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            requestAnimationFrame(draw);
        };

        draw();

        const updateMouse = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('mousemove', updateMouse);
        return () => window.removeEventListener('mousemove', updateMouse);
    }, []);

    // Créer des particules décoratives améliorées
    useEffect(() => {
        const createParticles = () => {
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'particles-auth';
            
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle-auth';
                
                // Position aléatoire
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.left = `${Math.random() * 100}%`;
                
                // Taille aléatoire
                const size = Math.random() * 4 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Opacité aléatoire
                particle.style.opacity = `${Math.random() * 0.5 + 0.3}`;
                
                // Animation personnalisée
                particle.style.animation = `float ${Math.random() * 10 + 10}s infinite linear ${Math.random() * 5}s`;
                
                particlesContainer.appendChild(particle);
            }
            
            const authPageDiv = document.querySelector('.auth-page-div');
            if (authPageDiv) {
                authPageDiv.appendChild(particlesContainer);
            }
        };
        
        // Ajouter des formes décoratives améliorées
        const addShapes = () => {
            const shape1 = document.createElement('div');
            shape1.className = 'shape shape-1';
            
            const shape2 = document.createElement('div');
            shape2.className = 'shape shape-2';
            
            const shape3 = document.createElement('div'); // Nouvelle forme
            shape3.className = 'shape shape-3';
            
            const authPageDiv = document.querySelector('.auth-page-div');
            if (authPageDiv) {
                authPageDiv.appendChild(shape1);
                authPageDiv.appendChild(shape2);
                authPageDiv.appendChild(shape3);
            }
        };
        
        createParticles();
        addShapes();
        
        // Effet 3D subtil au survol de la carte
        const container = document.querySelector('.container');
        if (container) {
            const handleMouseMove = (e: MouseEvent) => {
                const xRotation = ((e.clientY - window.innerHeight / 2) / window.innerHeight) * 3;
                const yRotation = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 3;
                
                container.setAttribute('style', `transform: perspective(1000px) rotateX(${-xRotation}deg) rotateY(${yRotation}deg) scale3d(1.01, 1.01, 1.01)`);
            };
            
            const handleMouseLeave = () => {
                container.setAttribute('style', 'transform: perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
            };
            
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
        }
        
        return () => {
            const particlesContainer = document.querySelector('.particles-auth');
            const shapes = document.querySelectorAll('.shape');
            
            if (particlesContainer) {
                particlesContainer.remove();
            }
            
            shapes.forEach(shape => shape.remove());
            
            // Supprimer les écouteurs d'événements 3D
            const container = document.querySelector('.container');
            if (container) {
                container.removeEventListener('mousemove', (e: any) => {});
                container.removeEventListener('mouseleave', () => {});
            }
        };
    }, []);

    // 🔐 Login amélioré
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authService.login({ email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            toast.success(`✅ Connecté en tant que ${email}`, {
                icon: () => <CheckCircle size={24} className="toast-icon" />
            });
            
            setTimeout(() => {
                if (res.data.role === 'recruiter') {
                    navigate('/recruiters');
                } else if (res.data.role === 'candidate') {
                    navigate('/Condidates');
                }
                else if (res.data.role === 'Admin') {
                    navigate('/admin/dashboard');
                }
            }, 1000);

            // Vider les champs
            setEmail('');
            setPassword('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ Connexion échouée");
        } finally {
            setLoading(false);
        }
    };

    // 📝 Register amélioré avec téléchargement d'image
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (passwordStrength < 3) {
            toast.warn("⚠️ Mot de passe trop faible. Utilisez au moins 8 caractères, des majuscules, minuscules et chiffres.");
            setLoading(false);
            return;
        }

        if (!agreeTerms) {
            toast.warn("⚠️ Veuillez accepter les conditions d'utilisation");
            setLoading(false);
            return;
        }

        // Validation spécifique au rôle
        if (role === 'recruiter' && !companyInfo.companyName) {
            toast.warn("⚠️ Veuillez indiquer le nom de votre entreprise");
            setLoading(false);
            return;
        }

        try {
            // Créer les données d'inscription avec FormData pour gérer les fichiers
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);
            
            // Ajouter l'image de profil si présente
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }
            
            // Ajouter les informations spécifiques au rôle
            if (role === 'recruiter') {
                formData.append('companyInfo', JSON.stringify(companyInfo));
                
                // Ajouter le logo d'entreprise si présent
                if (companyLogo) {
                    formData.append('companyLogo', companyLogo);
                }
            } else if (role === 'candidate') {
                formData.append('candidateInfo', JSON.stringify({
                    skills: candidateInfo.skills
                }));
            }

            const res = await authService.register(formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            toast.success("🎉 Compte créé avec succès !", {
                icon: () => <CheckCircle size={24} className="toast-icon" />
            });

            // Vider les champs
            setName('');
            setEmail('');
            setPassword('');
            setRole('candidate');
            setProfileImage(null);
            setProfileImagePreview('');
            setCompanyLogo(null);
            setCompanyLogoPreview('');
            setCompanyInfo({
                companyName: '',
                industry: '',
                companySize: '',
                description: '',
                website: '',
                contactPhone: '',
                address: {
                    street: '',
                    city: '',
                    zipCode: '',
                    country: ''
                }
            });
            setCandidateInfo({
                skills: [],
                currentSkill: ''
            });

            setTimeout(() => {
                if (res.data.role === 'recruiter') {
                    navigate('/recruiters');
                } else if (res.data.role === 'candidate') {
                    navigate('/dashboard');
                }
                else if (res.data.role === 'admin') {
                    navigate('/admin/dashboard');
                }
            }, 1000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ Inscription échouée");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour rendre les champs spécifiques au rôle
    const renderRoleSpecificFields = () => {
        if (role === 'recruiter') {
            return (
                <>
                    <div className="form-section-divider">Informations de l'entreprise</div>
                    
                    <div className="required-fields-notice">
                        <span>*</span> Champs obligatoires
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="companyName">Nom de l'entreprise *</label>
                        <div className="input-icon-wrapper">
                            <Building size={20} className="input-icon" color="#94a3b8" />
                            <input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="Nom de votre entreprise"
                                value={companyInfo.companyName}
                                onChange={handleCompanyInfoChange}
                                required
                                disabled={loading}
                                className="input-with-icon"
                            />
                        </div>
                    </div>
                    
                    <div className="company-grid">
                        <div className="input-group">
                            <label htmlFor="industry">Secteur d'activité</label>
                            <div className="input-icon-wrapper">
                                <Briefcase size={20} className="input-icon" color="#94a3b8" />
                                <select
                                    id="industry"
                                    name="industry"
                                    value={companyInfo.industry}
                                    onChange={handleCompanyInfoChange}
                                    disabled={loading}
                                    className="select-enhanced"
                                >
                                    <option value="">Sélectionnez un secteur</option>
                                    <option value="Technology">Technologie</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Santé</option>
                                    <option value="Education">Éducation</option>
                                    <option value="Retail">Commerce de détail</option>
                                    <option value="Manufacturing">Fabrication</option>
                                    <option value="Services">Services</option>
                                    <option value="Other">Autre</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label htmlFor="companySize">Taille de l'entreprise</label>
                            <div className="input-icon-wrapper">
                                <User size={20} className="input-icon" color="#94a3b8" />
                                <select
                                    id="companySize"
                                    name="companySize"
                                    value={companyInfo.companySize}
                                    onChange={handleCompanyInfoChange}
                                    disabled={loading}
                                    className="select-enhanced"
                                >
                                    <option value="">Sélectionnez la taille</option>
                                    <option value="1-10">1-10 employés</option>
                                    <option value="11-50">11-50 employés</option>
                                    <option value="51-200">51-200 employés</option>
                                    <option value="201-500">201-500 employés</option>
                                    <option value="501-1000">501-1000 employés</option>
                                    <option value="1001+">1001+ employés</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="contactPhone">Téléphone</label>
                        <div className="input-icon-wrapper">
                            <Phone size={20} className="input-icon" color="#94a3b8" />
                            <input
                                id="contactPhone"
                                name="contactPhone"
                                type="tel"
                                placeholder="Numéro de téléphone"
                                value={companyInfo.contactPhone}
                                onChange={handleCompanyInfoChange}
                                disabled={loading}
                                className="input-with-icon"
                            />
                        </div>
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="website">Site web</label>
                        <div className="input-icon-wrapper">
                            <Globe size={20} className="input-icon" color="#94a3b8" />
                            <input
                                id="website"
                                name="website"
                                type="url"
                                placeholder="https://votre-site.com"
                                value={companyInfo.website}
                                onChange={handleCompanyInfoChange}
                                disabled={loading}
                                className="input-with-icon"
                            />
                        </div>
                    </div>
                    
                    {/* Upload de logo d'entreprise */}
                    <div className="input-group">
                        <label htmlFor="company-logo">Logo de l'entreprise</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="company-logo"
                                accept="image/*"
                                onChange={handleCompanyLogoUpload}
                                className="file-upload-input"
                                disabled={loading}
                            />
                            {!companyLogoPreview ? (
                                <div className="file-upload-button">
                                    <div className="file-upload-icon">
                                        <Upload size={28} color="#94a3b8" />
                                    </div>
                                    <div className="file-upload-text">
                                        Télécharger votre logo
                                        <div className="file-upload-text-sub">JPG, PNG ou GIF (max. 1MB)</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="file-upload-preview-container">
                                    <img
                                        src={companyLogoPreview}
                                        alt="Aperçu du logo"
                                        className="file-upload-preview"
                                    />
                                    <button
                                        type="button"
                                        className="file-remove"
                                        onClick={removeCompanyLogo}
                                        aria-label="Supprimer le logo"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            );
        } else if (role === 'candidate') {
            return (
                <>
                    <div className="form-section-divider">Compétences</div>
                    
                    <div className="input-group">
                        <label htmlFor="skills">Compétences</label>
                        <div className="input-icon-wrapper">
                            <Briefcase size={20} className="input-icon" color="#94a3b8" />
                            <input
                                id="skills"
                                type="text"
                                placeholder="Ajouter une compétence"
                                value={candidateInfo.currentSkill}
                                onChange={(e) => setCandidateInfo({...candidateInfo, currentSkill: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                disabled={loading}
                                className="input-with-icon"
                            />
                            <button 
                                type="button"
                                className="add-skill-btn"
                                onClick={addSkill}
                                disabled={!candidateInfo.currentSkill.trim()}
                            >
                                +
                            </button>
                        </div>
                        
                        {/* Affichage des compétences ajoutées */}
                        {candidateInfo.skills.length > 0 && (
                            <div className="skills-container">
                                {candidateInfo.skills.map((skill, index) => (
                                    <div key={index} className="skill-badge">
                                        {skill}
                                        <button 
                                            type="button" 
                                            className="remove-skill-btn"
                                            onClick={() => removeSkill(skill)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            );
        }
        
        return null;
    };

    return (
        <div className='auth-page-div'>
            <button
                className="back-home-btn"
                onClick={() => navigate('/')}
            >
                <ArrowLeft size={18} />
                Retour à l'accueil
            </button>

            <div className={`container ${isRegistering ? 'slide-register' : ''}`}>
                <div className="panel left-panel">
                    <div className="liquid-container">
                        <div className="logo-container">
                            <img className="jobifylogo" src={Jobifylogo} alt="Jobify Logo" />
                        </div>
                    </div>
                    <h2>Révolutionnez votre recrutement avec l'IA</h2>
                    
                    {/* Caractéristiques clés améliorées */}
                    <div className="key-features">
                        <div className="feature">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>Analyse intelligente des CV</span>
                        </div>
                        <div className="feature">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                            <span>Matchmaking précis</span>
                        </div>
                        <div className="feature">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                                <line x1="16" y1="8" x2="2" y2="22"></line>
                                <line x1="17.5" y1="15" x2="9" y2="15"></line>
                            </svg>
                            <span>Optimisation des processus</span>
                        </div>
                        <div className="feature">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Gain de temps considérable</span>
                        </div>
                        <div className="feature">
                            <Shield size={24} />
                            <span>Sécurité et confidentialité</span>
                        </div>
                    </div>
                    
                    {/* Indicateurs de confiance */}
                    <div className="trust-indicators">
                        <div className="trust-badge">
                            <span>+500 entreprises</span>
                        </div>
                        <div className="trust-badge">
                            <span>95% satisfaction</span>
                        </div>
                        <div className="trust-badge">
                            <span>Support 24/7</span>
                        </div>
                    </div>
                </div>

                <div className="panel form-wrapper">
                    <div className="forms">
                        {/* Login Form amélioré */}
                        <form onSubmit={handleLogin} className="login-form">
                            <h2>Connexion</h2>
                            <div className="input-group">
                                <label htmlFor="login-email">Adresse e-mail</label>
                                <div className="input-icon-wrapper">
                                    <Mail size={20} className="input-icon" color="#94a3b8" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="input-with-icon"
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label htmlFor="login-password">Mot de passe</label>
                                <div className="input-icon-wrapper">
                                    <Lock size={20} className="input-icon" color="#94a3b8" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="input-with-icon"
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="login-options">
                                <div className="checkbox-wrapper">
                                    <input 
                                        type="checkbox" 
                                        id="remember-me" 
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    <label htmlFor="remember-me">Se souvenir de moi</label>
                                </div>
                                <a href="#" className="forgot-password">Mot de passe oublié ?</a>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={loading ? 'btn-loading' : ''}
                            >
                                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
                                {!loading && <ChevronRight size={18} />}
                            </button>
                            
                            {/* Connexion via réseaux sociaux */}
                            <div className="social-login">
                                <div className="separator">
                                    <span>ou</span>
                                </div>
                                <div className="social-buttons">
                                    <button type="button" className="social-btn google">
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-3.153h2.354c2.217 0 3.412-1.364 3.412-3.15S15.422 15.7 13.177 15.7h-2.354v3.147zm0-4.547h2.354c1.825 0 2.5-.793 2.5-2.06s-.675-2.06-2.5-2.06h-2.354v4.12z" fill="#4285F4"></path>
                                        </svg>
                                        <span>Google</span>
                                    </button>
                                    <button type="button" className="social-btn linkedin">
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077B5"></path>
                                        </svg>
                                        <span>LinkedIn</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="toggle" onClick={() => setIsRegistering(true)}>
                                Pas encore de compte ? <span className="toggle-highlight">S'inscrire</span>
                            </div>
                        </form>

                        {/* Register Form amélioré */}
                        <form onSubmit={handleRegister} className="register-form">
                            <h2>Créer un compte</h2>
                            
                            <div className="input-group">
                                <label htmlFor="register-name">Nom complet</label>
                                <div className="input-icon-wrapper">
                                    <User size={20} className="input-icon" color="#94a3b8" />
                                    <input
                                        id="register-name"
                                        type="text"
                                        placeholder="Votre nom"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="input-with-icon"
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label htmlFor="register-email">Adresse e-mail</label>
                                <div className="input-icon-wrapper">
                                    <Mail size={20} className="input-icon" color="#94a3b8" />
                                    <input
                                        id="register-email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="input-with-icon"
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label htmlFor="register-password">Mot de passe</label>
                                <div className="input-icon-wrapper">
                                    <Lock size={20} className="input-icon" color="#94a3b8" />
                                    <input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="input-with-icon"
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                                    >
                                        {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                                    </button>
                                </div>
                                
                                {/* Indicateur de force du mot de passe */}
                                {password && (
                                    <div className="password-strength">
                                        <div className="strength-meter">
                                            <div 
                                                className={`strength-progress strength-${passwordStrength}`} 
                                                style={{ width: `${passwordStrength * 20}%` }}
                                            ></div>
                                        </div>
                                        <span className={`strength-text strength-${passwordStrength}`}>
                                            {passwordStrength === 0 && "Très faible"}
                                            {passwordStrength === 1 && "Faible"}
                                            {passwordStrength === 2 && "Moyen"}
                                            {passwordStrength === 3 && "Bon"}
                                            {passwordStrength === 4 && "Fort"}
                                            {passwordStrength === 5 && "Excellent"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Section de téléchargement de photo de profil */}
                            <div className="input-group">
                                <label htmlFor="profile-image">Photo de profil</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                        className="file-upload-input"
                                        disabled={loading}
                                    />
                                    {!profileImagePreview ? (
                                        <div className="file-upload-button">
                                            <div className="file-upload-icon">
                                                <User size={32} color="#94a3b8" />
                                            </div>
                                            <div className="file-upload-text">
                                                Cliquez pour télécharger une photo
                                                <div className="file-upload-text-sub">JPG, PNG ou GIF (max. 1MB)</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="file-upload-preview-container">
                                            <img
                                                src={profileImagePreview}
                                                alt="Aperçu de la photo de profil"
                                                className="file-upload-preview"
                                            />
                                            <button
                                                type="button"
                                                className="file-remove"
                                                onClick={removeProfileImage}
                                                aria-label="Supprimer l'image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label htmlFor="register-role">Je suis un</label>
                                <select 
                                    id="register-role"
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)} 
                                    required 
                                    disabled={loading}
                                    className="select-enhanced"
                                >
                                    <option value="candidate">Candidat</option>
                                    <option value="recruiter">Recruteur</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            
                            {/* Champs spécifiques au rôle */}
                            {renderRoleSpecificFields()}
                            
                            <div className="checkbox-wrapper terms-checkbox">
                                <input 
                                    type="checkbox" 
                                    id="agree-terms" 
                                    checked={agreeTerms}
                                    onChange={() => setAgreeTerms(!agreeTerms)}
                                    required
                                />
                                <label htmlFor="agree-terms">
                                    J'accepte les <a href="#" className="terms-link">conditions d'utilisation</a> et la <a href="#" className="terms-link">politique de confidentialité</a>
                                </label>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading || !agreeTerms}
                                className={loading ? 'btn-loading' : ''}
                            >
                                <span>{loading ? 'Inscription...' : 'S\'inscrire'}</span>
                                {!loading && <ChevronRight size={18} />}
                            </button>
                            
                            <div className="toggle" onClick={() => setIsRegistering(false)}>
                                Déjà inscrit ? <span className="toggle-highlight">Se connecter</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Notifications améliorées */}
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                className="toast-container"
            />
        </div>
    );
};

export default AuthPage;