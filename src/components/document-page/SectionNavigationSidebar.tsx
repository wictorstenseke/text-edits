import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SectionGroup } from "@/lib/sectionHierarchy";

interface SectionNavigationSidebarProps {
  sectionGroups: SectionGroup[];
  selectedSectionId: string | null;
  onSectionClick: (sectionId: string, scrollToSection: boolean) => void;
  onOpenNewSectionDialog: () => void;
  onOpenManageSectionsDialog: () => void;
}

export const SectionNavigationSidebar = ({
  sectionGroups,
  selectedSectionId,
  onSectionClick,
  onOpenNewSectionDialog,
  onOpenManageSectionsDialog,
}: SectionNavigationSidebarProps) => {
  return (
    <div className="w-64 border-r bg-background overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Sections</h2>
          <Button size="icon-sm" variant="ghost" onClick={onOpenNewSectionDialog}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {sectionGroups.map((group) => (
            <div key={group.parent.id} className="space-y-1">
              <div
                className={cn(
                  "group rounded-lg p-2 cursor-pointer transition-colors border text-foreground",
                  "hover:bg-accent/60 active:bg-accent/70",
                  selectedSectionId === group.parent.id
                    ? "bg-primary/15 border-primary/40 text-foreground"
                    : "border-transparent hover:border-accent/50"
                )}
                onClick={() => onSectionClick(group.parent.id, true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSectionClick(group.parent.id, true);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span className="block text-xs font-semibold leading-tight text-foreground truncate">
                  {group.parent.title}
                </span>
              </div>

              {group.children.length > 0 && (
                <div className="ml-3 border-l border-border/70 pl-2 space-y-1">
                  {group.children.map((child) => (
                    <div
                      key={child.id}
                      className={cn(
                        "group rounded-md p-2 cursor-pointer transition-colors border text-foreground",
                        "hover:bg-accent/50 active:bg-accent/60",
                        selectedSectionId === child.id
                          ? "bg-primary/10 border-primary/35 text-foreground"
                          : "border-transparent hover:border-accent/50"
                      )}
                      onClick={() => onSectionClick(child.id, true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSectionClick(child.id, true);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="block text-xs font-medium leading-tight text-foreground truncate">
                        {child.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="pt-3">
          <Button variant="outline" className="w-full" onClick={onOpenManageSectionsDialog}>
            Manage sections
          </Button>
        </div>
      </div>
    </div>
  );
};
