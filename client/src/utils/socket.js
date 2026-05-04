import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL.replace('/api', '');

export const socket = io(URL, {
    autoConnect: false,
    withCredentials: true
});

export const connectSocket = (user) => {
    if (!socket.connected && user) {
        socket.connect();
        socket.emit('join-room', user.role);
        console.log(`Socket connected and joined room: ${user.role}`);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
