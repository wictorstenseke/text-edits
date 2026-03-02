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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

export const EditTagDialog = ({
  open,
  onOpenChange,
  value,
  onValueChange,
  onSave,
}: EditTagDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={t("dialogs.editTag.valuePlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSave();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.editTag.cancel")}
          </Button>
          <Button onClick={onSave}>{t("dialogs.editTag.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
