import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { TRANSLATIONS_ZH } from "./zh/translations";
import { TRANSLATIONS_EN } from "./en/translations";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng:"zh",
    fallbackLng: ['en'],
    resources: {
      en: {
        translation: TRANSLATIONS_EN
      },
      zh: {
        translation: TRANSLATIONS_ZH
      }
    }
  });

//i18n.changeLanguage("zh");

console.log("babab");
console.log(i18n)