import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { ConnectionState } from '../types';

interface IWebSocketContext {
  socket: WebSocket | null;
  state: ConnectionState;
  connect: (roomId: string, token?: string, onSignal?: (msg: any) => void) => void;
  disconnect: () => void;
  sendSignal: (data: any) => void;
}

const WebSocketContext = createContext<IWebSocketContext>({
  socket: null,
  state: 'disconnected',
  connect: () => {},
  disconnect: () => {},
  sendSignal: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [state, setState] = useState<ConnectionState>('disconnected');
  const reconnectRef = useRef(0);
  const currentParamsRef = useRef<{ roomId: string; token?: string, onSignal?: (msg: any) => void } | null>(
    null
  );

  const WS_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/^http/, 'ws')
    : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

  const connect = (roomId: string, token?: string, onSignal?: (msg: any) => void) => {
    if (socket) {
      socket.close();
      setSocket(null);
    }

    currentParamsRef.current = { roomId, token, onSignal };
    setState('connecting');

    const query = token ? `?token=${token}` : '';
    const ws = new WebSocket(`${WS_URL}/ws/meetings/${roomId}${query}`);

    ws.onopen = () => {
      setState('connected');
      reconnectRef.current = 0;
      console.log(`WebSocket connected to room ${roomId}`);
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          console.log('Signal received:', message);
          onSignal?.(message);  // ✅ invoke the callback if provided
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
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

      if (event.code === 4004 || event.code === 1000) {
        currentParamsRef.current = null;
        return;
      }

      if (reconnectRef.current < 3) {
        const timeout = Math.min(5000, 1000 * 2 ** reconnectRef.current);
        reconnectRef.current++;
        console.log(`Reconnecting in ${timeout}ms...`);
        setTimeout(() => {
          if (currentParamsRef.current) {
            connect(
              currentParamsRef.current.roomId,
              currentParamsRef.current.token,
              currentParamsRef.current.onSignal
            );
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
    currentParamsRef.current = null;
    reconnectRef.current = 0;
    if (socket) {
      socket.close(1000, 'Manual disconnect');
      setSocket(null);
    }
    setState('disconnected');
  };

  const sendSignal = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send signal');
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, state, connect, disconnect, sendSignal }}>
      {children}
    </WebSocketContext.Provider>
  );
};
