import { Request, Response } from "express";
import fs from "fs";
import path from "path";
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

import loactionToLangsMap from "../util/loactionToLangs";
import spotifyMarkets from "../util/spotifyMarkets";
import {
  sendPlaylistStatus,
  sendPlaylistReady,
} from "../util/setupSocketServer";

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
  wordsSearched: string[];
  youtubeId: string;
  language: string;
  genre: string;
  lyrics: string;
};

const getYoutubeId = async (artist: string, track: string) => {
  const reultsPage = (
    await axios.get(
      `https://www.youtube.com/results?search_query=${encodeURI(
        track
      )}+${encodeURI(artist)}`
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

const checkSongsLanguage = async (lyrics: string, langLocation: string) => {
  const sampleToTranslate = lyrics.slice(0, 100);
  const translation = await getFromCache(
    sampleToTranslate.slice(0, 20),
    async () => await translate(sampleToTranslate, null, "en", false)
  );
  const actualLanguage = translation.language.from;
  loactionToLangsMap[langLocation].includes(actualLanguage);
  return loactionToLangsMap[langLocation].includes(actualLanguage);
};

const completeSong = async (req: Request, res: Response) => {
  const { lyrics, courseId } = req.body;
  const wordLisrtDirectory = path.resolve(process.cwd(), "./src/wordLists");

  const wordsToLearnList: string[] = JSON.parse(
    fs
      .readFileSync(
        path.join(wordLisrtDirectory, `${courseId.slice(-2)}1000000.json`)
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

export { completeSong, getSongsFromNextWordsToLearn2 };

//TODO:
//     - check language of the song by try catch
//          - if try catch works but the language is bad, then add song to redlist
//          - otherwise just ommit
//     - cache all external apis, unless the response is bad
//     - update all song redlist?, playlists

const getSongsFromNextWordsToLearn2 = async (req: Request, res: Response) => {
  const language = req.params.lang;
  const length = req.query.length;
  const genre = req.query.genre;
  const email = req.query.email;
  const socketId: string = req.query.socketid as any;
  console.log("starting a playlist");

  res.send("OK");
  sendPlaylistStatus(socketId, 0);

  const wordLisrtDirectory = path.resolve(process.cwd(), "./src/wordLists");

  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const learnedWordsObject = (
    await getDoc(doc(Words, `${email}${language}`))
  ).data();

  const learnedWordsArray = Object.keys(learnedWordsObject || {});

  const redListedWordsObject = (
    await getDoc(doc(db, "redListedWords", `${language}`))
  ).data();

  const redListedWordsArray = Object.keys(redListedWordsObject || {});

  const listOfAllwords: string[] = JSON.parse(
    fs
      .readFileSync(path.join(wordLisrtDirectory, `${language}1000000.json`)) //TODO: change to the unfiltered one
      .toString()
  );

  const playlistLength = parseInt(length?.toString() ?? "10");

  const wordsToUse: string[] = [];

  let allWordsListIndex = 0;

  while (wordsToUse.length < playlistLength) {
    const wordToCheck = listOfAllwords[allWordsListIndex];
    allWordsListIndex++;
    if (redListedWordsArray.includes(wordToCheck)) continue;
    if (learnedWordsArray.includes(wordToCheck)) continue;
    const wordTranslationResult = await getFromCache(
      `lang${language}word${wordToCheck}`,
      async () =>
        await translate(
          decodeURI(wordToCheck),

          loactionToLangsMap[language][0],
          "en",
          false
        )
    ); //TODO: add try catch
    if (
      !loactionToLangsMap[language].includes(
        wordTranslationResult.language.from
      )
    ) {
      redListedWordsArray.push(decodeURI(wordToCheck));
      continue;
    }
    wordsToUse.push(decodeURI(wordToCheck));
  }

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

    const spotifyResults = await Promise.all(
      wordsToUse.map((word) => {
        return spotifyApi.searchTracks(
          genre ? `${word} genre:${genre}` : `${word}`,
          {
            market: spotifyMarkets.includes(language) ? language : undefined,
            limit: 10,
          }
        );
      })
    );

    const tracks = spotifyResults
      .map((spoRes, index) => {
        const tracksArr = spoRes.body.tracks?.items ?? [];
        if ((tracksArr.length ?? 0) < 1 && genre === undefined)
          redListedWordsArray.push(wordsToUse[index]);
        return tracksArr;
      })
      .flat()
      .reduce(
        (
          prev: SpotifyApi.TrackObjectFull[],
          curr: SpotifyApi.TrackObjectFull
        ) => {
          const previousTracksIds = prev.map(
            (track) => track.artists[0].name + track.name
          );

          if (previousTracksIds.includes(curr.artists[0].name + curr.name)) {
            return prev;
          }

          return [...prev, curr];
        },
        []
      );

    const resultSongs: song[] = [];
    let tracksIndex = 0;
    console.log("getting songs");
    while (resultSongs.length < playlistLength) {
      sendPlaylistStatus(socketId, resultSongs.length / playlistLength);
      const trackToCheck = tracks[tracksIndex];

      tracksIndex++;

      const title = trackToCheck.name;
      const artist = trackToCheck.artists[0].name;
      const allArtists =
        trackToCheck.artists.reduce((prev: any, curr: any) => {
          return prev + " " + curr.name;
        }, "") ?? "string";

      if (usedSongs.includes({ title, artist })) {
        console.log("song was already used, ommiting this one");
        continue;
      }

      const textFeatures = await getFromCache(
        "track_af_" + trackToCheck.id,
        async () => await spotifyApi.getAudioFeaturesForTrack(trackToCheck.id)
      );

      const songNotSpeachyEnough = textFeatures.body.speechiness < 0.01;

      if (songNotSpeachyEnough) {
        console.log("song not speachy enough!! checking another one");
        continue;
      }

      const lyrics = await getSongLyrics(artist, title);

      if (lyrics === "" || lyrics === '""') {
        console.log("no lyrics found!! checking another song");
        continue;
      }

      const songLanguageCorrect = await checkSongsLanguage(
        lyrics.length < 1 ? "nie" : lyrics,
        language
      );
      if (!songLanguageCorrect) {
        console.log("song in wrong language!! checking next one");
        continue;
      }

      const youtubeId = await getYoutubeId(artist, title);

      const resSong = {
        title: String(title),
        artist: String(artist),
        allArtists: String(allArtists),
        albumUrl: String(
          trackToCheck.album.images.reduce((smallest: any, image: any) => {
            if (image?.height < smallest?.height) return image;
            return smallest;
          }, trackToCheck.album.images[0]).url
        ),
        uri: String(trackToCheck.uri),
        speechiness: textFeatures.body.speechiness,
        wordsSearched: ["word"], //TODO: figure out what to do with it
        youtubeId: youtubeId,
        language: language,
        genre: String(genre),
        lyrics,
      };

      setDoc(doc(db, "songs", youtubeId), resSong);

      resultSongs.push(resSong);
    }

    const playlistIndex = playlistsOfTheCourse.length + 1;
    const youtubeLink =
      resultSongs.reduce(
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
      songs: resultSongs.map((song) => ({
        title: song.title,
        artist: song.artist,
        albumUrl: song.albumUrl,
        youtubeId: song.youtubeId,
        uri: String(song.uri),
      })),
      completionPercentage: 0,
      language: language,
      userMail,
      youtubeLink: youtubeLink,
    });

    setDoc(
      doc(db, "redListedWords", language),
      redListedWordsArray.reduce((prev, curr) => {
        return { ...prev, [curr]: true };
      }, {})
    );
    console.log("playlist ready");
    sendPlaylistReady(socketId);
  });
};
