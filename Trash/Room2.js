import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:4000");
const roomId = "room123";

export default function VideoRoom() {
  const myVideo = useRef();
  const remoteVideo = useRef();
  const peerRef = useRef(null);  // NEW
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Get camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      myVideo.current.srcObject = currentStream;

      // Join room
      socket.emit("join-room", roomId);

      // Case 1: You are joining second — wait to receive offer
      socket.on("room-joined", () => {
        const peer = createPeer(false, currentStream);
        peerRef.current = peer;
      });

      // Case 2: You are first — someone else joins, you send offer
      socket.on("user-joined", () => {
        const peer = createPeer(true, currentStream);
        peerRef.current = peer;
      });

      // When signal data comes in — always apply to active peer
      socket.on("signal", ({ data }) => {
        if (peerRef.current) {
          peerRef.current.signal(data);
        }
      });
    });
  }, []);

  const createPeer = (initiator, stream) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("signal", { roomId, data });
    });

    peer.on("stream", (remoteStream) => {
      console.log("📽 Received remote stream");
      remoteVideo.current.srcObject = remoteStream;
    });

    return peer;
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div>
        <h3>👤 You</h3>
        <video ref={myVideo} autoPlay muted style={{ width: "300px" }} />
      </div>
      <div>
        <h3>🧑‍⚕️ Peer</h3>
        <video ref={remoteVideo} autoPlay style={{ width: "300px" }} />
      </div>
    </div>
  );
}
