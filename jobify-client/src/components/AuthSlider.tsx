import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/Auth.css';
import Jobifylogo from "../assets/jobify-logo.svg";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthSlider: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    // 🔐 Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            toast.success(`✅ Connecté en tant que ${email}`);
            setTimeout(() => {
                if (res.data.role === 'recruiter') {
                    navigate('/recruiters');
                } else if (res.data.role === 'candidate') {
                    navigate('/Condidates');
                }
            }, 1000);

            // Vider les champs
            setEmail('');
            setPassword('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ Connexion échouée");
        }
    };

    // 📝 Register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                email,
                password,
                name,
                role,
            });

            localStorage.setItem('token', res.data.token);
            toast.success("🎉 Compte créé avec succès !");

            // Vider les champs
            setName('');
            setEmail('');
            setPassword('');
            setRole('candidate');
            setIsRegistering(false); // Retourner à la page login
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ Inscription échouée");
        }
    };

    return (
        <div className='auth-page-div'>
            <div className={`container ${isRegistering ? 'slide-register' : ''}`}>
                <div className="panel left-panel">
                    <div className="liquid-container">
                        <div className="blob"></div>
                        <div className="blob"></div>
                        <div className="logo-container">
                            <img className="jobifylogo" src={Jobifylogo} alt="" />
                        </div>
                    </div>
                    <h2>Revolutionize your hiring with AI.</h2>
                </div>

                <div className="panel form-wrapper">
                    <div className="forms">
                        {/* Login Form */}
                        <form onSubmit={handleLogin}>
                            <h2>Sign In</h2>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Login</button>
                            <div className="toggle" onClick={() => setIsRegistering(true)}>
                                Don't have an account? Register
                            </div>
                        </form>

                        {/* Register Form */}
                        <form onSubmit={handleRegister}>
                            <h2>Sign Up</h2>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <select value={role} onChange={(e) => setRole(e.target.value)} required>
                                <option value="recruiter">Employer</option>
                                <option value="candidate">Candidate</option>
                            </select>
                            <button type="submit">Register</button>
                            <div className="toggle" onClick={() => setIsRegistering(false)}>
                                Already have an account? Login
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default AuthSlider;
