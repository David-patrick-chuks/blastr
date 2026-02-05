import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(room?: string) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            console.log('BLASTR Stream Established:', socket.id);
            if (room) {
                socket.emit('join', room);
            }
        });

        socket.on('disconnect', () => {
            setConnected(false);
            console.log('BLASTR Stream Severed');
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [room]);

    const on = useCallback((event: string, callback: (data: any) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
            return () => { socketRef.current?.off(event, callback); };
        }
    }, []);

    const emit = useCallback((event: string, data: any) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    }, []);

    return { connected, on, emit, socket: socketRef.current };
}
