import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRecipientId } from "../context/RecipientContext";
import axios from "axios";
import "../stylesheets/Doctors.css";
import AppointmentPopup from "./AppointmentPopup";
import SideBar from "./SideBar";

const Doctors = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { user } = useAuth();
    const { setRecipientId } = useRecipientId();
    const [doctorsList, setDoctorsList] = useState([]);
    const [friendList, setFriendList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        doctorsFetch();
        fetchFriendList();
    }, [API]);

    const doctorsFetch = async () => {
        try {
            const res = await axios.get(`${API}/doctors/doclist`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }, withCredentials: true
            });
            setDoctorsList(res.data);
        } catch (err) {
            console.error("Error in fetching doctors list: ", err.message);
        }
    }

    const fetchFriendList = async () => {
        try {
            const res = await axios.get(`${API}/friends/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                withCredentials: true,
            });
            setFriendList(res.data.map(f => f._id));
        } catch (err) {
            console.error("Error fetching friend list: ", err.message);
        }
    };
    const handleCreateFriend = async (friendId) => {
        try {
            const form = {
                userId: user._id,
                friendId: friendId,
                status: "accepted"
            };
            await axios.post(`${API}/friends/create`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }, withCredentials: true
            });
            alert("Added to your chatlist");
            setFriendList([...friendList, friendId]);
        } catch (err) {
            console.error("Error in create friend: ", err.message);
        }
    }

    const handleClick = async (id) => {
        setRecipientId(id);
        setTimeout(() => setShowPopup(true), 0);
    }

    const handleProfile = (id) => {

    }

    return (
        <div className="appointments-container">
            {/* Sidebar Section */}
            <SideBar id="doctors" />

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <div>
                        <h1>Doctors</h1>
                        <p>Explore available medical professionals</p>
                    </div>
                </header>

                <section className="doctors-grid">
                    {doctorsList.map((doc) => {
                        const isAlreadyFriend = friendList.includes(doc._id);
                        return (
                            <div key={doc._id} className="doctor-card" onClick={() => handleProfile(doc._id)}>
                                <img src={"https://randomuser.me/api/portraits/men/29.jpg"} alt={doc.firstName} className="doctor-img" />
                                <h3 className="doctor-name">{doc.firstName}</h3>
                                <p className="doctor-specialization">{doc.specialization}</p>
                                <div className="doctor-rating">⭐ {4.5}</div>
                                <p
                                    className={`doctor-availability ${doc ? "available" : "unavailable"
                                        }`}
                                >
                                    {doc.availability}
                                </p>
                                <button className="book-btn" onClick={() => handleClick(doc._id)}>Book Now</button>
                                <button className={isAlreadyFriend ? "already-btn" : "chat-btn"} onClick={() => handleCreateFriend(doc._id)} disabled={isAlreadyFriend}>{isAlreadyFriend ? "Added" : "Chat Now"}</button>
                            </div>
                        )
                    })}
                </section>
                {showPopup && <AppointmentPopup onClose={() => setShowPopup(false)} />}
            </main>
        </div>
    );
};

export default Doctors;
