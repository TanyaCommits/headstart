import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';

const Meeting: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  // no token required
  const { state, connect } = useWebSocket();

  useEffect(() => {
    if (roomId) {
      connect(roomId);
    }
  }, [roomId]);

  // removed manual join control

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Meeting: {roomId}</h1>
      {state === 'connecting' && <div className="mb-2">Connecting...</div>}
      {state === 'connected' && <div className="mb-2">Connected!</div>}
      {state === 'error' && <div className="mb-2 text-red-500">Error connecting.</div>}
      {/* join token input removed */}
      {/* TODO: Meeting UI goes here */}
    </div>
  );
};

export default Meeting; 