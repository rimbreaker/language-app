const { translate } = require("bing-translate-api");
import { Request, Response } from "express";

const translator = async (req: Request, res: Response) => {
  const phrase = decodeURI(req.params.phrase);
  const fromLang = req.query.from === "DK" ? "da" : req.query.from;
  const toLang = req.query.to ?? "en";
  const lang = fromLang ? fromLang.toString().toLowerCase() : undefined;
  const translation = await translate(phrase, lang, toLang, true);

  res.json(translation);
};

export default translator;
