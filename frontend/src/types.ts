export type ConnectionState = 'connecting' | 'connected' | 'error' | 'disconnected'; 

export interface AckMessage {
  type: 'ack';
  bytes: number;
  timestamp: number;
}

export interface MediaStreamInfo {
  stream: MediaStream;
  userId: string;
  isLocal: boolean;
}

export interface AudioChunkData {
  buffer: ArrayBuffer;
  timestamp: number;
}

export interface MediaState {
  video: boolean;
  audio: boolean;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}