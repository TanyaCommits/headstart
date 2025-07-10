import React, { useEffect, useRef, useState } from 'react';

interface VideoTileProps {
  stream: MediaStream;
  userId: string;
  isLocal?: boolean;
  className?: string;
}

const VideoTile: React.FC<VideoTileProps> = ({ 
  stream, 
  userId, 
  isLocal = false, 
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Monitor track states
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        const checkVideoState = () => setIsVideoEnabled(videoTrack.enabled);
        videoTrack.addEventListener('ended', checkVideoState);
        
        return () => {
          videoTrack.removeEventListener('ended', checkVideoState);
        };
      }
      
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        const checkAudioState = () => setIsAudioEnabled(audioTrack.enabled);
        audioTrack.addEventListener('ended', checkAudioState);
        
        return () => {
          audioTrack.removeEventListener('ended', checkAudioState);
        };
      }
    }
  }, [stream]);

  // Periodic check for track state changes
  useEffect(() => {
    const interval = setInterval(() => {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
      }
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stream]);

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Local video should be muted to avoid feedback
        className="w-full h-full object-cover"
      />
      
      {/* User info overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {isLocal ? 'You' : userId}
      </div>
      
      {/* Video/Audio status indicators */}
      <div className="absolute top-2 right-2 flex gap-1">
        {!isVideoEnabled && (
          <div className="bg-red-500 text-white p-1 rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 13V8a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0012 5H8a1 1 0 00-.707.293L3.707 2.293zM13 9.414l2 2V8h-2v1.414zM8 9.414V8H6v5h2v-3.586z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {!isAudioEnabled && (
          <div className="bg-red-500 text-white p-1 rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* No video placeholder */}
      {!isVideoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <div className="text-center text-gray-300">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">{isLocal ? 'You' : userId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTile; 