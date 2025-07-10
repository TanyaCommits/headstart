/**
 * Clear old meeting data that might be cached from previous sessions
 */
export const clearOldMeetingData = () => {
  try {
    // Clear old room IDs that might be cached
    localStorage.removeItem('currentRoomId');
    localStorage.removeItem('lastRoomId');
    localStorage.removeItem('meetingHistory');
    sessionStorage.removeItem('currentRoomId');
    sessionStorage.removeItem('lastRoomId');
    sessionStorage.removeItem('meetingHistory');
    
    // Clear any WebSocket connection state
    localStorage.removeItem('wsState');
    sessionStorage.removeItem('wsState');
    
    // Clear any old meeting-related data
    const keysToRemove = [];
    
    // Check localStorage for meeting-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('meeting') || key.includes('room') || key.includes('ws'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('Old meeting data cleared');
  } catch (error) {
    console.error('Error clearing old meeting data:', error);
  }
};

/**
 * Check if we're trying to access a potentially invalid room
 */
export const isValidRoomIdFormat = (roomId: string): boolean => {
  // Check if room ID matches the expected format (8 character hex)
  return /^[a-f0-9]{8}$/.test(roomId);
};

/**
 * Clear URL parameters that might contain old room IDs
 */
export const clearUrlParams = () => {
  if (window.location.search || window.location.hash) {
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}; 