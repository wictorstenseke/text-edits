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

interface NewTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagKey: string;
  tagValue: string;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onAdd: () => void;
}

export const NewTagDialog = ({
  open,
  onOpenChange,
  tagKey,
  tagValue,
  onKeyChange,
  onValueChange,
  onAdd,
}: NewTagDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={tagKey}
              onChange={(e) => onKeyChange(e.target.value)}
              placeholder={t("dialogs.addTag.namePlaceholder")}
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="new-tag-value">
              {t("dialogs.addTag.tagValue")}
            </Label>
            <Input
              id="new-tag-value"
              value={tagValue}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={t("dialogs.addTag.valuePlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAdd();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.addTag.cancel")}
          </Button>
          <Button onClick={onAdd} disabled={!tagKey.trim()}>
            {t("dialogs.addTag.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
