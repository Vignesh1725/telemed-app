import React from "react";
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import "../stylesheets/Profile.css";
import SideBar from "./SideBar";
import { FaStar } from "react-icons/fa";

const Profile = () => {
    const { user } = useAuth();
    const email = user?.email || null;
    const userId = user?._id || null;
    const role = user?.role || null;
    const firstName = user?.firstName || null
    const lastName = user?.lastName || null
    const specialization = user?.specialization || null;

    const getInitials = (firstName, lastName) => {
        return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    }

    return (
        <div className="profile-container">
            <SideBar id="profile" />

            <main className="main-content">
                <header className="profile-header">
                    <div>
                        <h1>Profile</h1>
                        <p>Manage your professional information</p>
                    </div>
                    <button className="edit-profile">Edit Profile</button>
                </header>

                <div className="profile-layout">
                    <section className="profile-left">
                        <div className="profile-card">
                            <div className="avatar-circle">{getInitials(firstName, lastName)}</div>
                            <h2>{firstName}{lastName}</h2>
                            <p className="specialty">{role?.toUpperCase()}</p>
                            <p className="specialty">{user?._id}</p>
                            <div className="tags">
                                {user?.role === "doctor" && <span>{user?.specialization}</span>}
                            </div>
                            <div className="contact-info">
                                <p>{user?.email}</p>
                                <p>+1 (555) 123-4567</p>
                                <p>New York, NY</p>
                            </div>
                        </div>
                    </section>

                    <section className="profile-right">
                        <div className="stats-box">
                            <h3>Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat">
                                    <h2>2,543</h2>
                                    <p>Total Patients</p>
                                </div>
                                <div className="stat">
                                    <h2>1,847</h2>
                                    <p>Consultations</p>
                                </div>
                                <div className="stat">
                                    <h2>98.5%</h2>
                                    <p>Success Rate</p>
                                </div>
                                <div className="stat">
                                    <h2>15</h2>
                                    <p>Years Experience</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-box">
                            <h3>Professional Information</h3>
                            <p className="sub">Your medical credentials and experience</p>
                            <div className="row">
                                <div>
                                    <label>License Number</label>
                                    <div className="readonly-field">NY-12345678</div>
                                </div>
                                <div>
                                    <label>Years of Experience</label>
                                    <div className="readonly-field">15 years</div>
                                </div>
                            </div>
                            <label>Education</label>
                            <div className="readonly-field">MD from Harvard Medical School</div>
                        </div>

                        <div className="info-box">
                            <h3>Professional Bio</h3>
                            <p className="sub">Tell patients about your background and expertise</p>
                            <p className="bio-text">
                                Experienced cardiologist with over 15 years in cardiovascular medicine. Specialized in preventive cardiology and heart disease management.
                            </p>
                        </div>

                        <div className="info-box">
                            <h3>Recent Activity</h3>
                            <p className="sub">Your latest professional activities</p>
                            <ul className="activity-list">
                                <li><span><FaStar /></span> Completed consultation with Sarah Johnson <time>2 hours ago</time></li>
                                <li><span><FaStar /></span> Completed consultation with Sarah Johnson <time>2 hours ago</time></li>
                                <li><span><FaStar /></span> Updated patient care protocol <time>1 day ago</time></li>
                                <li><span><FaStar /></span> Attended cardiology conference <time>3 days ago</time></li>
                                <li><span><FaStar /></span> Published research paper <time>1 week ago</time></li>
                            </ul>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Profile;
