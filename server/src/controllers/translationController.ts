const { translate } = require("bing-translate-api");
import { Request, Response } from "express";
import loactionToLangsMap from "../loactionToLAngs";

const translator = async (req: Request, res: Response) => {
  const phrase = decodeURI(req.params.phrase);
  const fromLang =
    loactionToLangsMap[(req.query.from as string).toLocaleUpperCase()][0];
  const toLang =
    loactionToLangsMap[(req.query.to as string).toUpperCase()][0] ?? "en";
  const lang = fromLang ?? undefined;
  const translation = await translate(phrase, lang, toLang, true);

  res.json(translation);
};

export default translator;
