import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { TRANSLATIONS_ZH } from "./zh/translations";
import { TRANSLATIONS_EN } from "./en/translations";
import { TRANSLATIONS_FR } from "./fr/translations";
import { TRANSLATIONS_PT } from "./pt/translations";
import { TRANSLATIONS_BG } from "./bg/translations";
import { TRANSLATIONS_DE } from "./de/translations";
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      fallbackLng: 'en',
      "en": {
        translation: TRANSLATIONS_EN
      },
      "zh-CN": {
        translation: TRANSLATIONS_ZH
      },
      "pt": {
        translation: TRANSLATIONS_PT
      },
      "fr": {
        translation: TRANSLATIONS_FR
      },
      "bg":
      {
        translation: TRANSLATIONS_BG
      },
      "de":
      {
        translation: TRANSLATIONS_DE
      }

    }
  });
  

//i18n.changeLanguage('zh'); // default language 'en'
  i18n.fallbacks = true;
  export default i18n;
  
