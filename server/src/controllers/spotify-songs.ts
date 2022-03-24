import pLimit from "p-limit";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { searchSong } from "../interfaces/spotify";
import SpotifyWebApi from "spotify-web-api-node";
const { Words } = require("../interfaces/firebase");
import { getDoc, doc } from "firebase/firestore";
import accessEnv from "../util/accessEnv";
import axios from "axios";

const CLIENT_ID = accessEnv("CLIENT_ID");
const CLIENT_SECRET = accessEnv("CLIENT_SECRET");

const return30songs = async (req: Request, res: Response) => {
  const countryCode = req.params.countryCode;
  const genre = req.query.genre;

  const scrapperDirectory = path.resolve(
    process.cwd(),
    "../word-list-scrapper"
  );

  const limit = pLimit(15);

  const wordsList: string[] = JSON.parse(
    fs
      .readFileSync(path.join(scrapperDirectory, `${countryCode}.json`))
      .toString()
  );
  const top30Words = wordsList.slice(0, 30);

  const songsData = await Promise.all(
    top30Words.map((word) =>
      limit(() => searchSong(countryCode, word, genre as any))
    )
  );

  res.json(songsData);
};

const getSongsFromNextWordsToLearn = async (req: Request, res: Response) => {
  const language = req.params.lang;
  const length = req.query.length;
  const genre = req.query.genre;
  const email = req.query.email;

  const scrapperDirectory = path.resolve(
    process.cwd(),
    "../word-list-scrapper"
  );

  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const wordObject = (await getDoc(doc(Words, `${email}${language}`))).data(); // await Words.get(`${email}${language}`).data();

  const learnedSoFar = Object.values(wordObject || {}).length;

  const learnedWordsArray = Object.values(wordObject || {});

  const wordsList: string[] = JSON.parse(
    fs.readFileSync(path.join(scrapperDirectory, `${language}.json`)).toString()
  );

  const playlistLength = parseInt(length?.toString() || "10");

  const wordsToUse = wordsList
    .slice(0, learnedSoFar + playlistLength)
    .filter((word: string) => !learnedWordsArray.includes(word))
    .slice(0, playlistLength);

  spotifyApi.clientCredentialsGrant().then(async (data) => {
    spotifyApi.setAccessToken(data.body.access_token);

    const foundSongs = await Promise.all(
      wordsToUse.map((word) =>
        spotifyApi
          .searchTracks(genre ? `${word} genre:${genre}` : `${word}`, {
            market: language,
            limit: 1,
          })
          .then(async (res) => {
            const textFeatures = await spotifyApi.getAudioFeaturesForTrack(
              (res as any).body.tracks.items[0].id ?? ""
            );
            const track = (res as any).body.tracks.items[0];
            const artist = track.artists.reduce((prev: any, curr: any) => {
              return prev + " " + curr.name;
            }, "");
            return {
              title: track.name,
              artist: artist,
              albumUrl: track.album.images.reduce(
                (smallest: any, image: any) => {
                  if (image?.height < smallest?.height) return image;
                  return smallest;
                },
                track.album.images[0]
              ).url,
              uri: track.uri,
              speechiness: textFeatures.body.speechiness,
              wordSearched: word,
              youtubeId: await getYoutubeId(artist, track.name),
              language: language,
              genre: genre,
            };
          })
      )
    );

    //if songs werent already used
    //if have proper language in title
    //if have wordiness index enough
    //save new playlist
    //save each song
    //save each PSC

    res.json(foundSongs);
  });
};

const getYoutubeId = async (artist: string, track: string) => {
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

  return firstResultID;
};

export { return30songs, getSongsFromNextWordsToLearn };
