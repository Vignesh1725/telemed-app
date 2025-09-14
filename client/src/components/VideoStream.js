import { useEffect, useRef } from "react";
import '../stylesheets/VideoRoom.css'

const VideoStream = ({ stream, userId }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="recipient-video-container">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={userId === "local"}
                className="recipient-video"
            />
            <p>Recipient</p>
        </div>
    );
};

export default VideoStream;
