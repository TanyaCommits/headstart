import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { useMediaStream } from '../hooks/useMediaStream';
import VideoGrid from '../components/VideoGrid';
import Controls from '../components/Controls';
import { MediaStreamInfo } from '../types';
import { deleteMeeting } from '../utils/api';
import { clearAllStorage, clearWebSocketStorage, clearMediaStorage } from '../utils/storage';
import { isValidRoomIdFormat } from '../utils/clearOldData';

const Meeting: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [isLeavingMeeting, setIsLeavingMeeting] = useState(false);

  

  const { state, connect, disconnect, sendSignal } = useWebSocket();

  const {
    stream,
    mediaState,
    error,
    toggleVideo,
    toggleAudio,
    startStream,
    stopStream
  } = useMediaStream();
  
  useEffect(() => {
    if (roomId) {
      console.log(`Connecting to room: ${roomId}`);
      connect(roomId);
    }
    return () => {
      disconnect();
    };
  }, [roomId]); // Remove 'connect' from dependencies to prevent reconnection loops

  useEffect(() => {
    if (state === 'connected' && !stream) {
      console.log('Starting media stream...');
      startStream();
    }
  }, [state]); // Remove 'startStream' from dependencies

  // Remove this useEffect as cleanup is handled above

  // Cleanup on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Clear storage when user navigates away/refreshes
      clearWebSocketStorage();
      clearMediaStorage();
      
      // Stop streams
      stopStream();
      disconnect();
      
      // Optional: Show confirmation dialog
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave the meeting?';
    };

    const handleUnload = () => {
      // Final cleanup when page is actually unloading
      clearAllStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []); // Empty dependency array to prevent re-registering listeners

  const handleLeaveRoom = async () => {
    if (isLeavingMeeting) return; // Prevent multiple clicks
    
    setIsLeavingMeeting(true);
    
    try {
      // Stop media stream first
      stopStream();
      
      // Disconnect WebSocket
      disconnect();
      
      // Delete the meeting room from backend
      if (roomId) {
        const result = await deleteMeeting(roomId);
        if (result.success) {
          console.log('Meeting room deleted successfully:', result.data?.message);
        } else {
          console.error('Failed to delete meeting room:', result.error);
          // Continue with cleanup even if deletion fails
        }
      }
      
      // Clear all client-side storage
      clearAllStorage();
      clearWebSocketStorage();
      clearMediaStorage();
      
      // Navigate back to home
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error during leave meeting:', error);
      // Still navigate home even if cleanup fails
      navigate('/', { replace: true });
    } finally {
      setIsLeavingMeeting(false);
    }
  };

  if (!roomId || !isValidRoomIdFormat(roomId)) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Room ID</h1>
          <p className="text-gray-400 mb-4">
            {!roomId 
              ? 'No room ID provided' 
              : 'This room ID format is invalid or from an old session'
            }
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Create stream info for the local user
  const streams: MediaStreamInfo[] = stream ? [{
    stream,
    userId: 'local-user',
    isLocal: true
  }] : [];

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Meeting: {roomId}</h1>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <div className={`flex items-center ${
            state === 'connected' ? 'text-green-400' : 
            state === 'connecting' ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              state === 'connected' ? 'bg-green-400' : 
              state === 'connecting' ? 'bg-yellow-400' : 
              'bg-red-400'
            }`}></div>
            {state === 'connecting' && 'Connecting...'}
            {state === 'connected' && 'Connected'}
            {state === 'error' && 'Connection Error - Room may not exist'}
            {state === 'disconnected' && 'Disconnected'}
          </div>
          {error && <div className="text-red-400">Media Error: {error}</div>}
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 p-4">
        {streams.length > 0 ? (
          <VideoGrid streams={streams} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg mb-2">Camera Off</p>
              <p className="text-sm">Enable your camera to start the meeting</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <Controls
        roomId={roomId}
        mediaState={mediaState}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onLeaveRoom={handleLeaveRoom}
        isLeavingMeeting={isLeavingMeeting}
      />
    </div>
  );
};

export default Meeting; 