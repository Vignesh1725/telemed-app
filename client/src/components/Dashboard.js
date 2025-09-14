import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../stylesheets/Dashboard.css';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SideBar from './SideBar';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [appCount, setAppCount] = useState(0);

  const API = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (appointments.length === 0) return
    fetchAppCount();
  }, [appointments])

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API}/appointments/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        withCredentials: true
      })
      setAppointments(res.data)
      console.log("Fetched Appoinments: ", res.data)
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const fetchAppCount = async () => {
    const today = new Date().toDateString();
    const count = await appointments.filter(
      (apt) => new Date(apt.startTime).toDateString() === today
    ).length;
    setAppCount(count);
  };

  const handleGo = (nav) => {
    navigate(nav);
  }

  const getChatCount = () => {
    return 8;
  }

  return (
    <div className="dashboard-container">
      <SideBar id="dashboard" />

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Welcome back, {user?.role === "doctor" ? "Dr. " : null} {user?.firstName} {user?.lastName}</h1>
            <p>Here's what's happening with your patients today.</p>
          </div>
          <button className="new-appointment" onClick={() => navigate('/appointments')}>📅 New Appointment</button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total {user?.role === "doctor" ? "Patients" : "Doctors"}</p>
            <h2>{doctorsCount}</h2>
          </div>
          <div className="stat-card">
            <p>Today's Appointments</p>
            <h2>{appCount}</h2>
          </div>
          <div className="stat-card">
            <p>Active Chats</p>
            <h2>8</h2>
          </div>
          <div className="stat-card">
            <p>Response Time</p>
            <h2>2.3 min</h2>
          </div>
        </section>

        <section className="appointments-section">
          <h2>Today's Appointments</h2>
          <p>You have 2 upcoming appointments</p>
          {appointments.map((apt, i) => (
            <div key={i} className="appointment-card">
              <div>
                <strong>{apt?.doctor?.firstName} {apt?.doctor?.lastName}</strong>
                <p>{apt?.notes}</p>
              </div>
              <div className="details">
                <span>📅 {new Date(apt?.startTime).toLocaleDateString('en-GB')} ⏰ {new Date(apt?.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                <span className={`status ${apt?.status}`}>{apt.status}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <p>Frequently used features</p>
          <div className='btns'>
            <button className="quick-btn schedule" onClick={() => handleGo("/appointments")}>📅 Schedule Appointment</button>
            <button className="quick-btn chat" onClick={() => handleGo("/chatBox")}>💬 Start Chat</button>
            <button className="quick-btn view" onClick={() => handleGo("/profile")}>📈 View Reports</button>
          </div>
        </section>
      </main>
    </div>
  );
};