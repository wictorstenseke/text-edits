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

interface NewSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onAdd: () => void;
}

export const NewSectionDialog = ({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onAdd,
}: NewSectionDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogs.addSection.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.addSection.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="section-title">
            {t("dialogs.addSection.sectionTitle")}
          </Label>
          <Input
            id="section-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("dialogs.addSection.titlePlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAdd();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.addSection.cancel")}
          </Button>
          <Button onClick={onAdd}>{t("dialogs.addSection.add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
