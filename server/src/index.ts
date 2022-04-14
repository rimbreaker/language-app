require("dotenv").config();
import express from "express";
import cors from "cors";
import accessEnv from "./util/accessEnv";
import setupSwagger from "./util/setupSwagger";
import spotifySongsRouter from "./routes/spotify-songs";
import spotifyPlayerRouter from "./routes/spotify-player-routes";
import translateRouter from "./routes/translationRoutes";
import { connectRedis } from "./util/setupRedis";
import { Server } from "socket.io";
import { createServer } from "http";
import { setupSocketServer } from "./util/setupSocketServer";

const CLIENT_URI = accessEnv("CLIENT_URI", "http://localhost:3000");

const main = () => {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const PORT = accessEnv("PORT", 4000);

  app.use(spotifySongsRouter);

  app.use(spotifyPlayerRouter);

  app.use(translateRouter);

  io.on("connect", (socket) => {
    io.to(socket.id).emit("id", socket.id);
  });

  connectRedis();
  setupSwagger(app);
  setupSocketServer(io);

  httpServer.listen(PORT, () => {
    console.debug(`server is running on http://localhost:${PORT} `);
  });
};

try {
  main();
} catch (e) {
  console.error(e);
}
