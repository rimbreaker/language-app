import { writeFileSync, readFileSync } from "fs";
import xlsx from "xlsx";
import axios from "axios";
const HOMEPAGE_URL = "https://www.101languages.net";

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

      console.log(link2.split("/")[5]);
      const languageName = link2.split("/")[5].split(".")[0];

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
    console.log("failed: " + link);
  }
};

(async () => {
  console.log("start");
  await scrape();
  console.log("finish");
})();
