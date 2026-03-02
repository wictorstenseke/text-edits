import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { DeleteSectionRequest } from "@/components/document-page/ManageSectionsDialog";

interface DeleteSectionDialogProps {
  pendingSection: DeleteSectionRequest | null;
  onClose: () => void;
  onConfirm: (sectionId: string) => void;
}

export const DeleteSectionDialog = ({
  pendingSection,
  onClose,
  onConfirm,
}: DeleteSectionDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={pendingSection !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
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
          <Button variant="outline" onClick={onClose}>
            {t("dialogs.removeSection.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (pendingSection) {
                onConfirm(pendingSection.id);
              }
              onClose();
            }}
          >
            {t("dialogs.removeSection.remove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
