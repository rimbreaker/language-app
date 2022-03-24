require("dotenv").config();
import express from "express";
import cors from "cors";
import accessEnv from "./util/accessEnv";
import setupSwagger from "./util/setupSwagger";
import spotifySongsRouter from "./routes/spotify-songs";
import spotifyPlayerRouter from "./routes/spotify-player-routes";
import translateRouter from "./routes/translationRoutes";

const main = () => {
  const app = express();
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

  setupSwagger(app);

  app.listen(PORT, () => {
    console.debug(`server is running on http://localhost:${PORT} `);
  });
};

try {
  main();
} catch (e) {
  console.error(e);
}
