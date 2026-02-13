import {
  FileText,
  Minus,
  Plus,
  RotateCcw,
  ArrowUpFromLine,
  Tag as TagIcon,
  Type,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type FontFamily = "sans" | "serif" | "mono";

interface FontFamilyOption {
  value: FontFamily;
  label: string;
}

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  pageWidthIndex: number;
  pageWidthOptionCount: number;
  onDecreasePageWidth: () => void;
  onIncreasePageWidth: () => void;
  fontFamily: FontFamily;
  fontFamilyOptions: ReadonlyArray<FontFamilyOption>;
  onFontFamilyChange: (value: string) => void;
  onResetDocument: () => void;
  onExportPDF: () => void;
  isTagPanelOpen: boolean;
  onToggleTagPanel: () => void;
}

export const EditorHeader = ({
  title,
  onTitleChange,
  pageWidthIndex,
  pageWidthOptionCount,
  onDecreasePageWidth,
  onIncreasePageWidth,
  fontFamily,
  fontFamilyOptions,
  onFontFamilyChange,
  onResetDocument,
  onExportPDF,
  isTagPanelOpen,
  onToggleTagPanel,
}: EditorHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="border-b p-4 bg-background">
      <TooltipProvider>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6" />
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-base font-semibold border-0 px-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("header.documentWidth")}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onDecreasePageWidth}
                    variant="outline"
                    size="icon"
                    aria-label="Decrease document width"
                    disabled={pageWidthIndex <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Decrease width</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onIncreasePageWidth}
                    variant="outline"
                    size="icon"
                    aria-label="Increase document width"
                    disabled={pageWidthIndex >= pageWidthOptionCount - 1}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Increase width</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="mx-2 h-8" />
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={t("header.changeFontStyle")}
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t("header.changeFontStyle")}</TooltipContent>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Font Style</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={fontFamily}
                    onValueChange={onFontFamilyChange}
                  >
                    {fontFamilyOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
            <Separator orientation="vertical" className="mx-2 h-8" />
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onResetDocument}
                    variant="outline"
                    size="icon"
                    aria-label={t("header.resetDocument")}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("header.resetDocument")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onExportPDF}
                    variant="outline"
                    size="icon"
                    aria-label={t("header.exportPDF")}
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("header.exportPDF")}</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="mx-2 h-8" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleTagPanel}
                  variant={isTagPanelOpen ? "default" : "outline"}
                  size="icon"
                  aria-label={t("header.toggleTagPanel")}
                >
                  <TagIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("header.toggleTagPanel")}</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="mx-2 h-8" />
            <LanguageToggle />
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
