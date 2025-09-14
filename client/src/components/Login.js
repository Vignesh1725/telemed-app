import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/Login.css';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { setUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState("patient");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const sendTo = process.env.REACT_APP_API_BASE + '/auth/login';
            const res = await axios.post(sendTo, { email, password, role }, { withCredentials: true });
            console.log("Login successfully: ", res.data);
            const user = res.data.user;
            setUser(user);
            alert("Login successfully!");
            navigate('/dashboard');

        }
        catch (err) {
            console.log("Login failed: ", err)
            alert(err?.response?.data?.msg || "Login error");
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-left">
                <div className="signin-overlay">
                    <span className="signin-icon"><img src='./icons/favicon.png'></img></span>
                    <h1 className="signin-title">Welcome to TeleMed</h1>
                    <p className="signin-subtitle">Your trusted partner in digital healthcare</p>
                </div>
            </div>

            <div className="signin-right">
                <div className="form-box">
                    <h2 className="form-logo"><img src='./icons/logo.png'></img><span>TeleMed</span></h2>
                    <h3 className="form-heading">Welcome Back</h3>
                    <p className="form-subtext">Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="doctor@telemed.com"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="form-password-group">
                            <input
                                type="password"
                                placeholder="Password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <p className="forgot-password">Forgot password?</p>
                        <button className="signin-btn">Sign In</button>
                    </form>

                    <p className="signup-link">
                        Don't have an account? <Link to='/register'>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};


export default Login;