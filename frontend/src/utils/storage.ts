/**
 * Clear all client-side storage (localStorage, sessionStorage, cookies)
 */
export const clearAllStorage = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB (if any)
    if (window.indexedDB) {
      // Get all databases and clear them
      // Note: This is a best-effort cleanup for any potential IndexedDB usage
      indexedDB.databases?.().then((databases) => {
        databases.forEach(({ name }) => {
          if (name) {
            indexedDB.deleteDatabase(name);
          }
        });
      }).catch((error) => {
        console.warn('Failed to clear IndexedDB:', error);
      });
    }
    
    // Clear cookies (domain-specific)
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    console.log('All client-side storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Clear WebSocket-related storage only
 */
export const clearWebSocketStorage = () => {
  try {
    // Clear specific WebSocket-related items
    localStorage.removeItem('webSocketState');
    sessionStorage.removeItem('webSocketState');
    sessionStorage.removeItem('roomId');
    sessionStorage.removeItem('meetingData');
    
    console.log('WebSocket storage cleared');
  } catch (error) {
    console.error('Error clearing WebSocket storage:', error);
  }
};

/**
 * Clear media-related storage and permissions
 */
export const clearMediaStorage = () => {
  try {
    // Clear media-related storage
    localStorage.removeItem('mediaPermissions');
    sessionStorage.removeItem('mediaState');
    
    // Note: We can't programmatically revoke media permissions,
    // but we can clear any cached permission states
    console.log('Media storage cleared');
  } catch (error) {
    console.error('Error clearing media storage:', error);
  }
}; 