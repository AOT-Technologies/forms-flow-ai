import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nService } from "@formsflow/service";
i18nService?.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
});

export default i18nService;
