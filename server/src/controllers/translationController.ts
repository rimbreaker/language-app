const { translate } = require("bing-translate-api");
import { Request, Response } from "express";

const translator = async (req: Request, res: Response) => {
  const phrase = decodeURI(req.params.phrase);
  const fromLang = req.query.from;
  const toLang = req.query.to ?? "en";
  const translation = await translate(phrase, fromLang, toLang, true);

  res.json(translation);
};

export default translator;
