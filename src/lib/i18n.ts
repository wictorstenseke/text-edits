import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "@/locales/en/translation.json";
import svTranslation from "@/locales/sv/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  sv: {
    translation: svTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((error) => {
    console.error("Failed to initialize i18n:", error);
  });

export default i18n;
