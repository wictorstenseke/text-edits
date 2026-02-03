import { Fragment, useState, useEffect, useCallback, useMemo } from "react";

import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Tag as TagIcon,
  PlusCircle,
} from "lucide-react";

import { InlineSectionEditor, type TagItem } from "@/components/editor";
import { TipTapEditor } from "@/components/TipTapEditor";
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
import {
  getSampleDocument,
  loadDocument,
  saveDocument,
  getSampleTemplates,
} from "@/lib/documentStorage";
import { cn } from "@/lib/utils";

import type {
  Document,
  Section,
  Template,
  FinancialReportColumn,
  FinancialReportRow,
} from "@/types/document";

interface TipTapNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
}

export const DocumentEditor = () => {
  const [document, setDocument] = useState<Document>(loadDocument());
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    document.sections[0]?.id || null
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templates] = useState<Template[]>(getSampleTemplates());
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState("");
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

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

  const selectedSection = document.sections.find(
    (s) => s.id === selectedSectionId
  );

  const handleSectionClick = (sectionId: string) => {
    // If we're editing a different section, don't allow switching without saving
    if (editingSectionId && editingSectionId !== sectionId) {
      return;
    }
    setSelectedSectionId(sectionId);
  };

  const handleStartEditing = (sectionId: string) => {
    setEditingSectionId(sectionId);
    setSelectedSectionId(sectionId);
  };

  const handleSaveInlineEdit = useCallback(
    (content: string) => {
      if (!editingSectionId) return;

      setDocument((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === editingSectionId ? { ...section, content } : section
        ),
      }));
      setEditingSectionId(null);
    },
    [editingSectionId]
  );

  const handleCancelInlineEdit = useCallback(() => {
    setEditingSectionId(null);
  }, []);

  const handleContentChange = (content: string) => {
    if (!selectedSectionId) return;

    setDocument((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === selectedSectionId ? { ...section, content } : section
      ),
    }));
  };

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

  const handleDeleteSection = (sectionId: string) => {
    setSectionToDelete(sectionId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;

    const updatedSections = document.sections
      .filter((s) => s.id !== sectionToDelete)
      .map((s, index) => ({ ...s, order: index }));

    setDocument((prev) => ({
      ...prev,
      sections: updatedSections,
    }));

    if (selectedSectionId === sectionToDelete) {
      setSelectedSectionId(updatedSections[0]?.id || null);
    }

    setDeleteDialogOpen(false);
    setSectionToDelete(null);
  };

  const handleReorderSection = (
    sectionId: string,
    direction: "up" | "down"
  ) => {
    const currentIndex = document.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= document.sections.length) return;

    const newSections = [...document.sections];
    [newSections[currentIndex], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[currentIndex],
    ];

    const reorderedSections = newSections.map((s, index) => ({
      ...s,
      order: index,
    }));

    setDocument((prev) => ({
      ...prev,
      sections: reorderedSections,
    }));
  };

  const handleRenameSection = (sectionId: string, newTitle: string) => {
    setDocument((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, title: newTitle } : s
      ),
    }));
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
      case "paragraph":
        return <p className="mb-2">{children}</p>;
      case "heading": {
        const level = (node.attrs?.level as number) || 1;
        const className =
          level === 1
            ? "text-2xl font-bold mb-3"
            : level === 2
              ? "text-xl font-bold mb-2"
              : "text-lg font-semibold mb-2";

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
        const columns = (node.attrs?.columns as FinancialReportColumn[]) || [];
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

        return (
          <div className="border rounded-lg overflow-hidden my-4">
            <div className="px-4 py-2 bg-muted border-b">
              <span className="text-sm font-semibold">Financial Report</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border-b px-3 py-2 text-left text-sm font-semibold">
                    Account #
                  </th>
                  <th className="border-b px-3 py-2 text-left text-sm font-semibold">
                    Account Name
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="border-b px-3 py-2 text-right text-sm font-semibold"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-accent/30">
                    <td className="border-b px-3 py-2 text-sm font-mono">
                      {row.accountNumber}
                    </td>
                    <td className="border-b px-3 py-2 text-sm">
                      {row.accountName}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className="border-b px-3 py-2 text-sm text-right font-mono"
                      >
                        {row.values[col.id] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
                {showTotals && rows.length > 0 && (
                  <tr className="bg-muted/30 font-semibold">
                    <td className="border-t-2 px-3 py-2 text-sm" colSpan={2}>
                      Total
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className="border-t-2 px-3 py-2 text-right text-sm font-mono"
                      >
                        {formatNumber(calculateTotal(col.id))}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      default:
        return children;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6" />
            <Input
              value={document.title}
              onChange={(e) =>
                setDocument((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-lg font-semibold border-0 px-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setResetDialogOpen(true)} variant="outline">
              Återställ
            </Button>
            <Button
              onClick={() => setTemplateDialogOpen(true)}
              variant="outline"
            >
              New from Template
            </Button>
          </div>
        </div>
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
              {document.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={cn(
                    "group rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors",
                    selectedSectionId === section.id && "bg-accent"
                  )}
                  onClick={() => handleSectionClick(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSectionClick(section.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        handleRenameSection(section.id, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="border-0 px-0 py-0 h-auto focus-visible:ring-0 font-medium"
                    />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderSection(section.id, "up");
                        }}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderSection(section.id, "down");
                        }}
                        disabled={index === document.sections.length - 1}
                        className="h-6 w-6"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER - Document Preview with Inline Editing */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <div className="max-w-4xl mx-auto p-8 bg-background my-8 shadow-sm rounded-lg">
            <h1 className="text-3xl font-bold mb-6">{document.title}</h1>
            {document.sections.map((section) => (
              <div
                key={section.id}
                className={cn(
                  "mb-8 p-4 rounded-lg transition-all",
                  editingSectionId === section.id
                    ? "ring-2 ring-primary bg-white"
                    : selectedSectionId === section.id
                      ? "ring-2 ring-primary/50 bg-accent/30 cursor-pointer"
                      : "hover:bg-accent/30 cursor-pointer"
                )}
                onClick={() => {
                  if (editingSectionId !== section.id) {
                    handleSectionClick(section.id);
                  }
                }}
                onDoubleClick={() => {
                  if (!editingSectionId) {
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
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-3">
                      {section.title}
                    </h2>
                  </>
                )}
                {editingSectionId === section.id ? null : (
                  <div className="prose prose-sm max-w-none">
                    {renderContent(section.content, document.tagValues)}
                    {selectedSectionId === section.id && !editingSectionId && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Double-click to edit inline, or use the panel on the
                        right
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - Editor */}
        <div className="w-96 border-l bg-background flex flex-col overflow-hidden">
          {selectedSection ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">Edit Section</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSection.title}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <TipTapEditor
                  key={selectedSectionId}
                  content={selectedSection.content}
                  onChange={handleContentChange}
                  tags={tags}
                />
              </div>

              {/* Tag Library */}
              <div className="border-t p-4">
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
                <p className="text-xs text-muted-foreground mb-2">
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a section to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSection}>
              Delete
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
            <DialogTitle>Återställ dokument</DialogTitle>
            <DialogDescription>
              Detta kommer återställa allt innehåll till startläget. Det går
              inte att ångra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleResetDocument}>
              Återställ
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
