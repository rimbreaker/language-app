import { Server } from "socket.io";

let io: Server;

const setupSocketServer = (socketIo: Server) => {
  io = socketIo;
};

const sendPlaylistStatus = (socketId: string, status: number) =>
  io.to(socketId).emit("playlist-status", status);

const sendPlaylistReady = (socketId: string) =>
  io.to(socketId).emit("playlist-ready");

export { setupSocketServer, sendPlaylistStatus, sendPlaylistReady };
