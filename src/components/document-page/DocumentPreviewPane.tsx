import { type ReactNode, type RefObject } from "react";

import { cn } from "@/lib/utils";

import type { SectionKind, SectionGroup } from "@/lib/sectionHierarchy";
import type { Section } from "@/types/document";

interface DocumentPreviewPaneProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  documentContainerRef: RefObject<HTMLDivElement | null>;
  pageWidth: "narrow" | "medium" | "wide";
  title: string;
  sectionGroups: SectionGroup[];
  renderSectionBlock: (section: Section, kind: SectionKind) => ReactNode;
}

export const DocumentPreviewPane = ({
  scrollContainerRef,
  documentContainerRef,
  pageWidth,
  title,
  sectionGroups,
  renderSectionBlock,
}: DocumentPreviewPaneProps) => {
  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-muted/80">
      <div
        ref={documentContainerRef}
        className={cn(
          "mx-auto p-8 bg-background my-8 shadow-sm rounded-lg",
          pageWidth === "narrow" && "max-w-2xl",
          pageWidth === "medium" && "max-w-4xl",
          pageWidth === "wide" && "max-w-6xl"
        )}
      >
        <h1 className="text-3xl font-semibold mb-6">{title}</h1>
        {sectionGroups.map((group) => (
          <div key={group.parent.id} className="mb-2">
            {renderSectionBlock(group.parent, "parent")}
            {group.children.length > 0 && (
              <div className="ml-6 mt-2 border-l border-border/60 pl-4">
                {group.children.map((child) => (
                  <div key={child.id}>{renderSectionBlock(child, "child")}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
