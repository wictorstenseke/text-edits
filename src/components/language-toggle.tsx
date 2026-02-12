import { Languages } from "lucide-react";
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          aria-label={t("header.toggleLanguage")}
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t("header.toggleLanguage")}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {t("header.toggleLanguage")} ({i18n.language === "en" ? "SV" : "EN"})
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
