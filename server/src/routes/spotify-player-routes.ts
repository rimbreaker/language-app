import axios from "axios";
import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import {
  completeSong,
  getSongsFromNextWordsToLearn2,
} from "../controllers/spotify-songs";
import accessEnv from "../util/accessEnv";
const lyricsFinder = require("lyrics-finder");

const router = express.Router();

const CLIENT_ID = accessEnv("CLIENT_ID");
const CLIENT_SECRET = accessEnv("CLIENT_SECRET");

router.post("/refresh", (req, res) => {
  const redirectUri = req.body.redirect;
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
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

router.get("/search", (_req, res) => {
  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  spotifyApi.clientCredentialsGrant().then(async (data) => {
    console.log(data);

    spotifyApi.setAccessToken(data.body.access_token);
    const searchResult = await spotifyApi.searchTracks("nie genre:indie", {
      market: "PL",
    });

    res.json(searchResult);
  });
});

router.post("/login", (req, res) => {
  const code = req.body.code;
  const redirectUri = req.body.redirect;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
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

router.get("/createplaylist/:lang", getSongsFromNextWordsToLearn2);

router.post("/completesong", completeSong);

export default router;
