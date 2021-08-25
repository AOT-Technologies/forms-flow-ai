import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { LANGUAGE } from "../constants/constants";
import { TRANSLATIONS_ZH } from "./zh/translations";
import { TRANSLATIONS_EN } from "./en/translations";
const lang = LANGUAGE;
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: TRANSLATIONS_EN
      },
      zh: {
        translation: TRANSLATIONS_ZH
      }
    }
  });

i18n.changeLanguage('en');