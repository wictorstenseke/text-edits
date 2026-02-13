import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import {
  DocumentContentRenderer,
  DocumentDialogs,
  DocumentPreviewPane,
  DocumentSectionBlock,
  EditorHeader,
  ManageSectionsDialog,
  SectionNavigationSidebar,
  TagSidebar,
  type DeleteSectionRequest,
  type FontFamily,
} from "@/components/document-page";
import { type TagItem } from "@/components/rich-text-editor";
import {
  getSampleDocument,
  loadDocument,
  saveDocument,
  getSampleTemplates,
} from "@/lib/documentStorage";
import { exportToPDF, type PDFExportOptions } from "@/lib/pdfExport";
import {
  addChildSection,
  addParentSection,
  buildSectionGroups,
  getFirstSectionId,
  isHierarchyDropAllowed,
  removeSectionWithChildren,
  reorderSectionsByDrag,
  type SectionDragItem,
  type SectionKind,
} from "@/lib/sectionHierarchy";
import { sanitizeTagValue } from "@/lib/tagValidation";

import type { Document, Section, Template } from "@/types/document";

export const DocumentEditor = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<Document>(() => loadDocument());
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    getFirstSectionId(document.sections)
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [manageSectionsDialogOpen, setManageSectionsDialogOpen] =
    useState(false);
  const [manageNewParentSectionTitle, setManageNewParentSectionTitle] =
    useState("");
  const [manageNewChildSectionTitle, setManageNewChildSectionTitle] =
    useState("");
  const [manageChildParentId, setManageChildParentId] = useState<string | null>(
    null
  );
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templates] = useState<Template[]>(getSampleTemplates());
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState("");
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [pendingDeleteSection, setPendingDeleteSection] =
    useState<DeleteSectionRequest | null>(null);
  const [pageWidth, setPageWidth] = useState<"narrow" | "medium" | "wide">(
    "medium"
  );
  const [isTagPanelOpen, setIsTagPanelOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    const saved = localStorage.getItem(
      "documentFontFamily"
    ) as FontFamily | null;
    return saved && ["sans", "serif", "mono"].includes(saved) ? saved : "sans";
  });

  const fontFamilyOptions = useMemo(
    () => [
      { value: "sans" as const, label: "Sans-serif" },
      { value: "serif" as const, label: "Serif" },
      { value: "mono" as const, label: "Monospace" },
    ],
    []
  );

  const handleFontFamilyChange = (value: string): void => {
    const newFont = value as FontFamily;
    setFontFamily(newFont);
    localStorage.setItem("documentFontFamily", newFont);
  };

  const [draggedSection, setDraggedSection] = useState<SectionDragItem | null>(
    null
  );
  const [previewSections, setPreviewSections] = useState<Section[] | null>(
    null
  );
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(
    null
  );
  const dragHoverRef = useRef<{
    targetId: string | null;
    position: "above" | "below" | null;
  }>({
    targetId: null,
    position: null,
  });

  const pageWidthOptions = useMemo(
    () => ["narrow", "medium", "wide"] as const,
    []
  );

  const sectionGroups = useMemo(
    () => buildSectionGroups(document.sections),
    [document.sections]
  );

  const manageSectionGroups = useMemo(
    () => buildSectionGroups(previewSections ?? document.sections),
    [previewSections, document.sections]
  );

  const parentSections = useMemo(
    () => sectionGroups.map((group) => group.parent),
    [sectionGroups]
  );

  const pageWidthIndex = useMemo(
    () => pageWidthOptions.indexOf(pageWidth),
    [pageWidth, pageWidthOptions]
  );

  const handleDecreasePageWidth = useCallback(() => {
    setPageWidth((prev) => {
      const prevIndex = pageWidthOptions.indexOf(prev);
      const nextIndex = Math.max(0, prevIndex - 1);
      return pageWidthOptions[nextIndex];
    });
  }, [pageWidthOptions]);

  const handleIncreasePageWidth = useCallback(() => {
    setPageWidth((prev) => {
      const prevIndex = pageWidthOptions.indexOf(prev);
      const nextIndex = Math.min(pageWidthOptions.length - 1, prevIndex + 1);
      return pageWidthOptions[nextIndex];
    });
  }, [pageWidthOptions]);

  // Convert tagValues to TagItem array for the editor
  const tags: TagItem[] = useMemo(
    () =>
      Object.entries(document.tagValues).map(([key, value]) => ({
        key,
        value,
      })),
    [document.tagValues]
  );

  // Auto-save whenever document changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDocument(document);
    }, 500);
    return () => clearTimeout(timer);
  }, [document]);

  const sectionIdSet = useMemo(
    () =>
      new Set(
        sectionGroups.flatMap((group) => [
          group.parent.id,
          ...group.children.map((child) => child.id),
        ])
      ),
    [sectionGroups]
  );

  const effectiveSelectedSectionId = useMemo(() => {
    if (selectedSectionId && sectionIdSet.has(selectedSectionId)) {
      return selectedSectionId;
    }
    return getFirstSectionId(document.sections);
  }, [document.sections, sectionIdSet, selectedSectionId]);

  const effectiveManageChildParentId = useMemo(() => {
    if (parentSections.length === 0) {
      return null;
    }

    if (
      manageChildParentId &&
      parentSections.some((section) => section.id === manageChildParentId)
    ) {
      return manageChildParentId;
    }

    return parentSections[0].id;
  }, [manageChildParentId, parentSections]);

  const handleSectionClick = (sectionId: string, scrollToSection = false) => {
    // If we're editing a different section, don't allow switching without saving
    if (editingSectionId && editingSectionId !== sectionId) {
      return;
    }
    setSelectedSectionId(sectionId);

    // Only smooth-scroll when navigating from the left sidebar, not when clicking in the document
    if (scrollToSection) {
      // Defer scroll until after React commits and layout settles. Without this,
      // getBoundingClientRect runs against stale DOM (before selectedSectionId
      // applies), causing ~16px offset that requires a second click to correct.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const sanitizedId = CSS.escape(sectionId);
          const sectionElement = window.document.querySelector(
            `[data-section-id="${sanitizedId}"]`
          );
          const container = scrollContainerRef.current;
          if (sectionElement && container) {
            const containerRect = container.getBoundingClientRect();
            const sectionRect = (
              sectionElement as HTMLElement
            ).getBoundingClientRect();

            const offsetWithinContainer = sectionRect.top - containerRect.top;
            const desiredTopOffset = 16;
            const rawTargetScrollTop =
              container.scrollTop + offsetWithinContainer - desiredTopOffset;

            const maxScrollTop =
              container.scrollHeight - container.clientHeight;
            const clampedTargetScrollTop = Math.min(
              Math.max(rawTargetScrollTop, 0),
              Math.max(maxScrollTop, 0)
            );

            container.scrollTo({
              top: clampedTargetScrollTop,
              behavior: "smooth",
            });
          }
        });
      });
    }
  };

  const handleStartEditing = (sectionId: string) => {
    setEditingSectionId(sectionId);
    setSelectedSectionId(sectionId);
  };

  const handleSaveInlineEdit = useCallback(
    (content: string, title?: string) => {
      if (!editingSectionId) return;

      setDocument((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === editingSectionId
            ? { ...section, content, ...(title && { title }) }
            : section
        ),
      }));
      setEditingSectionId(null);
    },
    [editingSectionId]
  );

  const handleCancelInlineEdit = useCallback(() => {
    setEditingSectionId(null);
  }, []);

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;

    const { sections, createdSection } = addParentSection(
      document.sections,
      newSectionTitle.trim()
    );

    setDocument((prev) => ({
      ...prev,
      sections,
    }));

    setNewSectionTitle("");
    setNewSectionDialogOpen(false);
    setSelectedSectionId(createdSection.id);
  };

  const handleResetDocument = useCallback(() => {
    const resetDocument = getSampleDocument();
    setDocument(resetDocument);
    setSelectedSectionId(getFirstSectionId(resetDocument.sections));
    setEditingSectionId(null);
    setResetDialogOpen(false);
  }, [
    setDocument,
    setEditingSectionId,
    setResetDialogOpen,
    setSelectedSectionId,
  ]);

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      const updatedSections = removeSectionWithChildren(
        document.sections,
        sectionId
      );

      setDocument((prev) => ({
        ...prev,
        sections: updatedSections,
      }));

      if (
        selectedSectionId &&
        !updatedSections.some((section) => section.id === selectedSectionId)
      ) {
        setSelectedSectionId(getFirstSectionId(updatedSections));
      }

      if (
        editingSectionId &&
        !updatedSections.some((section) => section.id === editingSectionId)
      ) {
        setEditingSectionId(null);
      }
    },
    [document.sections, editingSectionId, selectedSectionId]
  );

  const handleAddParentSectionFromManage = useCallback(() => {
    if (!manageNewParentSectionTitle.trim()) return;

    const { sections, createdSection } = addParentSection(
      document.sections,
      manageNewParentSectionTitle.trim()
    );

    setDocument((prev) => ({
      ...prev,
      sections,
    }));

    setManageNewParentSectionTitle("");
    setSelectedSectionId(createdSection.id);
  }, [
    document.sections,
    manageNewParentSectionTitle,
    setDocument,
    setManageNewParentSectionTitle,
    setSelectedSectionId,
  ]);

  const handleAddChildSectionFromManage = useCallback(() => {
    if (!manageNewChildSectionTitle.trim() || !effectiveManageChildParentId) {
      return;
    }

    const { sections, createdSection } = addChildSection(
      document.sections,
      effectiveManageChildParentId,
      manageNewChildSectionTitle.trim()
    );

    if (!createdSection) return;

    setDocument((prev) => ({
      ...prev,
      sections,
    }));

    setManageNewChildSectionTitle("");
    setSelectedSectionId(createdSection.id);
  }, [
    document.sections,
    effectiveManageChildParentId,
    manageNewChildSectionTitle,
    setDocument,
    setManageNewChildSectionTitle,
    setSelectedSectionId,
  ]);

  const handleDragStart = (
    e: React.DragEvent,
    dragItem: SectionDragItem
  ): void => {
    setDraggedSection(dragItem);
    setPreviewSections(null);
    setDropPosition(null);
    dragHoverRef.current = { targetId: null, position: null };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent,
    target: SectionDragItem
  ): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedSection || !isHierarchyDropAllowed(draggedSection, target)) {
      setPreviewSections(null);
      setDropPosition(null);
      dragHoverRef.current = { targetId: null, position: null };
      return;
    }

    const isSameOrder = (a: Section[], b: Section[]) =>
      a.length === b.length &&
      a.every((section, index) => section.id === b[index]?.id);

    // Use hysteresis near the midpoint to avoid rapid above/below toggling.
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const upperThreshold = rect.height * 0.35;
    const lowerThreshold = rect.height * 0.65;
    let nextDropPosition: "above" | "below";

    if (mouseY <= upperThreshold) {
      nextDropPosition = "above";
    } else if (mouseY >= lowerThreshold) {
      nextDropPosition = "below";
    } else if (
      dragHoverRef.current.targetId === target.sectionId &&
      dragHoverRef.current.position
    ) {
      nextDropPosition = dragHoverRef.current.position;
    } else {
      nextDropPosition = mouseY < rect.height / 2 ? "above" : "below";
    }

    setDropPosition((prev) =>
      prev === nextDropPosition ? prev : nextDropPosition
    );

    const currentVisualSections = previewSections ?? document.sections;
    const nextPreviewSections = reorderSectionsByDrag(
      currentVisualSections,
      draggedSection,
      target,
      nextDropPosition
    );

    if (isSameOrder(nextPreviewSections, currentVisualSections)) {
      dragHoverRef.current = {
        targetId: target.sectionId,
        position: nextDropPosition,
      };
      return;
    }

    if (isSameOrder(nextPreviewSections, document.sections)) {
      if (previewSections !== null) {
        setPreviewSections(null);
      }
    } else if (
      previewSections === null ||
      !isSameOrder(nextPreviewSections, previewSections)
    ) {
      setPreviewSections(nextPreviewSections);
    }

    dragHoverRef.current = {
      targetId: target.sectionId,
      position: nextDropPosition,
    };
  };

  const handleDrop = (e: React.DragEvent, target: SectionDragItem): void => {
    e.preventDefault();
    if (
      !draggedSection ||
      !dropPosition ||
      !isHierarchyDropAllowed(draggedSection, target)
    ) {
      setPreviewSections(null);
      dragHoverRef.current = { targetId: null, position: null };
      return;
    }

    const reorderedSections =
      previewSections ??
      reorderSectionsByDrag(
        document.sections,
        draggedSection,
        target,
        dropPosition
      );

    setDocument((prev) => ({
      ...prev,
      sections: reorderedSections,
    }));

    setDraggedSection(null);
    setPreviewSections(null);
    setDropPosition(null);
    dragHoverRef.current = { targetId: null, position: null };
  };

  const handleDragEnd = (): void => {
    setDraggedSection(null);
    setPreviewSections(null);
    setDropPosition(null);
    dragHoverRef.current = { targetId: null, position: null };
  };

  const handleCreateFromTemplate = useCallback(
    (template: Template) => {
      const timestamp = Date.now();
      const newSections: Section[] = template.sections.map((ts, index) => ({
        id: `section-${timestamp}-${index}`,
        title: ts.title,
        order: index,
        parentId: null,
        content:
          ts.content ||
          JSON.stringify({
            type: "doc",
            content: [{ type: "paragraph" }],
          }),
      }));

      setDocument({
        id: `doc-${timestamp}`,
        title: template.name,
        sections: newSections,
        tagValues: {},
      });

      setSelectedSectionId(getFirstSectionId(newSections));
      setTemplateDialogOpen(false);
    },
    [setDocument, setSelectedSectionId, setTemplateDialogOpen]
  );

  const handleEditTag = (key: string) => {
    setEditingTagKey(key);
    setTagValue(document.tagValues[key] || "");
    setTagDialogOpen(true);
  };

  const handleSaveTag = () => {
    if (!editingTagKey) return;

    setDocument((prev) => ({
      ...prev,
      tagValues: {
        ...prev.tagValues,
        [editingTagKey]: sanitizeTagValue(tagValue),
      },
    }));

    setTagDialogOpen(false);
    setEditingTagKey(null);
    setTagValue("");
  };

  const handleAddNewTag = () => {
    if (!newTagKey.trim()) return;

    setDocument((prev) => ({
      ...prev,
      tagValues: {
        ...prev.tagValues,
        [newTagKey.trim()]: sanitizeTagValue(newTagValue),
      },
    }));

    setNewTagDialogOpen(false);
    setNewTagKey("");
    setNewTagValue("");
  };

  const handleDeleteTag = (key: string) => {
    setDocument((prev) => {
      // Create a new object without the key
      const newTagValues = Object.fromEntries(
        Object.entries(prev.tagValues).filter(([k]) => k !== key)
      );
      return {
        ...prev,
        tagValues: newTagValues,
      };
    });
  };

  const handleExportPDF = async () => {
    if (!documentContainerRef.current) return;

    try {
      const options: PDFExportOptions = {
        pageWidth,
        fontFamily,
      };
      await exportToPDF(document, documentContainerRef.current, options);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to export PDF. Please try again."
      );
    }
  };

  const renderSectionBlock = (
    section: Section,
    kind: SectionKind
  ): React.ReactNode => {
    return (
      <DocumentSectionBlock
        section={section}
        kind={kind}
        editingSectionId={editingSectionId}
        selectedSectionId={effectiveSelectedSectionId}
        tags={tags}
        fontFamily={fontFamily}
        renderContent={(content) => (
          <DocumentContentRenderer
            content={content}
            tagValues={document.tagValues}
          />
        )}
        onSectionClick={(sectionId) => handleSectionClick(sectionId)}
        onStartEditing={handleStartEditing}
        onStopEditing={() => setEditingSectionId(null)}
        onSaveInlineEdit={handleSaveInlineEdit}
        onCancelInlineEdit={handleCancelInlineEdit}
      />
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <EditorHeader
        title={document.title}
        onTitleChange={(title) => setDocument((prev) => ({ ...prev, title }))}
        pageWidthIndex={pageWidthIndex}
        pageWidthOptionCount={pageWidthOptions.length}
        onDecreasePageWidth={handleDecreasePageWidth}
        onIncreasePageWidth={handleIncreasePageWidth}
        fontFamily={fontFamily}
        fontFamilyOptions={fontFamilyOptions}
        onFontFamilyChange={handleFontFamilyChange}
        onResetDocument={() => setResetDialogOpen(true)}
        onExportPDF={handleExportPDF}
        isTagPanelOpen={isTagPanelOpen}
        onToggleTagPanel={() => setIsTagPanelOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        <SectionNavigationSidebar
          sectionGroups={sectionGroups}
          selectedSectionId={effectiveSelectedSectionId}
          onSectionClick={handleSectionClick}
          onOpenNewSectionDialog={() => setNewSectionDialogOpen(true)}
          onOpenManageSectionsDialog={() => setManageSectionsDialogOpen(true)}
        />
        <DocumentPreviewPane
          scrollContainerRef={scrollContainerRef}
          documentContainerRef={documentContainerRef}
          pageWidth={pageWidth}
          title={document.title}
          sectionGroups={sectionGroups}
          renderSectionBlock={renderSectionBlock}
        />
        <TagSidebar
          isOpen={isTagPanelOpen}
          tagValues={document.tagValues}
          onOpenNewTagDialog={() => setNewTagDialogOpen(true)}
          onEditTag={handleEditTag}
          onDeleteTag={handleDeleteTag}
        />
      </div>

      <ManageSectionsDialog
        open={manageSectionsDialogOpen}
        onOpenChange={setManageSectionsDialogOpen}
        manageNewParentSectionTitle={manageNewParentSectionTitle}
        onManageNewParentSectionTitleChange={setManageNewParentSectionTitle}
        onAddParentSection={handleAddParentSectionFromManage}
        manageNewChildSectionTitle={manageNewChildSectionTitle}
        onManageNewChildSectionTitleChange={setManageNewChildSectionTitle}
        effectiveManageChildParentId={effectiveManageChildParentId}
        onManageChildParentIdChange={setManageChildParentId}
        parentSections={parentSections}
        onAddChildSection={handleAddChildSectionFromManage}
        manageSectionGroups={manageSectionGroups}
        draggedSection={draggedSection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onRequestDeleteSection={setPendingDeleteSection}
      />
      <DocumentDialogs
        newSectionDialogOpen={newSectionDialogOpen}
        onNewSectionDialogOpenChange={setNewSectionDialogOpen}
        newSectionTitle={newSectionTitle}
        onNewSectionTitleChange={setNewSectionTitle}
        onAddSection={handleAddSection}
        templateDialogOpen={templateDialogOpen}
        onTemplateDialogOpenChange={setTemplateDialogOpen}
        templates={templates}
        onCreateFromTemplate={handleCreateFromTemplate}
        resetDialogOpen={resetDialogOpen}
        onResetDialogOpenChange={setResetDialogOpen}
        onResetDocument={handleResetDocument}
        pendingDeleteSection={pendingDeleteSection}
        onPendingDeleteSectionChange={setPendingDeleteSection}
        onConfirmRemoveSection={handleRemoveSection}
        tagDialogOpen={tagDialogOpen}
        onTagDialogOpenChange={setTagDialogOpen}
        editingTagKey={editingTagKey}
        tagValue={tagValue}
        onTagValueChange={setTagValue}
        onSaveTag={handleSaveTag}
        newTagDialogOpen={newTagDialogOpen}
        onNewTagDialogOpenChange={setNewTagDialogOpen}
        newTagKey={newTagKey}
        onNewTagKeyChange={setNewTagKey}
        newTagValue={newTagValue}
        onNewTagValueChange={setNewTagValue}
        onAddNewTag={handleAddNewTag}
      />
    </div>
  );
};
