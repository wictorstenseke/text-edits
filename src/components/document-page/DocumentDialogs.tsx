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
  return (
    <>
      <Dialog open={newSectionDialogOpen} onOpenChange={onNewSectionDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Top-Level Section</DialogTitle>
            <DialogDescription>
              Enter a title for the new top-level section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="section-title">Top-level section title</Label>
            <Input
              id="section-title"
              value={newSectionTitle}
              onChange={(e) => onNewSectionTitleChange(e.target.value)}
              placeholder="Enter section title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddSection();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onNewSectionDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onAddSection}>Add Parent Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={onTemplateDialogOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create from Template</DialogTitle>
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
            <DialogTitle>Reset document</DialogTitle>
            <DialogDescription>
              This will reset all content to the initial state. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onResetDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onResetDocument}>
              Reset
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
            <DialogTitle>Remove section</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              {pendingDeleteSection ? (
                <span className="font-semibold">
                  {pendingDeleteSection.title || "this section"}
                </span>
              ) : (
                "this section"
              )}
              {pendingDeleteSection?.kind === "parent" &&
              pendingDeleteSection.childCount &&
              pendingDeleteSection.childCount > 0
                ? ` and ${pendingDeleteSection.childCount} sub-section${
                    pendingDeleteSection.childCount === 1 ? "" : "s"
                  }`
                : ""}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onPendingDeleteSectionChange(null)}>
              Cancel
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
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialogOpen} onOpenChange={onTagDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag Value</DialogTitle>
            <DialogDescription>
              Update the value for <code className="font-mono">{editingTagKey}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tag-value">Value</Label>
            <Input
              id="tag-value"
              value={tagValue}
              onChange={(e) => onTagValueChange(e.target.value)}
              placeholder="Enter tag value"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveTag();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onTagDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveTag}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newTagDialogOpen} onOpenChange={onNewTagDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag that can be inserted into your document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-tag-key">Tag Name</Label>
              <Input
                id="new-tag-key"
                value={newTagKey}
                onChange={(e) => onNewTagKeyChange(e.target.value)}
                placeholder="e.g., CompanyName"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="new-tag-value">Value</Label>
              <Input
                id="new-tag-value"
                value={newTagValue}
                onChange={(e) => onNewTagValueChange(e.target.value)}
                placeholder="e.g., Acme AB"
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
              Cancel
            </Button>
            <Button onClick={onAddNewTag} disabled={!newTagKey.trim()}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
