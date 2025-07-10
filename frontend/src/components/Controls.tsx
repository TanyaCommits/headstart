import React, { useState } from 'react';
import { MediaState } from '../types';

interface ControlsProps {
  roomId: string;
  mediaState: MediaState;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeaveRoom?: () => void;
  isLeavingMeeting?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  roomId,
  mediaState,
  onToggleVideo,
  onToggleAudio,
  onLeaveRoom,
  isLeavingMeeting = false
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border-t border-gray-700">
      {/* Room Info */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-300">
          <span className="font-medium">Room:</span> {roomId}
        </div>
        <button
          onClick={copyRoomId}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          {showCopied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>

      {/* Media Controls */}
      <div className="flex items-center space-x-4">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-full transition-colors ${
            mediaState.audio
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={mediaState.audio ? 'Mute microphone' : 'Unmute microphone'}
        >
          {mediaState.audio ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full transition-colors ${
            mediaState.video
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={mediaState.video ? 'Turn off camera' : 'Turn on camera'}
        >
          {mediaState.video ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 13V8a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0012 5H8a1 1 0 00-.707.293L3.707 2.293zM13 9.414l2 2V8h-2v1.414zM8 9.414V8H6v5h2v-3.586z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Leave Room */}
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            disabled={isLeavingMeeting}
            className={`px-4 py-2 rounded transition-colors flex items-center space-x-2 ${
              isLeavingMeeting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
            title={isLeavingMeeting ? "Leaving meeting..." : "Leave room"}
          >
            {isLeavingMeeting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isLeavingMeeting ? 'Leaving...' : 'Leave'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls; 