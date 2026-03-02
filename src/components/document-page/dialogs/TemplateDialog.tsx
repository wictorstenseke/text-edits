import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Template } from "@/types/document";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onCreateFromTemplate: (template: Template) => void;
}

export const TemplateDialog = ({
  open,
  onOpenChange,
  templates,
  onCreateFromTemplate,
}: TemplateDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dialogs.addSection.templateButton")}</DialogTitle>
          <DialogDescription>
            Choose a template to start your document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onCreateFromTemplate(template)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onCreateFromTemplate(template);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Sections:{" "}
                  {template.sections.map((section) => section.title).join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
