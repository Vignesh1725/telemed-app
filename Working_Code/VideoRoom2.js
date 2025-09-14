// Enter two user id to enter into the video room
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import io from "socket.io-client";

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
  let socket
  const { roomId } = useParams();
  const userId = useLocation().state?.userId || '';
  const roomMembers = useLocation().state?.roomMembers || [];
  const [remoteStreams, setRemoteStreams] = useState({});
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRefs = useRef({});
  const socketRef = useRef();
  const pendingIce = {};
  const initialized = useRef(false);

  useEffect(() => {
    console.log("Initializing VideoRoom for room:", roomId);
    console.log("Room Members:", roomMembers);

    let stream;
    socketRef.current = io("http://localhost:5000");
    socket = socketRef.current;

    const init = async () => {;
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socket.emit("join-room", { roomId, userId, roomMembers });
    };

    const handleUserConnected = (userId) => {
      console.log("👤 New user connected:", userId);
      createOffer(userId, localStreamRef.current);
    };

    const handleOffer = async ({ from, offer }) => {
      if (peerConnections[from]) return;

      const pc = new RTCPeerConnection(config);
      peerConnections[from] = pc;

      const pendingCandidates = [];

      localStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localStreamRef.current)
      );

      pc.onicecandidate = event => {
        if (event.candidate) {
          socket.emit("ice-candidate", { to: from, candidate: event.candidate });
        }
      };

      pc.ontrack = event => {
        setRemoteStreams(prev => ({
          ...prev,
          [from]: event.streams[0]
        }));
      };

      socket.on("ice-candidate", async ({ from: iceFrom, candidate }) => {
        if (iceFrom === from) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            pendingCandidates.push(candidate);
          }
        }
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      if (pendingIce[from]) {
        for (const c of pendingIce[from]) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        delete pendingIce[from]; // clean up
      }

      for (const c of pendingCandidates) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    };

    const handleAnswer = async ({ from, answer }) => {
      const pc = peerConnections[from];
      if (!pc) return;

      console.log(`Signaling state before applying answer from ${from}:`, pc.signalingState);

      if (pc.signalingState === "have-local-offer") {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log(`✅ Remote description set for ${from}`);
        } catch (err) {
          console.error(`❌ Failed to set remote description for ${from}:`, err);
        }
      } else {
        console.warn(`⚠️ Skipping setRemoteDescription for ${from} - current state: ${pc.signalingState}`);
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peerConnections[from];
      if (pc && pc.remoteDescription && pc.remoteDescription.type !== "") {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!pendingIce[from]) pendingIce[from] = [];
        pendingIce[from].push(candidate);
      }
    };

    const handleUserDisconnected = userId => {
      const pc = peerConnections[userId];
      if (pc) {
        pc.close();
        delete peerConnections[userId];
        setRemoteStreams(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    };

    const handleUnauthorized =() => {
      alert("You are not authorized to join this room.");
    }

    init();

    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("unauthorized", handleUnauthorized)

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, [roomId]);


  useEffect(() => {
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      const videoElement = remoteVideoRefs.current[userId];
      if (videoElement && stream && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);


  //Function to create an offer
  const createOffer = async (userId, stream) => {
    if (peerConnections[userId]) return;
    const pc = new RTCPeerConnection(config);
    peerConnections[userId] = pc;

    localStreamRef.current.getTracks().forEach(track =>
      pc.addTrack(track, localStreamRef.current)
    );

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: userId, candidate: event.candidate });
      }
    };

    pc.ontrack = event => {
      const incomingTrack = event.track;
      const currentStream = remoteStreams[userId];

      if (!currentStream) {
        const newStream = new MediaStream([incomingTrack]);
        setRemoteStreams(prev => ({
          ...prev,
          [userId]: newStream
        }));
      } else if (!currentStream.getTracks().find(t => t.id === incomingTrack.id)) {
        currentStream.addTrack(incomingTrack);
        setRemoteStreams(prev => ({
          ...prev,
          [userId]: currentStream
        }));
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { to: userId, offer });
  };

  return (
    <div className="video-room">
      <h2>Room: {roomId}</h2>
      <video ref={localVideoRef} autoPlay muted playsInline width="300" />
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <video
          key={userId}
          autoPlay
          playsInline
          ref={el => {
            if (el) remoteVideoRefs.current[userId] = el;
          }}
           width="300"
        />
      ))}
    </div>
  );
};

export default VideoRoom;
