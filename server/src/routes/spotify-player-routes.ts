import axios from "axios";
import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import accessEnv from "../util/accessEnv";
const lyricsFinder = require("lyrics-finder");

const router = express.Router();

const REDIRECT_URI = accessEnv("REDIRECT_URI");
const CLIENT_ID = accessEnv("CLIENT_ID");
const CLIENT_SECRET = accessEnv("CLIENT_SECRET");

router.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: REDIRECT_URI,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then((data: any) => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      });
    })
    .catch((err: any) => {
      console.log(err);
      res.sendStatus(400);
    });
});

router.post("/login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: REDIRECT_URI,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data: any) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch(() => {
      res.sendStatus(400);
    });
});

router.get("/lyrics", async (req, res) => {
  const lyrics =
    (await lyricsFinder(
      decodeURI(req.query.artist as string),
      decodeURI(req.query.track as string)
    )) || "No Lyrics Found";
  res.json({ lyrics });
});

router.get("/youtube", async (req, res) => {
  const artist = req.query.artist;
  const track = req.query.track;
  const reultsPage = (
    await axios.get(
      `https://www.youtube.com/results?search_query=${track}+${artist}`
    )
  ).data.toString();
  const firstResultIDBatch: string = reultsPage.split("/watch?v=")[1];
  const firstResultID = firstResultIDBatch.slice(
    0,
    firstResultIDBatch.indexOf('"')
  );

  res.json({ firstResultID });
});

export default router;
