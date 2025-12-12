import io from 'socket.io-client';

let socket: any = null;
let notificationCallback: ((notification: any) => void) | null = null;

export const initializeSocket = (token: string) => {
  if (socket && socket.connected) return socket;

  socket = io('http://localhost:3000', {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Socket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket desconectado');
  });

  socket.on('notification', (notification: any) => {
    console.log('📬 Nueva notificación:', notification);
    // Llamar al callback registrado
    if (notificationCallback) {
      notificationCallback(notification);
    }
    handleNotification(notification);
  });

  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Registrar un callback para cuando llegan notificaciones
export const onNotificationReceived = (callback: (notification: any) => void) => {
  notificationCallback = callback;
};

// Función para manejar notificaciones recibidas
const handleNotification = (notification: any) => {
  // Mostrar en consola
  console.log('Notificación:', notification.title, notification.body);
  // Aquí se puede agregar sonido, badge, etc. en el futuro
};
