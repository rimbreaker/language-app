import pLimit from "p-limit";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { searchSong } from "../interfaces/spotify";
import SpotifyWebApi from "spotify-web-api-node";
const { Words, Playlists, db } = require("../interfaces/firebase");
import {
  getDoc,
  doc,
  getDocs,
  where,
  query,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import accessEnv from "../util/accessEnv";
import axios from "axios";
import { getFromCache } from "../util/setupRedis";
const lyricsFinder = require("lyrics-finder");
const { translate } = require("bing-translate-api");

const CLIENT_ID = accessEnv("CLIENT_ID");
const CLIENT_SECRET = accessEnv("CLIENT_SECRET");

const spotifyLimit = pLimit(1);

type song = {
  title: string;
  artist: string;
  allArtists: string;
  albumUrl: string;
  uri: string;
  speechiness: number;
  wordsSearched: string[];
  youtubeId: string;
  language: string;
  genre: string;
  lyrics: string;
};

const return30songs = async (req: Request, res: Response) => {
  const countryCode = req.params.countryCode;
  const genre = req.query.genre;

  const wordLisrtDirectory = path.resolve(process.cwd(), "./src/wordLists");

  const limit = pLimit(15);

  const wordsList: string[] = JSON.parse(
    fs
      .readFileSync(path.join(wordLisrtDirectory, `${countryCode}1000.json`))
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
  console.log("starting a playlist");

  res.send("OK");

  const scrapperDirectory = path.resolve(
    process.cwd(),
    "../word-list-scrapper"
  );

  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const wordObject = (await getDoc(doc(Words, `${email}${language}`))).data();

  const learnedWordsArray = Object.keys(wordObject || {});

  const wordsList: string[] = JSON.parse(
    fs
      .readFileSync(path.join(scrapperDirectory, `${language}1000.json`))
      .toString()
  );

  const playlistLength = parseInt(length?.toString() ?? "10");

  const wordsToUse = wordsList
    .reverse()
    .filter((wrd) => !learnedWordsArray.includes(wrd))
    .slice(0, playlistLength);

  const fallbackWords = wordsList
    .reverse()
    .filter((wrd) => !learnedWordsArray.includes(wrd))
    .filter((wrd) => !wordsToUse.includes(wrd))
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
    .flat()
    .map((song) => ({ title: song.title, artist: song.artist }));

  spotifyApi.clientCredentialsGrant().then(async (data) => {
    spotifyApi.setAccessToken(data.body.access_token);

    const foundSongs = await Promise.all(
      wordsToUse.map((word) =>
        getSong(
          spotifyApi,
          word,
          language,
          usedSongs,
          fallbackWords,
          genre && String(genre)
        )
      )
    );
    const playlistIndex = playlistsOfTheCourse.length + 1;
    const youtubeLink =
      foundSongs.reduce(
        (prev, curr: any) => prev + curr.youtubeId + ",",
        "https://www.youtube.com/watch_videos?video_ids="
      ) + `&title=${language}${playlistIndex}`;

    const playlistId =
      encodeURI(email?.toString() ?? "") +
      "[" +
      encodeURI(language) +
      "[" +
      encodeURI(playlistIndex.toString());

    const userMail = email?.toString() || "";

    const activeCourse = email + language;

    setDoc(doc(db, "playlists", playlistId), {
      activeCourse,
      index: playlistIndex,
      songs: foundSongs.map((song) => ({
        title: song.title,
        artist: song.artist,
        albumUrl: song.albumUrl,
        youtubeId: song.youtubeId,
      })),
      completionPercentage: 0,
      language: language,
      userMail,
      youtubeLink: youtubeLink,
    });

    console.log("playlist ready");
    //gun js playlist ready
  });
};

const getSong = async (
  spotifyApi: SpotifyWebApi,
  word: string,
  language: string,
  usedSongs: any[],
  fallbackWords: string[],
  genre?: string,
  limit?: number
): Promise<song> => {
  return await getFromCache(
    `search_tracks_${word}_${language}_${limit}_${genre}`,
    async () =>
      await spotifyLimit(() =>
        spotifyApi.searchTracks(genre ? `${word} genre:${genre}` : `${word}`, {
          market: language,
          limit: limit ?? 1,
        })
      )
  ).then(async (res) => {
    if ((res as any).body.tracks.items.length > 0) {
      const track = (res as any).body.tracks.items[0];
      const nextTracks = (res as any).body.tracks.items.slice(1);

      return await handleSong(
        track,
        usedSongs,
        spotifyApi,
        word,
        language,
        fallbackWords,
        limit,
        nextTracks,
        genre
      );
    }

    return await getSong(
      spotifyApi,
      fallbackWords[0],
      language,
      usedSongs,
      fallbackWords.slice(1)
    );
  });
};

const handleSong = async (
  track: any,
  usedSongs: any[],
  spotifyApi: SpotifyWebApi,
  word: string,
  language: string,
  fallbackWords: string[],
  limit?: number,
  nextTracks?: any,
  genre?: string
): Promise<song> => {
  const title = track?.name || "string";
  const artist = track?.artists?.[0]?.name ?? "string";
  const allArtists =
    track?.artists?.reduce((prev: any, curr: any) => {
      return prev + " " + curr.name;
    }, "") ?? "string";

  const songWasInUse = () => {
    return usedSongs.includes({ title, artist });
  };

  const fallback = async () => {
    if (nextTracks && nextTracks.length > 0)
      return await handleSong(
        nextTracks[0],
        usedSongs,
        spotifyApi,
        word,
        language,
        fallbackWords,
        limit,
        nextTracks.slice(1)
      );
    return new Promise<song>((res) => {
      setTimeout(
        async () =>
          res(
            await getSong(
              spotifyApi,
              word,
              language,
              usedSongs,
              fallbackWords,
              undefined,
              (limit ?? 0) + 10
            )
          ),
        1000
      );
    });
    //return await getSong(
    //  spotifyApi,
    //  word,
    //  language,
    //  usedSongs,
    //  undefined,
    //  (limit ?? 0) + 10
    //);
  };

  if (songWasInUse()) {
    console.log("song already used!! fetching another one");
    return await fallback();
  }

  const textFeatures = await getFromCache(
    "track_af_" + track.id,
    async () => await spotifyApi.getAudioFeaturesForTrack(track.id ?? "")
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
  const youtubeId = await getYoutubeId(artist, title);

  setDoc(doc(db, "songs", youtubeId), {
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
    wordsSearched: [word],
    youtubeId: youtubeId,
    language: language,
    genre: String(genre),
    lyrics,
  });

  usedSongs.push({ title, artist });
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
    wordsSearched: [word],
    youtubeId: youtubeId,
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
  const lyrics = await getFromCache(
    artist + title,
    async () => await lyricsFinder(artist, title)
  );
  return lyrics;
};

const checkSongsLanguage = async (lyrics: string, expectedLanguage: string) => {
  const sampleToTranslate = decodeURI(lyrics).slice(0, 100);
  const translation = await getFromCache(
    sampleToTranslate,
    async () => await translate(sampleToTranslate, null, "en", false)
  );
  const actualLanguage = translation.language.from;

  if (expectedLanguage.toLowerCase() === "dk")
    return actualLanguage.toLowerCase() === "da";
  return actualLanguage.toLowerCase() === expectedLanguage.toLowerCase();
};

const completeSong = async (req: Request, res: Response) => {
  const { songName, lyrics, courseId } = req.body;
  const wordLisrtDirectory = path.resolve(process.cwd(), "./src/wordLists");

  const wordsToLearnList: string[] = JSON.parse(
    fs
      .readFileSync(
        path.join(wordLisrtDirectory, `${courseId.slice(-2)}1000.json`)
      )
      .toString()
  );

  const wordObject = (await getDoc(doc(Words, courseId))).data();
  const wordArray = wordObject ? Object.keys(wordObject) : [];
  const unknownWords = lyrics.filter(
    (wrd: string) => !wordArray.includes(wrd.toLowerCase())
  );
  const newlyLearnedWords = unknownWords.filter((wrd: string) =>
    wordsToLearnList.includes(wrd.toLowerCase())
  );

  await setDoc(doc(Words, courseId), {
    ...wordObject,
    ...newlyLearnedWords.reduce(
      (prev: Record<string, boolean>, curr: string) => {
        return { ...prev, [curr]: true };
      },
      {}
    ),
  });
  await updateDoc(doc(db, "activeCourses", courseId), {
    wordsLearned: increment(newlyLearnedWords.length),
  });
  res.send("OK");
};

export { return30songs, getSongsFromNextWordsToLearn, completeSong };
