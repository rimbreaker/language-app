import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .createInstance({
    fallbackLng: "en",
    debug: window.location.href.includes("localhost"),
    detection: {
      order: ["queryString", "cookie"],
      caches: ["c"],
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init();

export default i18n;
