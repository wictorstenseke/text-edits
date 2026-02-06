import { PlusCircle, Tag as TagIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TagSidebarProps {
  isOpen: boolean;
  tagValues: Record<string, string>;
  onOpenNewTagDialog: () => void;
  onEditTag: (key: string) => void;
  onDeleteTag: (key: string) => void;
}

export const TagSidebar = ({
  isOpen,
  tagValues,
  onOpenNewTagDialog,
  onEditTag,
  onDeleteTag,
}: TagSidebarProps) => {
  if (!isOpen) {
    return null;
  }

  const entries = Object.entries(tagValues);

  return (
    <div className="w-80 border-l bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Tag Library
          </Label>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onOpenNewTagDialog}
            title="Add new tag"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Type @ in the editor to insert a tag
        </p>
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2 rounded bg-muted hover:bg-accent group"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onEditTag(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onEditTag(key);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="text-xs font-mono font-semibold">{key}</div>
                <div className="text-xs text-muted-foreground truncate">{value}</div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDeleteTag(key)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                title="Delete tag"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        {entries.length > 0 && (
          <Button variant="outline" onClick={onOpenNewTagDialog} className="w-full mt-3">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        )}
      </div>
    </div>
  );
};
