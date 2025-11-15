import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../stylesheets/ChatBox.css';
import { io } from 'socket.io-client'
import { useAuth } from "../context/AuthContext";
import { useRecipientId } from "../context/RecipientContext";
import SideBar from "./SideBar";
import { FaPhone, FaSearch, FaVideo, FaEllipsisH, FaEllipsisV, FaPaperPlane, FaPaperclip } from "react-icons/fa";

const ChatBox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recipientId, setRecipientId } = useRecipientId();
  const userEmailId = user?.email || null;
  const userId = user?._id || null;
  const getInitials = (firstName = '', lastName = '') =>
    `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  const [recipient, setRecipient] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const [avatar, setAvatar] = useState('');
  const messageInputRef = useRef(null);

  const API = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("Disconnected with socket: ", socketRef.current.id);
        socketRef.current?.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const storedId = recipientId || localStorage.getItem('recipientId');
    if (storedId) {
      setRecipientId(storedId);
    }
  }, []);

  useEffect(() => {
    if (!user?.role || friendList.length > 0) return;
    user.role === "doctor" ? handleFetchPatients() : handleFetchFriends();
  }, [user?.role])

  useEffect(() => {
    if (recipientId && friendList.length > 0) {
      const match = friendList.find(f =>
        f._id === recipientId || f.id === recipientId
      );
      if (match) {
        handleClick(match);
      }
    }
  }, [recipientId, friendList]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    try {
      if (!userId) return;
      socketRef.current = io("ws://localhost:5000")
      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log("Connected with socket ID:", socket.id);
        socket.emit('join-room', { userId })
      });

      const handleReceiveMessage = ({ senderName, senderId, recipientId, message }) => {
        const isChatActive =
          recipient?._id &&
          (senderId === recipient._id || recipientId === recipient._id);

        if (isChatActive && senderName && message) {
          const time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          setChat((prev) => [...prev, { senderName, message, time }]);
          console.log("Message added to current chat:", message);
        } else {
          console.log("Message ignored (not in active chat)");
        }
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.disconnect();
      };
    }
    catch (err) {
      console.error("Error in ChatBox Socket Connection: ", err.message)
    }
  }, [userId, recipient?._id]);

  const handleFetchFriends = async () => {
    try {
      const res = await axios.get(`${API}/friends/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }, withCredentials: true
      })
      setFriendList(res.data);
      console.log("Friend List is fetched");
    } catch (err) {
      console.error("Error in fetch friendlist: ", err.message);
    }

  }

  const handleFetchPatients = async () => {
    try {
      const res = await axios.get(`${API}/friends/mypatients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }, withCredentials: true
      });
      setFriendList(res.data);
      console.log("Patients list is fetched: ", res.data);
    } catch (err) {
      console.error("Error in fetch Patient Friend list", err.message);
    }
  }

  const handleClick = async (list) => {
    setRecipientId(list?._id || list?.id);
    setRecipient(list);
    setAvatar(getInitials(list.firstName, list.lastName));
    const res = await axios.get(`${API}/messages/getmsg/${list._id || list.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }, withCredentials: true
    })
    setChat(res.data.map(m => ({
      senderName: m.senderId.toString() === userId.toString() ? 'You' : list.firstName,
      message: m.message,
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    })));
    messageInputRef.current?.focus();
  }

  const send = async () => {
    if (!recipient?._id || !message.trim()) return;

    const newMsg = {
      sender: userEmailId,
      senderId: userId,
      recipientId: recipient._id,
      message
    };

    socketRef.current.emit('send_message', newMsg);
    setMessage('');
  };

  const handleVideoCall = () => {
    if (!userId || !recipient?._id) {
      alert("Enter the recipient id");
      return;
    }
    const createRoomId = [userId, recipient._id].sort().join('_')
    navigate(`/room/${createRoomId}`)
  }

  return (
    <div className="chat-container">
      <SideBar id="chat" />

      <main className="chat-main-content">
        <section className="chat-sidebar">
          <h2>Messages</h2>
          <div className="search-bar">
            <FaSearch style={{ color: "grey" }} />
            <input type="text" placeholder="Search conversations..." />
          </div>

          <ul>
            {friendList.map((list, i) =>
            (
              <li key={list._id} onClick={() => handleClick(list)}>
                <div className={`conversation ${recipientId === list._id ? "selected" : ""}`}>
                  <div className="avatar mc">{getInitials(list.firstName, list.lastName)}</div>
                  <div className="preview">
                    <strong>{list.firstName}</strong>
                    <p>Recent messages showed here....</p>
                  </div>
                  <span className="badge">1</span>
                </div>
                <hr className="next-hr"></hr>
              </li>
            )
            )}
          </ul>
        </section>

        <section className="chat-area">
          <header className="chat-header">
            <div className="user-info">
              <div className="avatar sj">{avatar}</div>
              <div>
                <strong>{recipient?.firstName || "Select a contact"}</strong>
                <p className="online">Online</p>
              </div>
            </div>
            <div className="chat-actions">
              <button><FaPhone /></button>
              <button onClick={handleVideoCall}><FaVideo /></button>
              <button><FaEllipsisV /></button>
            </div>
          </header>

          <div className="messages">
            {chat.map((c, i) => (
              <div key={i} className={`message ${c.senderName === 'You' ? 'sent' : 'received'}`}>
                <p>{c.message}</p>
                <span>{c.time}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <footer className="chat-input">
            <button><FaPaperclip /></button>
            <input
              ref={messageInputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button onClick={send} disabled={!message.trim()} className="send"><FaPaperPlane /></button>
          </footer>
        </section>
      </main >
    </div >
  );
};

export default ChatBox;