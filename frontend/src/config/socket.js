// Role: manage socket connections and communication for a front-end application

// import socket from "socket.io-client";

// let socketInstance = null;

// export const initializeSocket = (projectId) => {
//   socketInstance = socket(import.meta.env.VITE_API_URL, {
//     auth: {
//       token: localStorage.getItem("token"),
//     },
//     query: {
//       projectId,
//     },
//   });

//   return socketInstance;
// };

// export const receiveMessage = (eventName, cb) => {
//   socketInstance.on(eventName, cb);
// };

// export const sendMessage = (eventName, data) => {
//   socketInstance.emit(eventName, data);
// };


// src/config/socket.js
import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (socketInstance) return socketInstance;

  socketInstance = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: { projectId },
    // optional but often helps with proxies & performance:
    transports: ["websocket"],
    upgrade: false,
    withCredentials: true,
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  if (!socketInstance) {
    throw new Error("Socket not initialized, call initializeSocket() first");
  }
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    throw new Error("Socket not initialized, call initializeSocket() first");
  }
  socketInstance.emit(eventName, data);
};
