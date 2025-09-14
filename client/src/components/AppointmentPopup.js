import React, { useEffect, useState } from "react";
import { useRecipientId } from "../context/RecipientContext";
import axios from 'axios'
import "../stylesheets/Appointments.css";

const AppointmentPopup = ({ onClose }) => {
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({ doctorId: "", startTime: "", endTime: "", comType: "Video Call", notes: "", action: "Join Call" });
    const { recipientId, setRecipientId } = useRecipientId();

    useEffect(() => {
        if (recipientId) {
            setForm(prev => ({ ...prev, doctorId: recipientId }));
        }
    }, [recipientId]);

    const API = process.env.REACT_APP_API_BASE;
    const createAppointment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API}/appointments/create`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                withCredentials: true
            }
            )
            alert("Appointment booked")
            setForm({ doctorId: "", startTime: "", endTime: "", comType: "Video Call", notes: "", action: "Join Call" });
            setRecipientId(null);
            const res = await axios.get(API + "/appointments/my", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }, withCredentials: true
            })
            setAppointments(res.data);
        } catch (err) {
            alert("Failed to book appointment: " + err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <h2>Create New Appointment</h2>
                <form>
                    <input
                        type="text"
                        placeholder="Doctor"
                        className="form-input"
                        value={form.doctorId || recipientId}
                        onChange={e => setForm({ ...form, doctorId: e.target.value })}
                    />
                    <input
                        type="datetime-local"
                        className="form-input"
                        value={form.startTime}
                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                    />
                    <input
                        type="datetime-local"
                        className="form-input"
                        value={form.endTime}
                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                    />
                    <select
                        className="form-input"
                        value={form.comType}
                        onChange={e => setForm({ ...form, comType: e.target.value })}
                    >
                        <option value="Video Call">Video Call</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="In-Person">In-Person</option>
                    </select>
                    <textarea
                        placeholder="Notes"
                        className="form-textarea"
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}

                    ></textarea>
                    <div className="popup-actions">
                        <button type="button" className="popup-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="popup-submit" onClick={createAppointment}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentPopup