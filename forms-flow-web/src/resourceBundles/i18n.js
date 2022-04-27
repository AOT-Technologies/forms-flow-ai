import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { RESOURCE_BUNDLES_ZH } from "./zh/resourceBundles";
import { RESOURCE_BUNDLES_EN } from "./en/resourceBundles";
import { RESOURCE_BUNDLES_FR } from "./fr/resourceBundles";
import { RESOURCE_BUNDLES_PT } from "./pt/resourceBundles";
import { RESOURCE_BUNDLES_BG } from "./bg/resourceBundles";
import { RESOURCE_BUNDLES_DE } from "./de/resourceBundles";
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    
    fallbackLng: 'en',
    resources: {
      fallbackLng: 'en',
      "en": {
        translation: RESOURCE_BUNDLES_EN
      },
      "zh-CN": {
        translation: RESOURCE_BUNDLES_ZH
      },
      "pt": {
        translation: RESOURCE_BUNDLES_PT
      },
      "fr": {
        translation: RESOURCE_BUNDLES_FR
      },
      "bg":
      {
        translation: RESOURCE_BUNDLES_BG
      },
      "de":
      {
        translation: RESOURCE_BUNDLES_DE
      }

    }
  });
  

  export default i18n;
  
