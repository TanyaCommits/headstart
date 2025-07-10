import React, { useRef, useEffect } from 'react';
import { MediaStreamInfo } from '../types';

interface Props {
  streamInfo: MediaStreamInfo;
}

const VideoTile: React.FC<Props> = ({ streamInfo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && streamInfo.stream) {
      videoRef.current.srcObject = streamInfo.stream;
    }
  }, [streamInfo.stream]);

  return (
    <div className="relative rounded overflow-hidden border border-gray-700 bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted={streamInfo.isLocal}
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1 text-sm text-white flex justify-between items-center">
        <span>{streamInfo.isLocal ? 'You' : streamInfo.userId}</span>
        {/* Optional: mic/cam indicators */}
        {/* <span className="ml-2">{streamInfo.micMuted ? '🔇' : '🎤'}</span> */}
      </div>
    </div>
  );
};

export default VideoTile;
