import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [hostName, setHostName] = useState('');
  const [joinId, setJoinId] = useState('');
  // removed join token requirement
  const navigate = useNavigate();

  const createMeeting = async () => {
    // TODO: call backend API: POST /api/meetings with hostName
    // const res = await fetch('/api/meetings', { method: 'POST', body: JSON.stringify({ hostName }) });
    // const { roomId } = await res.json();
    const roomId = 'room123'; // placeholder
    navigate('/meet/' + roomId);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Meeting</h1>
      <div className="mb-2">
        <label className="block mb-1">Host Name</label>
        <input
          type="text"
          className="bg-gray-800 border border-gray-700 text-gray-100 p-2 w-full rounded"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
        />
      </div>
      {/* join token requirement removed */}
      <button
        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded"
        onClick={createMeeting}
      >
        Create Meeting
      </button>
      <hr className="my-6 border-gray-700" />
      <h2 className="text-2xl font-bold mb-4">Join Meeting</h2>
      <div className="mb-2">
        <label className="block mb-1">Meeting ID</label>
        <input
          type="text"
          className="bg-gray-800 border border-gray-700 text-gray-100 p-2 w-full rounded"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
        />
      </div>
      <button
        className="bg-green-600 hover:bg-green-500 text-white p-2 rounded"
        onClick={() => navigate('/meet/' + joinId)}
        disabled={!joinId}
      >
        Join Meeting
      </button>
    </div>
  );
};

export default Home; 