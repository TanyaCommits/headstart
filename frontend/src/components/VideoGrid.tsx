import React from 'react';
import { MediaStreamInfo } from '../types';
import VideoTile from './VideoTile';

interface Props {
  streams: MediaStreamInfo[];
}

const VideoGrid: React.FC<Props> = ({ streams }) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {streams.map((streamInfo) => (
        <VideoTile key={streamInfo.userId} streamInfo={streamInfo} />
      ))}
    </div>
  );
};

export default VideoGrid;
