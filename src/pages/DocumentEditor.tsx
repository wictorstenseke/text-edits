import { useState, useEffect, useCallback } from "react";

import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Tag as TagIcon,
} from "lucide-react";

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
  loadDocument,
  saveDocument,
  getSampleTemplates,
} from "@/lib/documentStorage";
import { cn } from "@/lib/utils";

import type { Document, Section, Template } from "@/types/document";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templates] = useState<Template[]>(getSampleTemplates());
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTagKey, setEditingTagKey] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState("");

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
    setSelectedSectionId(sectionId);
  };

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

  const handleReorderSection = (sectionId: string, direction: "up" | "down") => {
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

  const renderContent = (content: string, tagValues: Record<string, string>) => {
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
      <span key={index}>{renderNode(child, tagValues)}</span>
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
        return <ul className="list-disc list-inside mb-2">{children}</ul>;
      case "orderedList":
        return <ol className="list-decimal list-inside mb-2">{children}</ol>;
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
          <Button onClick={() => setTemplateDialogOpen(true)} variant="outline">
            New from Template
          </Button>
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

        {/* CENTER - Document Preview */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <div className="max-w-4xl mx-auto p-8 bg-background my-8 shadow-sm rounded-lg">
            <h1 className="text-3xl font-bold mb-6">{document.title}</h1>
            {document.sections.map((section) => (
              <div
                key={section.id}
                className={cn(
                  "mb-8 p-4 rounded-lg cursor-pointer transition-all",
                  selectedSectionId === section.id
                    ? "ring-2 ring-primary bg-accent/50"
                    : "hover:bg-accent/30"
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
                <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                <div className="prose prose-sm max-w-none">
                  {renderContent(section.content, document.tagValues)}
                </div>
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
                />
              </div>

              {/* Tag Library */}
              <div className="border-t p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Tag Library
                  </Label>
                </div>
                <div className="space-y-2">
                  {Object.entries(document.tagValues).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded bg-muted hover:bg-accent cursor-pointer"
                      onClick={() => handleEditTag(key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleEditTag(key);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex-1">
                        <div className="text-xs font-mono font-semibold">
                          {key}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {value}
                        </div>
                      </div>
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
              Are you sure you want to delete this section? This action cannot be
              undone.
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
                    Sections:{" "}
                    {template.sections.map((s) => s.title).join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
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
    </div>
  );
};
