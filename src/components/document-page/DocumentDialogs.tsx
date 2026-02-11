import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { DeleteSectionRequest } from "@/components/document-page/ManageSectionsDialog";
import type { Template } from "@/types/document";

interface DocumentDialogsProps {
  newSectionDialogOpen: boolean;
  onNewSectionDialogOpenChange: (open: boolean) => void;
  newSectionTitle: string;
  onNewSectionTitleChange: (value: string) => void;
  onAddSection: () => void;

  templateDialogOpen: boolean;
  onTemplateDialogOpenChange: (open: boolean) => void;
  templates: Template[];
  onCreateFromTemplate: (template: Template) => void;

  resetDialogOpen: boolean;
  onResetDialogOpenChange: (open: boolean) => void;
  onResetDocument: () => void;

  pendingDeleteSection: DeleteSectionRequest | null;
  onPendingDeleteSectionChange: (section: DeleteSectionRequest | null) => void;
  onConfirmRemoveSection: (sectionId: string) => void;

  tagDialogOpen: boolean;
  onTagDialogOpenChange: (open: boolean) => void;
  editingTagKey: string | null;
  tagValue: string;
  onTagValueChange: (value: string) => void;
  onSaveTag: () => void;

  newTagDialogOpen: boolean;
  onNewTagDialogOpenChange: (open: boolean) => void;
  newTagKey: string;
  onNewTagKeyChange: (value: string) => void;
  newTagValue: string;
  onNewTagValueChange: (value: string) => void;
  onAddNewTag: () => void;
}

export const DocumentDialogs = ({
  newSectionDialogOpen,
  onNewSectionDialogOpenChange,
  newSectionTitle,
  onNewSectionTitleChange,
  onAddSection,
  templateDialogOpen,
  onTemplateDialogOpenChange,
  templates,
  onCreateFromTemplate,
  resetDialogOpen,
  onResetDialogOpenChange,
  onResetDocument,
  pendingDeleteSection,
  onPendingDeleteSectionChange,
  onConfirmRemoveSection,
  tagDialogOpen,
  onTagDialogOpenChange,
  // @ts-expect-error - editingTagKey is intentionally unused but kept for API compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  editingTagKey,
  tagValue,
  onTagValueChange,
  onSaveTag,
  newTagDialogOpen,
  onNewTagDialogOpenChange,
  newTagKey,
  onNewTagKeyChange,
  newTagValue,
  onNewTagValueChange,
  onAddNewTag,
}: DocumentDialogsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Dialog open={newSectionDialogOpen} onOpenChange={onNewSectionDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.addSection.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.addSection.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="section-title">{t("dialogs.addSection.sectionTitle")}</Label>
            <Input
              id="section-title"
              value={newSectionTitle}
              onChange={(e) => onNewSectionTitleChange(e.target.value)}
              placeholder={t("dialogs.addSection.titlePlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddSection();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onNewSectionDialogOpenChange(false)}>
              {t("dialogs.addSection.cancel")}
            </Button>
            <Button onClick={onAddSection}>{t("dialogs.addSection.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={onTemplateDialogOpenChange}>
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
                    Sections: {template.sections.map((section) => section.title).join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={onResetDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.resetDocument.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.resetDocument.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onResetDialogOpenChange(false)}>
              {t("dialogs.resetDocument.cancel")}
            </Button>
            <Button variant="destructive" onClick={onResetDocument}>
              {t("dialogs.resetDocument.reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDeleteSection !== null}
        onOpenChange={(open) => {
          if (!open) {
            onPendingDeleteSectionChange(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.removeSection.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.removeSection.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onPendingDeleteSectionChange(null)}>
              {t("dialogs.removeSection.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDeleteSection) {
                  onConfirmRemoveSection(pendingDeleteSection.id);
                }
                onPendingDeleteSectionChange(null);
              }}
            >
              {t("dialogs.removeSection.remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialogOpen} onOpenChange={onTagDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.editTag.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.editTag.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tag-value">{t("dialogs.editTag.tagValue")}</Label>
            <Input
              id="tag-value"
              value={tagValue}
              onChange={(e) => onTagValueChange(e.target.value)}
              placeholder={t("dialogs.editTag.valuePlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveTag();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onTagDialogOpenChange(false)}>
              {t("dialogs.editTag.cancel")}
            </Button>
            <Button onClick={onSaveTag}>{t("dialogs.editTag.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newTagDialogOpen} onOpenChange={onNewTagDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.addTag.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.addTag.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-tag-key">{t("dialogs.addTag.tagName")}</Label>
              <Input
                id="new-tag-key"
                value={newTagKey}
                onChange={(e) => onNewTagKeyChange(e.target.value)}
                placeholder={t("dialogs.addTag.namePlaceholder")}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="new-tag-value">{t("dialogs.addTag.tagValue")}</Label>
              <Input
                id="new-tag-value"
                value={newTagValue}
                onChange={(e) => onNewTagValueChange(e.target.value)}
                placeholder={t("dialogs.addTag.valuePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onAddNewTag();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onNewTagDialogOpenChange(false)}>
              {t("dialogs.addTag.cancel")}
            </Button>
            <Button onClick={onAddNewTag} disabled={!newTagKey.trim()}>
              {t("dialogs.addTag.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
