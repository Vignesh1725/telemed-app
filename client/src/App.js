import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import VideoRoom from './components/VideoRoom';
import Appointments from './components/Appointments';
import ChatBox from './components/ChatBox';
import Dashboard from './components/Dashboard';
import HealthStatus from './components/HealthStatus';
import Profile from './components/Profile';
import Doctors from './components/Doctors';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Register />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/room/:roomId' element={<VideoRoom />} />
        <Route path='/appointments' element={<Appointments />} />
        <Route path='/chatbox' element={<ChatBox />} />
        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/doctors' element={<Doctors />}></Route>
        <Route path='/healthstatus' element={<HealthStatus />} />
      </Routes>
    </div>
  );
}

export default App;
