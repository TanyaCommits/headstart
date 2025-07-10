import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { ConnectionState, AckMessage } from '../types';

interface IWebSocketContext {
  socket: WebSocket | null;
  state: ConnectionState;
  connect: (roomId: string, token?: string) => void;
  disconnect: () => void;
  sendAudioChunk: (buffer: ArrayBuffer) => void;
}

const WebSocketContext = createContext<IWebSocketContext>({
  socket: null,
  state: 'disconnected',
  connect: () => {},
  disconnect: () => {},
  sendAudioChunk: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [state, setState] = useState<ConnectionState>('disconnected');
  const reconnectRef = useRef(0);
  const currentParamsRef = useRef<{ roomId: string; token?: string } | null>(null);

  const WS_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/^http/, 'ws') : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

  const connect = (roomId: string, token?: string) => {
    // Close existing connection first
    if (socket) {
      socket.close();
      setSocket(null);
    }

    currentParamsRef.current = { roomId, token };
    setState('connecting');

    const query = token ? '?token=' + token : '';
    const ws = new WebSocket(`${WS_URL}/ws/meetings/${roomId}${query}`);

    ws.onopen = () => {
      setState('connected');
      reconnectRef.current = 0;
      console.log(`Connected to WebSocket for room: ${roomId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ack') {
          console.log(`Audio ACK: ${data.bytes} bytes at ${new Date(data.timestamp * 1000).toLocaleTimeString()}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setState('error');
      ws.close();
    };

    ws.onclose = (event) => {
      setState('disconnected');
      console.log('WebSocket closed:', event.code, event.reason);
      
      // Don't auto-reconnect if room not found (code 4004) or if connection was closed manually
      if (event.code === 4004 || event.code === 1000) {
        console.log('WebSocket closed normally - not reconnecting');
        currentParamsRef.current = null; // Clear current params to stop reconnection
        return;
      }
      
      // Only auto-reconnect for unexpected disconnections and limit attempts
      if (reconnectRef.current < 3) {
        const timeout = Math.min(5000, 1000 * 2 ** reconnectRef.current);
        reconnectRef.current++;
        console.log(`Reconnecting in ${timeout}ms... (attempt ${reconnectRef.current})`);
        setTimeout(() => {
          if (currentParamsRef.current) {
            connect(currentParamsRef.current.roomId, currentParamsRef.current.token);
          }
        }, timeout);
      } else {
        console.error('Max reconnection attempts reached');
        currentParamsRef.current = null;
      }
    };

    setSocket(ws);
  };

  const disconnect = () => {
    currentParamsRef.current = null; // Prevent reconnection
    reconnectRef.current = 0;
    if (socket) {
      socket.close(1000, 'Manual disconnect'); // 1000 = normal closure
      setSocket(null);
    }
    setState('disconnected');
  };

  const sendAudioChunk = useCallback((buffer: ArrayBuffer) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(buffer);
    } else {
      console.warn('WebSocket not connected, cannot send audio chunk');
    }
  }, [socket]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, state, connect, disconnect, sendAudioChunk }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 