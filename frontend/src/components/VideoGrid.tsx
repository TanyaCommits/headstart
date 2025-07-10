import React from 'react';
import { MediaStreamInfo } from '../types';
import VideoTile from './VideoTile';

interface VideoGridProps {
  streams: MediaStreamInfo[];
  className?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ streams, className = '' }) => {
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const gridCols = getGridCols(streams.length);

  return (
    <div className={`grid ${gridCols} gap-4 w-full h-full ${className}`}>
      {streams.map((streamInfo, index) => (
        <VideoTile
          key={streamInfo.userId || index}
          stream={streamInfo.stream}
          userId={streamInfo.userId}
          isLocal={streamInfo.isLocal}
          className="aspect-video"
        />
      ))}
    </div>
  );
};

export default VideoGrid; 