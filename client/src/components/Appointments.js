import React, { useEffect, useState } from "react";
import axios from "axios";
import AppointmentPopup from "./AppointmentPopup";
import '../stylesheets/Appointments.css';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRecipientId } from "../context/RecipientContext";
import SideBar from "./SideBar";
import { FaSearch } from "react-icons/fa";

const Appointments = () => {
  const { recipientId, setRecipientId } = useRecipientId();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const API = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const handleJoin = (apt) => {
    localStorage.setItem('recipientId', apt?.doctor?._id || apt?.doctor?.id);
    setRecipientId(apt?.doctor?._id || apt?.doctor?.id);
    navigate('/chatbox');
  }

  return (
    <div className="appointments-container">
      <SideBar id="appointments" />

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Appointments</h1>
            <p>Manage your patient appointments</p>
          </div>
          <div>
            <button className="new-appointment" onClick={() => setShowPopup(true)}>+ New Appointment</button>
            {showPopup && <AppointmentPopup onClose={() => setShowPopup(false)} />}
          </div>
        </header>

        <section className="filter-section">
          <h2>Filter Appointments</h2>
          <div className="filter-controls">
            <div className="search-box">
              <FaSearch style={{ color: "grey" }} />
              <input type="text" placeholder="Search appointments..." />
            </div>
            <select>
              <option>All</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
          </div>
        </section>

        <section className="appointments-lists">
          {appointments.map((apt, i) => (
            <div key={i} className="appointment-card">
              <div className="avatar">{apt.doctor?.firstName[0].toUpperCase()}{apt.doctor?.lastName[0].toUpperCase()}</div>
              <div className="info">
                <strong>{apt.doctor?.firstName} {apt.doctor?.lastName}</strong>
                <p>{apt.comType}</p>
                <p>{new Date(apt.startTime).toLocaleDateString('en-GB')} - {new Date(apt.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(apt.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
              <div className="details">
                <p>{apt.comType}</p>
                <span className={`status ${apt.status}`}>{apt.status}</span>
              </div>
              <div className="actions">
                <button className="join-call" onClick={handleJoin}>{apt.action}</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};


export default Appointments;