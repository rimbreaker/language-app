import axios from "axios";
import { standardAccessCache } from "./cache";

const SERVER_TOKEN = "";

const searchSong = async (
  countryCode: string,
  searchWord: string,
  genre?: string
) => {
  const songsData = standardAccessCache(
    countryCode + searchWord + genre,
    async () =>
      (
        await axios({
          method: "GET",
          url: `https://api.spotify.com/v1/search?q=${encodeURI(searchWord)}${
            genre && "%20genre:" + genre
          }&type=track&market=${countryCode}${genre && "&limit=5"}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVER_TOKEN}`,
          },
        })
      ).data
  );

  return songsData;
};

export { searchSong };
