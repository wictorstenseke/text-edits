import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const LanguageToggle = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "sv" : "en";
    i18n.changeLanguage(newLang).catch((error) => {
      console.error("Failed to change language:", error);
    });
    localStorage.setItem("language", newLang);
  };

  // Get current flag and next language info
  const currentFlag = i18n.language === "en" ? "🇬🇧" : "🇸🇪";
  const nextLang = i18n.language === "en" ? "SV" : "EN";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          aria-label={t("header.toggleLanguage")}
        >
          <span
            className="text-2xl"
            role="img"
            aria-label={`Current language: ${i18n.language === "en" ? "English" : "Swedish"}`}
          >
            {currentFlag}
          </span>
          <span className="sr-only">{t("header.toggleLanguage")}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {t("header.toggleLanguage")} ({nextLang})
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
