import React, { useState } from 'react';
import './Dashboard.css';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const { user } = useLocation().state;
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('')
  const [peerId, setPeerId] = useState('')

  const handleCall = () => {
    const userId = user._id
    const roomMembers = [ userId, peerId ]
    navigate(`/room/${roomId}`, {
      state: { roomId: roomId, userId: userId, roomMembers: roomMembers }
    })
  }

  return (
    <div className="dashboard">
        <p>{`${user.role.toUpperCase()}`}</p>
      <h2>Welcome Dr. {user?.email}</h2>
      <div className='containers'>
        <input
          type='text'
          placeholder='RoomId'
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          id='roomId'
        />
        <input
              type='text'
              placeholder='peerId'
              value={peerId}
              onChange={e => setPeerId(e.target.value)}
              id='peerId'
              />

        <button type='submit' onClick={handleCall}>Join</button>
      </div>
      <div className='navigations'>
        <ul>
            <li>Appointments</li>
        </ul>
      </div>
    </div>
  );
}
