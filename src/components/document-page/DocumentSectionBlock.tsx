import { type ReactNode } from "react";

import { InlineSectionEditor, type TagItem } from "@/components/rich-text-editor";
import { cn } from "@/lib/utils";

import type { FontFamily } from "@/components/document-page/EditorHeader";
import type { SectionKind } from "@/lib/sectionHierarchy";
import type { Section } from "@/types/document";

interface DocumentSectionBlockProps {
  section: Section;
  kind: SectionKind;
  editingSectionId: string | null;
  selectedSectionId: string | null;
  tags: TagItem[];
  fontFamily: FontFamily;
  renderContent: (content: string) => ReactNode;
  onSectionClick: (sectionId: string) => void;
  onStartEditing: (sectionId: string) => void;
  onStopEditing: () => void;
  onSaveInlineEdit: (content: string, title?: string) => void;
  onCancelInlineEdit: () => void;
}

export const DocumentSectionBlock = ({
  section,
  kind,
  editingSectionId,
  selectedSectionId,
  tags,
  fontFamily,
  renderContent,
  onSectionClick,
  onStartEditing,
  onStopEditing,
  onSaveInlineEdit,
  onCancelInlineEdit,
}: DocumentSectionBlockProps) => {
  const isParent = kind === "parent";
  const isEditing = editingSectionId === section.id;
  const isSelected = selectedSectionId === section.id;

  const headingClasses = cn(
    isParent ? "text-2xl font-bold mb-3" : "text-lg font-semibold mb-3",
    fontFamily === "serif" && "font-serif",
    fontFamily === "mono" && "font-mono"
  );

  return (
    <div
      data-section-id={section.id}
      className={cn(
        "rounded-lg transition-all",
        isParent ? "mb-6 p-5 border" : "mb-4 p-4 border",
        isEditing
          ? "ring-2 ring-primary bg-white border-primary/20"
          : isSelected
            ? "ring-2 ring-primary/50 bg-accent/40 border-primary/20 cursor-pointer"
            : "hover:bg-accent/40 border-border/60 cursor-pointer"
      )}
      onClick={() => {
        if (editingSectionId !== section.id) {
          onSectionClick(section.id);
        }
      }}
      onDoubleClick={() => {
        if (editingSectionId && editingSectionId !== section.id) {
          onStopEditing();
        }
        if (editingSectionId !== section.id) {
          onStartEditing(section.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !editingSectionId) {
          onStartEditing(section.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {isEditing ? (
        <InlineSectionEditor
          content={section.content}
          tags={tags}
          title={section.title}
          onSave={onSaveInlineEdit}
          onCancel={onCancelInlineEdit}
          className="mb-3"
          fontFamily={fontFamily}
        />
      ) : isParent ? (
        <h2 className={headingClasses}>{section.title}</h2>
      ) : (
        <h3 className={headingClasses}>{section.title}</h3>
      )}

      {!isEditing && (
        <div
          className={cn(
            "prose prose-sm max-w-none",
            fontFamily === "serif" && "prose-serif",
            fontFamily === "mono" && "prose-mono"
          )}
        >
          {renderContent(section.content)}
          {isSelected && (
            <div className="mt-2 text-xs text-muted-foreground">
              Double-click to edit inline
            </div>
          )}
        </div>
      )}
    </div>
  );
};
