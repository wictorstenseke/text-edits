import {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import {
  Plus,
  Minus,
  Trash2,
  FileText,
  Tag as TagIcon,
  PlusCircle,
  ArrowUpFromLine,
  RotateCcw,
  Type,
  GripVertical,
} from "lucide-react";

import { InlineSectionEditor, type TagItem } from "@/components/editor";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getSampleDocument,
  loadDocument,
  saveDocument,
  getSampleTemplates,
} from "@/lib/documentStorage";
import { exportToPDF } from "@/lib/pdfExport";
import { cn } from "@/lib/utils";

import type {
  Document,
  Section,
  Template,
  FinancialReportColumn,
  FinancialReportRow,
} from "@/types/document";

/** Legacy row format had accountNumber at top level */
type LegacyFinancialReportRow = FinancialReportRow & {
  accountNumber?: string;
};

interface TipTapNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
}

export const DocumentEditor = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<Document>(loadDocument());
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    document.sections[0]?.id || null
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [manageSectionsDialogOpen, setManageSectionsDialogOpen] =
    useState(false);
  const [manageNewSectionTitle, setManageNewSectionTitle] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templates] = useState<Template[]>(getSampleTemplates());
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState("");
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [pendingDeleteSection, setPendingDeleteSection] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [pageWidth, setPageWidth] = useState<"narrow" | "medium" | "wide">(
    "medium"
  );
  const [isTagPanelOpen, setIsTagPanelOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">(
    () => {
      const saved = localStorage.getItem("documentFontFamily") as
        | "sans"
        | "serif"
        | "mono"
        | null;
      return saved && ["sans", "serif", "mono"].includes(saved)
        ? saved
        : "sans";
    }
  );

  const fontFamilyOptions = useMemo(
    () => [
      { value: "sans" as const, label: "Sans-serif" },
      { value: "serif" as const, label: "Serif" },
      { value: "mono" as const, label: "Monospace" },
    ],
    []
  );

  const handleFontFamilyChange = (value: string): void => {
    const newFont = value as "sans" | "serif" | "mono";
    setFontFamily(newFont);
    localStorage.setItem("documentFontFamily", newFont);
  };

  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(
    null
  );
  const [tempSections, setTempSections] = useState<
    typeof document.sections | null
  >(null);

  const pageWidthOptions = useMemo(
    () => ["narrow", "medium", "wide"] as const,
    []
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

  const handleSectionClick = (sectionId: string, scrollToSection = false) => {
    // If we're editing a different section, don't allow switching without saving
    if (editingSectionId && editingSectionId !== sectionId) {
      return;
    }
    setSelectedSectionId(sectionId);

    // Only smooth-scroll when navigating from the left sidebar, not when clicking in the document
    if (scrollToSection) {
      const sanitizedId = CSS.escape(sectionId);
      const sectionElement = window.document.querySelector(
        `[data-section-id="${sanitizedId}"]`
      );
      if (sectionElement && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const sectionRect = (
          sectionElement as HTMLElement
        ).getBoundingClientRect();

        const offsetWithinContainer = sectionRect.top - containerRect.top;
        const desiredTopOffset = 16;
        const rawTargetScrollTop =
          container.scrollTop + offsetWithinContainer - desiredTopOffset;

        const maxScrollTop = container.scrollHeight - container.clientHeight;
        const clampedTargetScrollTop = Math.min(
          Math.max(rawTargetScrollTop, 0),
          Math.max(maxScrollTop, 0)
        );

        container.scrollTo({
          top: clampedTargetScrollTop,
          behavior: "smooth",
        });
      }
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

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      order: document.sections.length,
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    };

    setDocument((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setNewSectionTitle("");
    setNewSectionDialogOpen(false);
    setSelectedSectionId(newSection.id);
  };

  const handleResetDocument = useCallback(() => {
    const resetDocument = getSampleDocument();
    setDocument(resetDocument);
    setSelectedSectionId(resetDocument.sections[0]?.id || null);
    setEditingSectionId(null);
    setResetDialogOpen(false);
  }, []);

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      const updatedSections = document.sections
        .filter((s) => s.id !== sectionId)
        .map((s, index) => ({ ...s, order: index }));

      setDocument((prev) => ({
        ...prev,
        sections: updatedSections,
      }));

      if (selectedSectionId === sectionId) {
        setSelectedSectionId(updatedSections[0]?.id || null);
      }

      if (editingSectionId === sectionId) {
        setEditingSectionId(null);
      }
    },
    [document.sections, editingSectionId, selectedSectionId]
  );

  const handleAddSectionFromManage = useCallback(() => {
    if (!manageNewSectionTitle.trim()) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: manageNewSectionTitle.trim(),
      order: document.sections.length,
      content: JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    };

    setDocument((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setManageNewSectionTitle("");
    setSelectedSectionId(newSection.id);
  }, [document.sections.length, manageNewSectionTitle]);

  const handleDragStart = (e: React.DragEvent, sectionId: string): void => {
    setDraggedSectionId(sectionId);
    setTempSections(null);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Detect if cursor is in top or bottom half of the element
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const isTopHalf = mouseY < rect.height / 2;

    setDropPosition(isTopHalf ? "above" : "below");

    // Live reordering preview
    if (draggedSectionId) {
      const dragIndex = document.sections.findIndex(
        (s) => s.id === draggedSectionId
      );
      if (dragIndex === -1) return;

      let finalIndex = index;
      if (isTopHalf) {
        finalIndex = dragIndex < index ? index - 1 : index;
      } else {
        finalIndex = dragIndex < index ? index : index + 1;
      }

      // Only update if position actually changes
      if (finalIndex !== dragIndex) {
        const newSections = [...document.sections];
        const [draggedSection] = newSections.splice(dragIndex, 1);
        newSections.splice(finalIndex, 0, draggedSection);

        // Check if this is actually different from current tempSections
        const currentSections = tempSections || document.sections;
        const isDifferent = !currentSections.every(
          (s, i) => s.id === newSections[i]?.id
        );

        if (isDifferent) {
          setTempSections(newSections);
        }
      } else if (tempSections) {
        setTempSections(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    if (!draggedSectionId || !dropPosition || !tempSections) return;

    const dragIndex = document.sections.findIndex(
      (s) => s.id === draggedSectionId
    );
    if (dragIndex === -1) {
      setDraggedSectionId(null);
      setDropPosition(null);
      setTempSections(null);
      return;
    }

    const reorderedSections = tempSections.map((s, i) => ({
      ...s,
      order: i,
    }));

    setDocument((prev) => ({
      ...prev,
      sections: reorderedSections,
    }));

    setDraggedSectionId(null);
    setDropPosition(null);
    setTempSections(null);
  };

  const handleDragEnd = (): void => {
    setDraggedSectionId(null);
    setDropPosition(null);
    setTempSections(null);
  };

  const handleCreateFromTemplate = useCallback((template: Template) => {
    const timestamp = Date.now();
    const newSections: Section[] = template.sections.map((ts, index) => ({
      id: `section-${timestamp}-${index}`,
      title: ts.title,
      order: index,
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

    setSelectedSectionId(newSections[0]?.id || null);
    setTemplateDialogOpen(false);
  }, []);

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
        [editingTagKey]: tagValue,
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
        [newTagKey]: newTagValue,
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

  const renderContent = (
    content: string,
    tagValues: Record<string, string>
  ) => {
    try {
      const json = JSON.parse(content);
      return renderNode(json, tagValues);
    } catch {
      return null;
    }
  };

  const handleExportPDF = useCallback(async () => {
    if (!documentContainerRef.current) return;

    try {
      await exportToPDF(document, documentContainerRef.current);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to export PDF. Please try again."
      );
    }
  }, [document]);

  const renderNode = (
    node: TipTapNode,
    tagValues: Record<string, string>
  ): React.ReactNode => {
    if (!node) return null;

    if (node.type === "text") {
      let text = node.text || "";
      // Replace tag placeholders with actual values
      Object.entries(tagValues).forEach(([key, value]) => {
        // Escape special regex characters in the key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        text = text.replace(new RegExp(escapedKey, "g"), value);
      });

      const marks = node.marks || [];
      let element = <>{text}</>;

      marks.forEach((mark) => {
        if (mark.type === "bold") {
          element = <strong>{element}</strong>;
        } else if (mark.type === "italic") {
          element = <em>{element}</em>;
        } else if (mark.type === "strike") {
          element = <s>{element}</s>;
        } else if (mark.type === "link") {
          const href = mark.attrs?.href;
          if (href && typeof href === "string") {
            element = (
              <a
                href={href}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {element}
              </a>
            );
          }
        }
      });

      return element;
    }

    const children = node.content?.map((child, index: number) => (
      <Fragment key={index}>{renderNode(child, tagValues)}</Fragment>
    ));

    switch (node.type) {
      case "doc":
        return <div>{children}</div>;
      case "paragraph": {
        // Ensure empty paragraphs render as visible blank lines so that
        // manual line breaks created with the keyboard are preserved in
        // the preview (and match the PDF export behavior).
        const hasMeaningfulContent =
          Array.isArray(node.content) &&
          node.content.some((child) => {
            if (child.type === "text") {
              return (child.text || "").trim().length > 0;
            }
            // Treat non-text child nodes (e.g. mentions, inline nodes) as content
            // but ignore hardBreak-only paragraphs which should behave as blank lines.
            return child.type !== "hardBreak";
          });

        if (!hasMeaningfulContent) {
          // Render a non-empty paragraph so typography styles don't collapse it
          return <p className="mb-2">&nbsp;</p>;
        }

        return <p className="mb-2">{children}</p>;
      }
      case "heading": {
        const level = (node.attrs?.level as number) || 1;
        const className =
          level === 1
            ? "text-xl font-semibold mb-3"
            : level === 2
              ? "text-lg font-semibold mb-2"
              : "text-base font-semibold mb-2";

        if (level === 1) {
          return <h1 className={className}>{children}</h1>;
        } else if (level === 2) {
          return <h2 className={className}>{children}</h2>;
        } else {
          return <h3 className={className}>{children}</h3>;
        }
      }
      case "bulletList":
        return <ul className="list-disc list-outside pl-6 mb-2">{children}</ul>;
      case "orderedList":
        return (
          <ol className="list-decimal list-outside pl-6 mb-2">{children}</ol>
        );
      case "listItem":
        return <li>{children}</li>;
      case "hardBreak":
        return <br />;
      case "table":
        return (
          <table className="border-collapse border border-gray-300 mb-2 w-full">
            <tbody>{children}</tbody>
          </table>
        );
      case "tableRow":
        return <tr>{children}</tr>;
      case "tableHeader":
        return (
          <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold">
            {children}
          </th>
        );
      case "tableCell":
        return <td className="border border-gray-300 px-2 py-1">{children}</td>;
      case "mention": {
        // Render tag pill
        const tagKey = node.attrs?.id as string;
        const resolvedValue =
          tagValues[tagKey] || (node.attrs?.label as string) || tagKey;
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            {resolvedValue}
          </span>
        );
      }
      case "financialReportBlock": {
        // Render financial report block in read-only mode
        // Migration: handle old structure
        let leftColumns: FinancialReportColumn[] = [];
        let rightColumns: FinancialReportColumn[] = [];

        if (node.attrs?.leftColumns && node.attrs?.rightColumns) {
          leftColumns = node.attrs.leftColumns as FinancialReportColumn[];
          rightColumns = node.attrs.rightColumns as FinancialReportColumn[];
        } else {
          // Migrate from old structure
          const accountNumberColumn = (node.attrs?.accountNumberColumn as {
            label: string;
            align?: "left" | "right";
          }) || { label: "Account #", align: "left" };
          leftColumns = [
            {
              id: "account",
              label: accountNumberColumn.label,
              align: accountNumberColumn.align || "left",
            },
          ];
          rightColumns = (node.attrs?.columns as FinancialReportColumn[]) || [
            {
              id: "openingBalance",
              label: "Opening Balance",
              align: "right",
            },
            {
              id: "closingBalance",
              label: "Closing Balance",
              align: "right",
            },
          ];
        }

        const rows = (node.attrs?.rows as FinancialReportRow[]) || [];
        const showTotals = node.attrs?.showTotals as boolean;

        const calculateTotal = (colId: string) => {
          return rows.reduce((sum, row) => {
            const value = parseFloat(
              row.values[colId]?.replace(/[^\d.-]/g, "") || "0"
            );
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
        };

        const formatNumber = (num: number) => {
          return new Intl.NumberFormat("sv-SE", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(num);
        };

        const renderFormattedText = (value: string) => {
          if (!value) return "";

          const parts: ReactNode[] = [];
          const pattern =
            /(\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_|~~([^~]+)~~)/g;
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          // Simple markdown-like bold/italic/strike parsing for display
          // Supports **bold**, *italic*, __bold__, _italic_, ~~strike~~
          // Raw markers are preserved in storage; only rendering is formatted
          while ((match = pattern.exec(value)) !== null) {
            if (match.index > lastIndex) {
              parts.push(value.slice(lastIndex, match.index));
            }

            const token = match[0];
            const isBold = token.startsWith("**") || token.startsWith("__");
            const isStrike = token.startsWith("~~");
            const inner =
              isBold || isStrike ? token.slice(2, -2) : token.slice(1, -1);

            if (isStrike) {
              parts.push(
                <span key={parts.length} className="line-through">
                  {inner}
                </span>
              );
            } else {
              parts.push(
                isBold ? (
                  <strong key={parts.length}>{inner}</strong>
                ) : (
                  <em key={parts.length}>{inner}</em>
                )
              );
            }

            lastIndex = pattern.lastIndex;
          }

          if (lastIndex < value.length) {
            parts.push(value.slice(lastIndex));
          }

          return parts;
        };

        return (
          <div className="border rounded-lg overflow-hidden my-4">
            <div className="overflow-x-auto pr-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    {leftColumns.map((col) => (
                      <th
                        key={col.id}
                        className={cn(
                          "border-b px-3 py-2 text-sm font-semibold min-w-[180px]",
                          col.align === "left" ? "text-left" : "text-right"
                        )}
                      >
                        {col.label}
                      </th>
                    ))}
                    {rightColumns.map((col, rightIndex) => (
                      <th
                        key={col.id}
                        className={cn(
                          // Allow wrapping; increased header height is OK
                          "border-b py-2 text-sm font-semibold whitespace-normal wrap-break-word tabular-nums w-[1%] min-w-[10ch]",
                          "px-2",
                          rightIndex === 0 && "border-l border-border/60",
                          col.align === "left" ? "text-left" : "text-right"
                        )}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    // Migrate row data if needed
                    const rowValues = { ...row.values };
                    const legacyRow = row as LegacyFinancialReportRow;
                    if (legacyRow.accountNumber !== undefined) {
                      // Old structure - migrate
                      if (leftColumns.length > 0) {
                        rowValues[leftColumns[0].id] =
                          legacyRow.accountNumber ??
                          rowValues[leftColumns[0].id] ??
                          "";
                      }
                    }

                    return (
                      <tr key={row.id} className="hover:bg-accent/30">
                        {leftColumns.map((col) => (
                          <td
                            key={col.id}
                            className={cn(
                              "border-b px-3 py-2 text-sm",
                              col.align === "left" ? "text-left" : "text-right"
                            )}
                          >
                            {renderFormattedText(rowValues[col.id] || "")}
                          </td>
                        ))}
                        {rightColumns.map((col, rightIndex) => (
                          <td
                            key={col.id}
                            className={cn(
                              "border-b text-sm font-semibold tabular-nums",
                              "px-2 py-2",
                              rightIndex === 0 && "border-l border-border/60",
                              "whitespace-nowrap w-[1%] min-w-[10ch]",
                              col.align === "left" ? "text-left" : "text-right"
                            )}
                          >
                            {renderFormattedText(rowValues[col.id] || "")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {showTotals && rows.length > 0 && (
                    <tr className="bg-muted/30 font-semibold">
                      <td
                        className="border-t-2 px-3 py-2 text-sm"
                        colSpan={leftColumns.length}
                      >
                        Total
                      </td>
                      {rightColumns.map((col, rightIndex) => (
                        <td
                          key={col.id}
                          className={cn(
                            "border-t-2 text-sm font-semibold tabular-nums",
                            "px-2 py-2",
                            rightIndex === 0 && "border-l border-border/60",
                            "whitespace-nowrap w-[1%] min-w-[10ch]",
                            col.align === "left" ? "text-left" : "text-right"
                          )}
                        >
                          {formatNumber(calculateTotal(col.id))}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      case "pageBreak":
        return (
          <div className="page-break my-8 flex items-center justify-center">
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
            <span className="mx-4 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-muted-foreground/30">
              Page Break
            </span>
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <TooltipProvider>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6" />
              <Input
                value={document.title}
                onChange={(e) =>
                  setDocument((prev) => ({ ...prev, title: e.target.value }))
                }
                className="text-base font-semibold border-0 px-0 focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Document width
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDecreasePageWidth}
                      variant="outline"
                      size="icon"
                      aria-label="Decrease document width"
                      disabled={pageWidthIndex <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Decrease width</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleIncreasePageWidth}
                      variant="outline"
                      size="icon"
                      aria-label="Increase document width"
                      disabled={pageWidthIndex >= pageWidthOptions.length - 1}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Increase width</TooltipContent>
                </Tooltip>
              </div>
              <Separator orientation="vertical" className="mx-2 h-8" />
              <Tooltip>
                <DropdownMenu>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Change font style"
                      >
                        <Type className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Change font style</TooltipContent>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Font Style</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={fontFamily}
                      onValueChange={handleFontFamilyChange}
                    >
                      {fontFamilyOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Tooltip>
              <Separator orientation="vertical" className="mx-2 h-8" />
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setResetDialogOpen(true)}
                      variant="outline"
                      size="icon"
                      aria-label="Reset document"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset document</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleExportPDF}
                      variant="outline"
                      size="icon"
                      aria-label="Export PDF"
                    >
                      <ArrowUpFromLine className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export PDF</TooltipContent>
                </Tooltip>
              </div>
              <Separator orientation="vertical" className="mx-2 h-8" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsTagPanelOpen((prev) => !prev)}
                    variant={isTagPanelOpen ? "default" : "outline"}
                    size="icon"
                    aria-label={
                      isTagPanelOpen ? "Hide tag panel" : "Show tag panel"
                    }
                  >
                    <TagIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isTagPanelOpen ? "Hide tag panel" : "Show tag panel"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Main Content - Three Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - Section List */}
        <div className="w-64 border-r bg-background overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Sections</h2>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setNewSectionDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {document.sections.map((section) => (
                <div
                  key={section.id}
                  className={cn(
                    "group rounded-lg p-2 cursor-pointer transition-colors border text-foreground",
                    "hover:bg-accent/60 active:bg-accent/70",
                    selectedSectionId === section.id
                      ? "bg-primary/15 border-primary/40 text-foreground"
                      : "border-transparent hover:border-accent/50"
                  )}
                  onClick={() => handleSectionClick(section.id, true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSectionClick(section.id, true);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="block text-xs font-medium leading-tight text-foreground truncate">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setManageSectionsDialogOpen(true)}
              >
                Manage sections
              </Button>
            </div>
          </div>
        </div>

        {/* CENTER - Document Preview with Inline Editing */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-muted/80"
        >
          <div
            ref={documentContainerRef}
            className={cn(
              "mx-auto p-8 bg-background my-8 shadow-sm rounded-lg",
              pageWidth === "narrow" && "max-w-2xl",
              pageWidth === "medium" && "max-w-4xl",
              pageWidth === "wide" && "max-w-6xl"
            )}
          >
            <h1 className="text-3xl font-semibold mb-6">{document.title}</h1>
            {document.sections.map((section) => (
              <div
                key={section.id}
                data-section-id={section.id}
                className={cn(
                  "mb-8 p-4 rounded-lg transition-all",
                  editingSectionId === section.id
                    ? "ring-2 ring-primary bg-white"
                    : selectedSectionId === section.id
                      ? "ring-2 ring-primary/50 bg-accent/50 cursor-pointer"
                      : "hover:bg-accent/50 cursor-pointer"
                )}
                onClick={() => {
                  if (editingSectionId !== section.id) {
                    handleSectionClick(section.id);
                  }
                }}
                onDoubleClick={() => {
                  // If another section is being edited, close it first
                  if (editingSectionId && editingSectionId !== section.id) {
                    setEditingSectionId(null);
                  }
                  // Then start editing the clicked section
                  if (editingSectionId !== section.id) {
                    handleStartEditing(section.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !editingSectionId) {
                    handleStartEditing(section.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {editingSectionId === section.id ? (
                  <>
                    <InlineSectionEditor
                      content={section.content}
                      tags={tags}
                      title={section.title}
                      onSave={handleSaveInlineEdit}
                      onCancel={handleCancelInlineEdit}
                      className="mb-3"
                      fontFamily={fontFamily}
                    />
                  </>
                ) : (
                  <>
                    <h2
                      className={cn(
                        "text-lg font-semibold mb-3",
                        fontFamily === "serif" && "font-serif",
                        fontFamily === "mono" && "font-mono"
                      )}
                    >
                      {section.title}
                    </h2>
                  </>
                )}
                {editingSectionId === section.id ? null : (
                  <div
                    className={cn(
                      "prose prose-sm max-w-none",
                      fontFamily === "serif" && "prose-serif",
                      fontFamily === "mono" && "prose-mono"
                    )}
                  >
                    {renderContent(section.content, document.tagValues)}
                    {selectedSectionId === section.id && !editingSectionId && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Double-click to edit inline
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Tags Only */}
        {isTagPanelOpen && (
          <div className="w-80 border-l bg-background flex flex-col overflow-hidden">
            {/* Tag Library */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tag Library
                </Label>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setNewTagDialogOpen(true)}
                  title="Add new tag"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Type @ in the editor to insert a tag
              </p>
              <div className="space-y-2">
                {Object.entries(document.tagValues).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded bg-muted hover:bg-accent group"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleEditTag(key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleEditTag(key);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="text-xs font-mono font-semibold">
                        {key}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {value}
                      </div>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteTag(key)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      title="Delete tag"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {Object.keys(document.tagValues).length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setNewTagDialogOpen(true)}
                  className="w-full mt-3"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manage Sections Dialog */}
      <Dialog
        open={manageSectionsDialogOpen}
        onOpenChange={setManageSectionsDialogOpen}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage sections</DialogTitle>
            <DialogDescription>
              Add, remove, and change the order of sections.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="manage-section-title">New section title</Label>
                <Input
                  id="manage-section-title"
                  value={manageNewSectionTitle}
                  onChange={(e) => setManageNewSectionTitle(e.target.value)}
                  placeholder="Enter section title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSectionFromManage();
                    }
                  }}
                />
              </div>
              <Button onClick={handleAddSectionFromManage}>Add</Button>
            </div>

            <div className="flex flex-col gap-1">
              {(tempSections || document.sections).map(
                (section, sectionIndex) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragOver={(e) => handleDragOver(e, sectionIndex)}
                    onDrop={(e) => handleDrop(e)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 cursor-move",
                      "transition-all duration-200 ease-out",
                      draggedSectionId === section.id && "opacity-40 scale-95"
                    )}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {section.title}
                      </div>
                    </div>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        setPendingDeleteSection({
                          id: section.id,
                          title: section.title,
                        })
                      }
                      aria-label="Remove section"
                      title="Remove"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setManageSectionsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Section Dialog */}
      <Dialog
        open={newSectionDialogOpen}
        onOpenChange={setNewSectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Enter a title for the new section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Enter section title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSection();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
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
                onClick={() => handleCreateFromTemplate(template)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCreateFromTemplate(template);
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
                    Sections: {template.sections.map((s) => s.title).join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Document Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset document</DialogTitle>
            <DialogDescription>
              This will reset all content to the initial state. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetDocument}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Section Dialog */}
      <Dialog
        open={pendingDeleteSection !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteSection(null);
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
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDeleteSection(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDeleteSection) {
                  handleRemoveSection(pendingDeleteSection.id);
                }
                setPendingDeleteSection(null);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag Value</DialogTitle>
            <DialogDescription>
              Update the value for{" "}
              <code className="font-mono">{editingTagKey}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tag-value">Value</Label>
            <Input
              id="tag-value"
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              placeholder="Enter tag value"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTag();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTag}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Tag Dialog */}
      <Dialog open={newTagDialogOpen} onOpenChange={setNewTagDialogOpen}>
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
                onChange={(e) => setNewTagKey(e.target.value)}
                placeholder="e.g., CompanyName"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="new-tag-value">Value</Label>
              <Input
                id="new-tag-value"
                value={newTagValue}
                onChange={(e) => setNewTagValue(e.target.value)}
                placeholder="e.g., Acme AB"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddNewTag();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewTagDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewTag} disabled={!newTagKey.trim()}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
