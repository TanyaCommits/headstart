import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Meeting from './pages/Meeting';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/meet/:roomId" element={<Meeting />} />
    </Routes>
  );
};

export default App; 