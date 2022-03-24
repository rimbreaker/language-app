import pLimit from "p-limit";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { searchSong } from "../interfaces/spotify";
import SpotifyWebApi from "spotify-web-api-node";
const { Words, Playlists, db } = require("../interfaces/firebase");
import { getDoc, doc, getDocs, where, query, setDoc } from "firebase/firestore";
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

  const playlistsOfTheCourse = (
    await getDocs(
      query(
        Playlists,
        where("userMail", "==", email),
        where("language", "==", language)
      )
    )
  ).docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

  const usedSongs = playlistsOfTheCourse
    .map((playlist) => playlist.songs)
    .flat();

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
            const title = track.name;
            const artist = track.artists.reduce((prev: any, curr: any) => {
              return prev + " " + curr.name;
            }, "");

            const songWasInUse = () =>
              usedSongs
                .map((song) => ({ title: song.title, artist: song.artist }))
                .includes({ title, artist });

            const songNotSpeachyEnough = track.speechiness < 0.01;

            if (songWasInUse() || songNotSpeachyEnough) {
              console.log("song wrong!! fetching another one");
            }

            return {
              title: String(title),
              artist: String(artist),
              albumUrl: String(
                track.album.images.reduce((smallest: any, image: any) => {
                  if (image?.height < smallest?.height) return image;
                  return smallest;
                }, track.album.images[0]).url
              ),
              uri: String(track.uri),
              speechiness: textFeatures.body.speechiness,
              wordSearched: word,
              youtubeId: await getYoutubeId(artist, title),
              language: language,
              genre: String(genre),
            };
          })
      )
    );
    const playlistIndex = playlistsOfTheCourse.length + 1;

    const youtubeLink =
      foundSongs.reduce(
        (prev, curr) => prev + curr.youtubeId + ",",
        "https://www.youtube.com/watch_videos?video_ids="
      ) + `&title=${language}${playlistIndex}`;

    const playlistId = email + language + playlistIndex;

    const userMail = email?.toString() || "";

    const activeCourse = playlistId.slice(0, -playlistIndex.toString().length);

    setDoc(doc(db, "playlists", playlistId), {
      activeCourse,
      songs: foundSongs,
      completionPercentage: 0,
      language: language,
      spotifyLink: "",
      userMail,
      youtubeLink: youtubeLink,
    });

    res.json({
      id: email + language + playlistIndex,
      activeCourse: email + language,
      songs: foundSongs,
      completionPercentage: 0,
      language: language,
      spotifyLink: "",
      userMail: email,
      youtubeLink: youtubeLink,
    });

    // res.json(foundSongs);
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
