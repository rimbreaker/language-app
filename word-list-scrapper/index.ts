import { writeFileSync, readFileSync, appendFileSync, fstat } from "fs";
import xlsx from "xlsx";
import axios from "axios";
const HOMEPAGE_URL = "https://www.101languages.net";
const { translate } = require("bing-translate-api");
//import PL from "./PL.json";
//import AE from "./AE.json";
//import BG from "./BG.json";
//import CZ from "./CZ.json";
//import DE from "./DE.json";
//import DK from "./DK.json"; //
//import EE from "./EE.json"; //
//import EN from "./EN.json";//
//import ES from "./ES.json"; //
//import FI from "./FI.json"; //
//import FR from "./FR.json"; //
//import GR from "./GR.json";
//import HR from "./HR.json";
//import HU from "./HU.json";
//import IL from "./IL.json";
//import IS from "./IS.json";
//import IT from "./IT.json";
//import LV from "./LV.json";
//import MK from "./MK.json";
//import MY from "./MY.json";
//import NL from "./NL.json"; //
//import NO from "./NO.json";
//import PT from "./PT.json";
//import RO from "./RO.json";
//import RS from "./RS.json";
//import RU from "./RU.json"; //
//import SE from "./SE.json";
//import SI from "./SI.json";
//import SK from "./SK.json";
import TR from "./TR.json";
import pLimit from "p-limit";

const scrape = async () => {
  const startHtml: string = (await axios.get(HOMEPAGE_URL)).data;

  const langUrls = startHtml
    .split('<a style="font-weight:bold;border:none" class="btn btn-default ')
    .filter((part) => part.includes('href="https://www.101languages.net/'))
    .map((part) => part.slice(part.indexOf("href=") + 6, part.indexOf('/">')));

  await Promise.all(langUrls.map((link) => openWordlistPage(link)));
};

const openWordlistPage = async (link: string) => {
  if (link.startsWith(HOMEPAGE_URL)) {
    try {
      const countryHtml: string = (await axios.get(link)).data;

      const mostCommonWordsPageLink = countryHtml
        .split("<a")
        .filter((part) => part.includes("Most Common Words"))[1];

      if (mostCommonWordsPageLink) {
        const link2 = mostCommonWordsPageLink.slice(
          mostCommonWordsPageLink.indexOf("href=") + 6,
          mostCommonWordsPageLink.indexOf('" title="Most Common ')
        );

        downloadSpreadSheet(link2);
      }
    } catch (e) {}
  }
};

const downloadSpreadSheet = async function (link: string): Promise<any> {
  try {
    const mostCommonWordsPageHtml: string = (await axios.get(link)).data;

    const spreadSheetUrl = mostCommonWordsPageHtml
      .split("<a")
      .find((part) =>
        part.includes("https://s3.amazonaws.com/101languages/common-words/")
      );

    if (spreadSheetUrl) {
      const link2 = spreadSheetUrl.slice(
        7,
        spreadSheetUrl.indexOf('" target="_blank')
      );

      const spreadSheet = (
        await axios({
          url: link2,
          method: "GET",
          responseType: "arraybuffer",
        })
      ).data;

      const encoding = JSON.parse(readFileSync("./encoding.json").toString());

      const languageName = link2.split("/")[5].split(".")[0];

      console.log(languageName);
      if (link2.split("/")[5].split(".")[1] === "xlsx") {
        const workbook = xlsx.read(spreadSheet);
        const workSheet = workbook.Sheets[workbook.SheetNames[0]];

        const columnA = [];

        for (let z in workSheet) {
          if (z.toString()[0] === "A") {
            columnA.push(workSheet[z].v);
          }
        }

        writeFileSync(
          `${encoding[languageName]}.json`,
          JSON.stringify(columnA)
        );
      }
      if (link2.split("/")[5].split(".")[1] === "txt") {
        const workFile: string = spreadSheet.toString();

        writeFileSync(
          `${encoding[languageName]}.json`,
          JSON.stringify(
            workFile
              .split("\n")
              .slice(15)
              .map((word) => word.replace("\r", ""))
          )
        );
      }
      writeFileSync(link2.split("/")[5], spreadSheet);
    }
  } catch (e) {
    console.warn("failed: " + link);
  }
};

const scrapeEng = async () => {
  const html: string = (
    await axios.get(
      "https://www.vocabularyfirst.com/1000-most-common-english-words/"
    )
  ).data;

  const table = html.split("/tr")[1];

  writeFileSync(
    "US.json",
    JSON.stringify(table.slice(27, -6).split("<br /> "))
  );
};

const testAsyncFunction = () => {
  const arr = ["nie", "to", "się", "w", "na", "i", "z", "co", "jest", "że"];

  console.time("with promise");
  //Promise.all(arr.map(async (n) => console.log((PL as string[]).includes(n))));
  console.timeEnd("with promise");

  //console.time("without promise");
  //
  //arr.forEach((n) => console.log((PL as string[]).includes(n)));
  //console.timeEnd("without promise");
};

const getRepeatingWords = () => {
  console.time("fun");
  console.debug("starting the fun");

  const words = TR as string[];

  console.log(words.length);
  const wordsToSave = words.length > 100000 ? words.slice(0, 100000) : words;

  writeFileSync("TR1000000.json", JSON.stringify(wordsToSave));

  console.timeEnd("fun");
};

const replace1000jsons = () => {
  ["BG", "DE", "DK", "ES", "PL"].forEach((country) => {
    const txt = readFileSync(`./${country}1000.txt`).toString();
    writeFileSync(
      `${country}1000.json`,
      JSON.stringify(txt.split("\n").slice(0, -1))
    );
  });
};

(async () => {
  getRepeatingWords();
})();
