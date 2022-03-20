import pLimit from "p-limit";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { searchSong } from "../interfaces/spotify";

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

export { return30songs };
