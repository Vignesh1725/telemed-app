import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/Register.css';

const Register = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [specialization, setSpecialization] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();
        try {
            const sendTo = process.env.REACT_APP_API_BASE + '/auth/register';

            const payload = role === "doctor" ? { firstName, lastName, email, password, role, specialization, licenseNumber } : { firstName, lastName, email, password, role };

            const res = await axios.post(sendTo, payload, { withCredentials: true });
            console.log("Registration successfully: ", res.data);
            alert("Registration successfully! Login to continue.");
            navigate('/login');

        } catch (err) {
            console.error("Registration failed: ", err)
            alert(err?.response?.data?.msg || "Registration failed");
        }
    };

    return (
        <div className="register-container">
            <div className="register-left">
                <div className="register-overlay">
                    <span className="register-icon"><img src='./icons/favicon.png'></img></span>
                    <h1>Join TeleMed</h1>
                    <p>Start your journey in digital healthcare today</p>
                </div>
            </div>

            <div className="register-right">
                <div className="form-card">
                    <h2 className="form-logo"><img src='./icons/logo.png'></img><span>TeleMed</span></h2>
                    <h3>Create Account</h3>
                    <p className="subtitle">Join thousands of healthcare professionals</p>
                    <form onSubmit={handleSubmit}>
                        <div className="register-form">
                            <div className="input-row">
                                <input
                                    type="text"
                                    id='fname'
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    id='lname'
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <select
                                id='role'
                                name='role'
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option>Select your role</option>
                                <option value="doctor">Doctor</option>
                                <option value="patient">Patient</option>
                                <option value="admin">Admin</option>
                            </select>
                            {role === "doctor" ? <input
                                type="text"
                                id='special'
                                placeholder="Specialization (Optional)"
                                value={specialization}
                                onChange={e => setSpecialization(e.target.value)}
                            /> : null}
                            <div className="password-input">
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {role === "doctor" ? <input
                                type='text'
                                id='licenseNumber'
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                placeholder='LicenseNumber'
                                required
                            /> : null}
                            <button className="create-btn">Create Account</button>
                        </div>
                    </form>
                    <p className="signin-link">
                        Already have an account?  <Link to='/login'>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register; 
