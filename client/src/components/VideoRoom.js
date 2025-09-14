// client/VideoRoom.js
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import '../stylesheets/VideoRoom.css'
import VideoStream from "./VideoStream";

const peerConnections = {};
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:YOUR_TURN_DOMAIN:3478",
      username: "demo",
      credential: "securepassword"
    }
  ]
};

const VideoRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || null;
  const { roomId } = useParams();

  const [remoteStreams, setRemoteStreams] = useState({});
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRefs = useRef({});
  const socketRef = useRef(null);
  const pendingIce = useRef({});

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    const init = async () => {
      try {
        socket.emit("join-room", { roomId, userId });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit("ready", { userId, roomId });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    }
    const handleUserConnected = (remoteUserId) => {
      console.log("👤 New user connected:", remoteUserId);
      createOffer(remoteUserId);
    };

    const handleOffer = async ({ from, offer }) => {
      console.log('Received offer from:', from, 'offer:', offer); // Debug log

      if (!from || !offer) {
        console.error('Invalid offer - missing from or offer fields');
        return;
      }

      if (peerConnections[from]) {
        console.log('Peer connection already exists for:', from);
        return;
      }

      const pc = new RTCPeerConnection(config);
      peerConnections[from] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
        console.log("📹 Local stream tracks:", localStreamRef.current?.getTracks());
      }

      pc.onicecandidate = event => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            to: from,
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = event => {
        console.log("📥 Remote stream received from offer:", from, event.streams[0]);
        if (event.streams && event.streams[0]) {
          setRemoteStreams(prev => ({
            ...prev,
            [from]: event.streams[0]
          }));
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process pending ICE candidates
        if (pendingIce.current[from]?.length) {
          console.log('Processing pending ICE candidates for:', from);
          for (const candidate of pendingIce.current[from]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error("Error adding ICE candidate:", err);
            }
          }
          delete pendingIce.current[from];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("answer", { to: from, answer });
      } catch (err) {
        console.error("Error handling offer:", err);
        // Clean up on error
        if (peerConnections[from]) {
          peerConnections[from].close();
          delete peerConnections[from];
        }
      }
    };

    const handleAnswer = async ({ from, answer }) => {
      const pc = peerConnections[from];
      if (!pc) return;

      if (pc.signalingState === "have-local-offer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log(`✅ Remote description set for ${from}`);
        } catch (err) {
          console.error(`❌ Failed to set remote description for ${from}:`, err);
        }
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peerConnections[from];
      if (pc && pc.remoteDescription && pc.remoteDescription.type !== "") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        if (!pendingIce[from]) pendingIce[from] = [];
        pendingIce[from].push(candidate);
      }
    };

    const handleUserDisconnected = (remoteUserId) => {
      const pc = peerConnections[remoteUserId];
      if (pc) {
        pc.close();
        delete peerConnections[remoteUserId];
        setRemoteStreams(prev => {
          const updated = { ...prev };
          delete updated[remoteUserId];
          return updated;
        });
      }
    };

    const handleUnauthorized = () => {
      alert("You are not authorized to join this room.");
      navigate("/unauthorized");
    };

    // Socket listeners
    init();
    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("unauthorized", handleUnauthorized);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("unauthorized", handleUnauthorized);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      Object.values(peerConnections).forEach(pc => pc.close());
      Object.keys(peerConnections).forEach(key => delete peerConnections[key]);

      socket.disconnect();
    };
  }, [roomId, userId, navigate]);

  const createOffer = useCallback(async (remoteUserId) => {
    if (peerConnections[remoteUserId]) return;

    const pc = new RTCPeerConnection(config);
    peerConnections[remoteUserId] = pc;

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });
    console.log("📹 Local stream tracks:", localStreamRef.current?.getTracks());

    pc.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", { to: remoteUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = event => {
      console.log("📥 Remote stream received from answer:", remoteUserId, event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStreams(prev => ({
          ...prev,
          [remoteUserId]: event.streams[0]
        }));
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("offer", { to: remoteUserId, offer });
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  }, []);

  const handleBack = () => {
    // Force stop camera immediately
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connections instantly
    for (const key in peerConnections) {
      peerConnections[key].close();
      delete peerConnections[key];
    }

    // Disconnect socket without waiting
    socketRef.current?.disconnect();

    // Hard navigate without adding to browser history
    window.location.replace("/chatbox");
  };


  return (
    <div className="video-room">
      <div className="video-room-header">
        <button className="back-button" onClick={handleBack}>⟵ Back</button>
        <h2 className="room-id">Video Room</h2>
      </div>
      <div className="video-section">
        <div>
          {Object.entries(remoteStreams).map(([remoteUserId, stream]) => (
            <VideoStream
              key={remoteUserId}
              stream={stream}
              userId={remoteUserId}
            />
          ))}
        </div>
        <div className="local-video-overlay">
          <p>You</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="video-player-local"
          />
        </div>
      </div>
    </div>
  );

};

export default VideoRoom;
