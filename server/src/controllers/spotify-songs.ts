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
const lyricsFinder = require("lyrics-finder");
const { translate } = require("bing-translate-api");

const CLIENT_ID = accessEnv("CLIENT_ID");
const CLIENT_SECRET = accessEnv("CLIENT_SECRET");

type song = {
  title: string;
  artist: string;
  allArtists: string;
  albumUrl: string;
  uri: string;
  speechiness: number;
  wordSearched: string;
  youtubeId: string;
  language: string;
  genre: string;
  lyrics: string;
};

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
        getSong(spotifyApi, word, language, usedSongs, genre && String(genre))
      )
    );
    const playlistIndex = playlistsOfTheCourse.length + 1;
    const youtubeLink =
      foundSongs.reduce(
        (prev, curr: any) => prev + curr.youtubeId + ",",
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
  });
};

const getSong = async (
  spotifyApi: SpotifyWebApi,
  word: string,
  language: string,
  usedSongs: any[],
  genre?: string,
  limit?: number
) => {
  return await spotifyApi
    .searchTracks(genre ? `${word} genre:${genre}` : `${word}`, {
      market: language,
      limit: limit ?? 1,
    })
    .then(async (res) => {
      const track = (res as any).body.tracks.items[0];
      const nextTracks = (res as any).body.tracks.items.slice(1);

      return await handleSong(
        track,
        usedSongs,
        spotifyApi,
        word,
        language,
        limit,
        nextTracks,
        genre
      );
    });
};

const handleSong = async (
  track: any,
  usedSongs: any[],
  spotifyApi: SpotifyWebApi,
  word: string,
  language: string,
  limit?: number,
  nextTracks?: any,
  genre?: string
): Promise<song> => {
  const title = track.name;
  const artist = track.artists[0].name;
  const allArtists = track.artists.reduce((prev: any, curr: any) => {
    return prev + " " + curr.name;
  }, "");

  const songWasInUse = () => {
    return usedSongs
      .map((song) => ({ title: song.title, artist: song.artist }))
      .includes({ title, artist });
  };

  const fallback = async () => {
    if (nextTracks && nextTracks.length > 0)
      return await handleSong(
        nextTracks[0],
        usedSongs,
        spotifyApi,
        word,
        language,
        limit,
        nextTracks.slice(1)
      );
    return await getSong(
      spotifyApi,
      word,
      language,
      usedSongs,
      undefined,
      (limit ?? 0) + 10
    );
  };

  if (songWasInUse()) {
    console.log("song wrong!! fetching another one");
    return await fallback();
  }

  const textFeatures = await spotifyApi.getAudioFeaturesForTrack(
    track.id ?? ""
  );

  const songNotSpeachyEnough = textFeatures.body.speechiness < 0.01;

  if (songNotSpeachyEnough) {
    console.log("song not speachy enough!! fetching another one");
    return await fallback();
  }

  const lyrics = await getSongLyrics(artist, title);

  if (lyrics === "") {
    console.log("no lyrics found!! fetching another one");
    return await fallback();
  }
  const songLanguageCorrect = await checkSongsLanguage(lyrics, language);
  if (!songLanguageCorrect) {
    console.log("song in wrong language!! fetching another one");
    return await fallback();
  }

  return {
    title: String(title),
    artist: String(artist),
    allArtists: String(allArtists),
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
    lyrics,
  };
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

const getSongLyrics = async (artist: string, title: string) => {
  const lyrics = await lyricsFinder(artist, title);
  return lyrics;
};

const checkSongsLanguage = async (lyrics: string, expectedLanguage: string) => {
  const sampleToTranslate = decodeURI(lyrics).slice(0, 100);
  const translation = await translate(sampleToTranslate, null, "en", false);
  const actualLanguage = translation.language.from;
  return actualLanguage.toLowerCase() === expectedLanguage.toLowerCase();
};

export { return30songs, getSongsFromNextWordsToLearn };
