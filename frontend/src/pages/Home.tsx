import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [hostName, setHostName] = useState('');
  const [joinId, setJoinId] = useState('');
  // removed join token requirement
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const createMeeting = async () => {
    if (!hostName) {
      console.warn('Host name is required to create a meeting');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName }),
      });
      if (!response.ok) {
        console.error('Failed to create meeting', response.statusText);
        return;
      }
      const data = await response.json();
      navigate(`/meet/${data.room_id}`);
    } catch (err) {
      console.error('Error creating meeting', err);
    }
  };

  return (
    <div className="w-full h-screen p-4 bg-gray-900 text-gray-100 flex flex-col justify-center items-center">

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