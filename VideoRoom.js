import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Peer from 'peerjs';
import { io } from 'socket.io-client';
import './VideoRoom.css';

const VideoRoom = () => {
  const location = useLocation()
  const params = useParams()
  const roomId = location.state?.roomId || params.roomId;
  const myId = location.state?.userId || params.userId;
  const friendId = location.state?.peerId || params.peerId;

  const [incomingCall, setIncomingCall] = useState(null)

  const [callStarted, setcallStarted] = useState(false)

  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);

  const myVideo = useRef();
  const friendVideo = useRef();

  useEffect(() => {
    
    const myPeer = new Peer(myId, {
      host: process.env.REACT_APP_HOST,
      port: 5001,
      path: '/peer'
    })

    myPeer.on('open', id => {
    console.log("Peer connected with ID:", id);
    setPeer(myPeer);
    })

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera/microphone not supported in this browser!');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(currentStream => {
      setStream(currentStream)

      if(myVideo.current){
        myVideo.current.srcObject = currentStream
      }

      myPeer.on('call', call => {
        setIncomingCall(call)
      })
    })
    .catch(err => {
      alert("Error accessing camera and microphone: " + err.message);
      console.log("Error: ",err)
    })
    return () => {
      if(peer) peer.destroy()
    }
}, [myId, peer, friendId]);

  const startCall = () => {
    try{
    if (!peer || !stream) return
    const call = peer.call(friendId, stream)
    setcallStarted(true)
    call.on('stream', friendStream => {
      friendVideo.current.srcObject = friendStream
    })
  }
  catch(err) {
    console.log("Error in calling")
  }
  }

  const answerCall = () => {
    try{
    if(!incomingCall || !stream) return
    setcallStarted(true)
    incomingCall.answer(stream)
    incomingCall.on('stream', friendStream => {
      friendVideo.current.srcObject = friendStream
    })
  }
  catch(err){
    console.log("Error in Answer")
  }
  }

  const disconnectCall = () => {
    try{
      if(incomingCall) {
        incomingCall.close()
        setIncomingCall(null)
      }
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setcallStarted(false)
    } catch(err) {
      console.log("Error in disconnecting call", err)
    }
  }
  
  return (
    <div className="=room">
      <h2>Room ID: {roomId}</h2>
      <div>
        <h4>My ID: {myId}</h4>
        <h4>Friend Id: {friendId}</h4>

        {!callStarted && friendId && (
          <button onClick={startCall}>Call</button>
        )}

        {!callStarted && incomingCall && (
          <button onClick={answerCall}>Answer</button>
        )}

        {callStarted && (
          <button onClick={disconnectCall}>End Call</button>
        )}
      </div>
      <div className="my-container">
        <h4>My Video</h4>
        <video ref={myVideo} muted playsInline autoPlay width="300"/>
      </div>
      {callStarted && (<div className="remote-container">
        <h4>Friend Video</h4>
        <video ref={friendVideo} playsInline autoPlay width="300"/>
      </div>)}
    </div>
  )
}
export default VideoRoom;
