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

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export const ResetDialog = ({
  open,
  onOpenChange,
  onReset,
}: ResetDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogs.resetDocument.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.resetDocument.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.resetDocument.cancel")}
          </Button>
          <Button variant="destructive" onClick={onReset}>
            {t("dialogs.resetDocument.reset")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
