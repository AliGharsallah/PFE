import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/AuthPage.css';
import Jobifylogo from "../assets/jobify-logo.svg";
import { authService } from '../services/api';
import { useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError } from 'axios';


const AuthPage: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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
            vy: (Math.random() - 0.5) * 0.5
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            for (const point of points) {
                point.x += point.vx;
                point.y += point.vy;

                if (point.x < 0 || point.x > width) point.vx *= -1;
                if (point.y < 0 || point.y > height) point.vy *= -1;

                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
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
                    ctx.strokeStyle = `rgba(0,255,255,${1 - dist / 120})`;
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

    // 🔐 Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authService.login({ email, password });
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
        } finally {
            setLoading(false);
        }
    };

    // 📝 Register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authService.register({ email, password, name, role });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            toast.success("🎉 Compte créé avec succès !");

            // Vider les champs
            setName('');
            setEmail('');
            setPassword('');
            setRole('candidate');

            setTimeout(() => {
                if (res.data.role === 'recruiter') {
                    navigate('/recruiters');
                } else if (res.data.role === 'candidate') {
                    navigate('/Condidates');
                }
            }, 1000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ Inscription échouée");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth-page-div'>
            <button
                className="back-home-btn"
                onClick={() => navigate('/')}

            >
                ⬅ Retour à l'accueil
            </button>

            <canvas id="plexus-canvas"></canvas>
            <div className={`container ${isRegistering ? 'slide-register' : ''}`}>
                <div className="panel left-panel">
                    <div className="liquid-container">

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
                                disabled={loading}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Connexion...' : 'Login'}
                            </button>
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
                                disabled={loading}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <select value={role} onChange={(e) => setRole(e.target.value)} required disabled={loading}>
                                <option value="recruiter">Employer</option>
                                <option value="candidate">Candidate</option>
                            </select>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Inscription...' : 'Register'}
                            </button>
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

export default AuthPage;