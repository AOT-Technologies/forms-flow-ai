import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nService } from "@formsflow/service";
i18nService?.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
});

const resources = (i18nService && i18nService.options.resources) || {};
export const RESOURCE_BUNDLES_DATA = Object.entries(resources)
.reduce((data, [lang, { translation }]) => {
  data[lang] = translation;
  return data;
}, {});

export default i18nService;
