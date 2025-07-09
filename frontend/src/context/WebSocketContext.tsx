import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ConnectionState } from '../types';

interface IWebSocketContext {
  socket: WebSocket | null;
  state: ConnectionState;
  connect: (roomId: string, token?: string) => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<IWebSocketContext>({
  socket: null,
  state: 'disconnected',
  connect: () => {},
  disconnect: () => {},
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

  const connect = (roomId: string, token?: string) => {
    currentParamsRef.current = { roomId, token };
    setState('connecting');

    const query = token ? '?token=' + token : '';
    const ws = new WebSocket('wss://localhost:8000/ws/meetings/' + roomId + query);

    ws.onopen = () => {
      setState('connected');
      reconnectRef.current = 0;
    };

    ws.onmessage = (event) => {
      // TODO: handle incoming messages
    };

    ws.onerror = () => {
      console.error('WebSocket error');
      setState('error');
      ws.close();
    };

    ws.onclose = () => {
      setState('disconnected');
      // auto-reconnect with exponential backoff
      const timeout = Math.min(10000, 1000 * 2 ** reconnectRef.current);
      reconnectRef.current++;
      setTimeout(() => {
        if (currentParamsRef.current) {
          connect(currentParamsRef.current.roomId, currentParamsRef.current.token);
        }
      }, timeout);
    };

    setSocket(ws);
  };

  const disconnect = () => {
    socket?.close();
    setSocket(null);
    setState('disconnected');
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, state, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 