import { GripVertical, Trash2 } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { isHierarchyDropAllowed, type SectionDragItem, type SectionKind, type SectionGroup } from "@/lib/sectionHierarchy";
import { cn } from "@/lib/utils";

import type { Section } from "@/types/document";

export interface DeleteSectionRequest {
  id: string;
  title: string;
  kind: SectionKind;
  childCount?: number;
}

interface ManageSectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manageNewParentSectionTitle: string;
  onManageNewParentSectionTitleChange: (value: string) => void;
  onAddParentSection: () => void;
  manageNewChildSectionTitle: string;
  onManageNewChildSectionTitleChange: (value: string) => void;
  effectiveManageChildParentId: string | null;
  onManageChildParentIdChange: (parentId: string | null) => void;
  parentSections: Section[];
  onAddChildSection: () => void;
  manageSectionGroups: SectionGroup[];
  draggedSection: SectionDragItem | null;
  onDragStart: (e: React.DragEvent, dragItem: SectionDragItem) => void;
  onDragOver: (e: React.DragEvent, target: SectionDragItem) => void;
  onDrop: (e: React.DragEvent, target: SectionDragItem) => void;
  onDragEnd: () => void;
  onRequestDeleteSection: (section: DeleteSectionRequest) => void;
}

export const ManageSectionsDialog = ({
  open,
  onOpenChange,
  manageNewParentSectionTitle,
  onManageNewParentSectionTitleChange,
  onAddParentSection,
  manageNewChildSectionTitle,
  onManageNewChildSectionTitleChange,
  effectiveManageChildParentId,
  onManageChildParentIdChange,
  parentSections,
  onAddChildSection,
  manageSectionGroups,
  draggedSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRequestDeleteSection,
}: ManageSectionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-hidden p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader className="shrink-0 border-b bg-background px-6 py-4 pr-12">
          <DialogTitle>Manage sections</DialogTitle>
          <DialogDescription>
            Add, remove, and change the order of top-level sections and
            sub-sections.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 h-full" type="always">
          <div className="space-y-4 px-6 pt-4 pb-6">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="manage-parent-section-title">
                  New top-level section
                </Label>
                <Input
                  id="manage-parent-section-title"
                  value={manageNewParentSectionTitle}
                  onChange={(e) =>
                    onManageNewParentSectionTitleChange(e.target.value)
                  }
                  placeholder="Enter top-level section title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onAddParentSection();
                    }
                  }}
                />
              </div>
              <Button onClick={onAddParentSection}>Add parent</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2 items-end">
              <div className="space-y-2">
                <Label htmlFor="manage-child-section-title">New sub-section</Label>
                <Input
                  id="manage-child-section-title"
                  value={manageNewChildSectionTitle}
                  onChange={(e) =>
                    onManageNewChildSectionTitleChange(e.target.value)
                  }
                  placeholder="Enter sub-section title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onAddChildSection();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manage-child-parent-select">Under parent</Label>
                <select
                  id="manage-child-parent-select"
                  value={effectiveManageChildParentId ?? ""}
                  onChange={(e) =>
                    onManageChildParentIdChange(e.target.value || null)
                  }
                  className="flex h-9 w-full min-w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={parentSections.length === 0}
                >
                  {parentSections.length === 0 ? (
                    <option value="">No parent sections yet</option>
                  ) : (
                    parentSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <Button
                onClick={onAddChildSection}
                disabled={
                  parentSections.length === 0 ||
                  !manageNewChildSectionTitle.trim() ||
                  !effectiveManageChildParentId
                }
              >
                Add sub-section
              </Button>
            </div>
            <div className="flex flex-col gap-2 pb-1">
              {manageSectionGroups.map((group) => (
                <div key={group.parent.id} className="space-y-1">
                  <div
                    draggable
                    onDragStart={(e) =>
                      onDragStart(e, {
                        sectionId: group.parent.id,
                        kind: "parent",
                        parentId: null,
                      })
                    }
                    onDragOver={(e) =>
                      onDragOver(e, {
                        sectionId: group.parent.id,
                        kind: "parent",
                        parentId: null,
                      })
                    }
                    onDrop={(e) =>
                      onDrop(e, {
                        sectionId: group.parent.id,
                        kind: "parent",
                        parentId: null,
                      })
                    }
                    onDragEnd={onDragEnd}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-move",
                      "transition-all duration-200 ease-out",
                      draggedSection?.sectionId === group.parent.id &&
                        "opacity-40 scale-95"
                    )}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {group.parent.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Top-level section
                      </div>
                    </div>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        onRequestDeleteSection({
                          id: group.parent.id,
                          title: group.parent.title,
                          kind: "parent",
                          childCount: group.children.length,
                        })
                      }
                      aria-label="Remove section"
                      title="Remove"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {group.children.length > 0 && (
                    <div className="ml-6 border-l border-border/70 pl-2 space-y-1">
                      {group.children.map((child) => (
                        <div
                          key={child.id}
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, {
                              sectionId: child.id,
                              kind: "child",
                              parentId: group.parent.id,
                            })
                          }
                          onDragOver={(e) =>
                            onDragOver(e, {
                              sectionId: child.id,
                              kind: "child",
                              parentId: group.parent.id,
                            })
                          }
                          onDrop={(e) =>
                            onDrop(e, {
                              sectionId: child.id,
                              kind: "child",
                              parentId: group.parent.id,
                            })
                          }
                          onDragEnd={onDragEnd}
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-move",
                            "transition-all duration-200 ease-out",
                            draggedSection?.sectionId === child.id &&
                              "opacity-40 scale-95",
                            draggedSection &&
                              !isHierarchyDropAllowed(draggedSection, {
                                sectionId: child.id,
                                kind: "child",
                                parentId: group.parent.id,
                              }) &&
                              "opacity-60"
                          )}
                        >
                          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {child.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                              Sub-section
                            </div>
                          </div>

                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() =>
                              onRequestDeleteSection({
                                id: child.id,
                                title: child.title,
                                kind: "child",
                              })
                            }
                            aria-label="Remove section"
                            title="Remove"
                            className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t bg-muted/40 px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
