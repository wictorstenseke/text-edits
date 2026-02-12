import { useEffect, useCallback, useMemo, useState } from "react";

import { Placeholder } from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table/kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Table as TableIcon,
  ArrowUpFromLine,
  ArrowDownFromLine,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  CircleMinus,
  Trash2,
  FileSpreadsheet,
  SeparatorHorizontal,
  Undo,
  Redo,
  Check,
  X,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "tiptap-extension-resizable-image/styles.css";

import {
  createTagMentionExtension,
  createTagHighlightExtension,
  FinancialReportBlockExtension,
  PageBreakExtension,
  type TagItem,
} from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ImageResizeWithAlign } from "./ImageResizeWithAlign";

interface InlineSectionEditorProps {
  content: string;
  tags: TagItem[];
  title: string;
  onSave: (content: string, title?: string) => void;
  onCancel: () => void;
  className?: string;
  fontFamily?: "sans" | "serif" | "mono";
}

const TABLE_PRESETS: { rows: number; cols: number; label: string }[] = [
  { rows: 2, cols: 2, label: "2×2" },
  { rows: 3, cols: 3, label: "3×3" },
  { rows: 4, cols: 4, label: "4×4" },
  { rows: 5, cols: 5, label: "5×5" },
  { rows: 6, cols: 6, label: "6×6" },
];

const TEST_IMAGE_URL =
  "https://www.freepnglogos.com/uploads/logo-3d-png/3d-company-logos-design-logo-online-2.png";

const MenuButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant={active ? "default" : "ghost"}
    size="icon-sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn("h-7 w-7", active && "bg-accent text-accent-foreground")}
  >
    {children}
  </Button>
);

export const InlineSectionEditor = ({
  content,
  tags,
  title,
  onSave,
  onCancel,
  className,
  fontFamily = "sans",
}: InlineSectionEditorProps) => {
  const { t } = useTranslation();
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeaderRow, setTableHeaderRow] = useState(true);
  const [editableTitle, setEditableTitle] = useState(title);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(TEST_IMAGE_URL);
  const [imageAlt, setImageAlt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const tagMentionExtension = useMemo(
    () => createTagMentionExtension(tags),
    [tags]
  );

  const tagHighlightExtension = useMemo(
    () => createTagHighlightExtension(tags),
    [tags]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      ImageResizeWithAlign,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Placeholder.configure({
        placeholder: "Start typing... (use / to insert tags)",
      }),
      tagMentionExtension,
      tagHighlightExtension,
      FinancialReportBlockExtension,
      PageBreakExtension,
    ],
    content: content ? JSON.parse(content) : "",
    editorProps: {
      attributes: {
        class: cn(
          "tiptap prose prose-sm max-w-none focus:outline-none min-h-[100px] p-2",
          fontFamily === "serif" && "prose-serif",
          fontFamily === "mono" && "prose-mono"
        ),
      },
    },
    autofocus: true,
  });

  const [, setSelectionTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const selectionHandler = () => setSelectionTick((tick) => tick + 1);
    const transactionHandler = () => setSelectionTick((tick) => tick + 1);

    editor.on("selectionUpdate", selectionHandler);
    editor.on("transaction", transactionHandler);

    return () => {
      editor.off("selectionUpdate", selectionHandler);
      editor.off("transaction", transactionHandler);
    };
  }, [editor]);

  const addLink = () => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = (rows: number, cols: number, withHeaderRow: boolean) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
  };

  const handleInsertCustomTable = () => {
    const rows = Math.min(20, Math.max(1, tableRows));
    const cols = Math.min(20, Math.max(1, tableCols));
    insertTable(rows, cols, tableHeaderRow);
    setTableDialogOpen(false);
  };

  const insertFinancialReport = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "financialReportBlock",
        attrs: {
          columns: [
            { id: crypto.randomUUID(), label: "Opening Balance" },
            { id: crypto.randomUUID(), label: "Closing Balance" },
          ],
          rows: [],
          showTotals: true,
        },
      })
      .run();
  };

  const handleInsertImage = () => {
    if (!editor) return;

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          editor
            .chain()
            .focus()
            .setResizableImage({
              src: dataUrl,
              alt: imageAlt,
              "data-keep-ratio": true,
            })
            .run();
          setImageDialogOpen(false);
          setImageUrl("");
          setImageAlt("");
          setImageFile(null);
        }
      };
      reader.readAsDataURL(imageFile);
    } else if (imageUrl.trim()) {
      editor
        .chain()
        .focus()
        .setResizableImage({
          src: imageUrl,
          alt: imageAlt,
          "data-keep-ratio": true,
        })
        .run();
      setImageDialogOpen(false);
      setImageUrl("");
      setImageAlt("");
      setImageFile(null);
    }
  };

  const handleSave = useCallback(() => {
    if (editor) {
      onSave(JSON.stringify(editor.getJSON()), editableTitle);
    }
  }, [editor, onSave, editableTitle]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [onCancel, handleSave]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={cn("bg-white", className)}>
      {editor && (
        <div className="border bg-white px-2 py-1 rounded-md mb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {!editor.isActive("resizableImage") && (
                <>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    active={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    active={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    active={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                  >
                    <Heading3 className="h-4 w-4" />
                  </MenuButton>

                  <Separator orientation="vertical" className="h-6 mx-1" />
                </>
              )}

              {!editor.isActive("resizableImage") && (
                <>
                  <MenuButton
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("financial-report-toggle-format", {
                            detail: { type: "bold" },
                          })
                        );
                      }
                      editor.chain().focus().toggleBold().run();
                    }}
                    active={editor.isActive("bold")}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("financial-report-toggle-format", {
                            detail: { type: "italic" },
                          })
                        );
                      }
                      editor.chain().focus().toggleItalic().run();
                    }}
                    active={editor.isActive("italic")}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("financial-report-toggle-format", {
                            detail: { type: "strike" },
                          })
                        );
                      }
                      editor.chain().focus().toggleStrike().run();
                    }}
                    active={editor.isActive("strike")}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </MenuButton>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    active={editor.isActive({ textAlign: "left" })}
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    active={editor.isActive({ textAlign: "center" })}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    active={editor.isActive({ textAlign: "right" })}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </MenuButton>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  <MenuButton
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleList("bulletList", "listItem")
                        .run()
                    }
                    active={editor.isActive("bulletList")}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleList("orderedList", "listItem")
                        .run()
                    }
                    active={editor.isActive("orderedList")}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </MenuButton>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  <MenuButton
                    onClick={addLink}
                    active={editor.isActive("link")}
                    title="Add Link"
                  >
                    <Link2 className="h-4 w-4" />
                  </MenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="Insert Table"
                        className="h-7 w-7"
                      >
                        <TableIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {TABLE_PRESETS.map(({ rows, cols, label }) => (
                        <DropdownMenuItem
                          key={label}
                          onSelect={() => insertTable(rows, cols, true)}
                        >
                          {label} table
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onSelect={() => setTableDialogOpen(true)}
                      >
                        Custom size…
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <MenuButton
                    onClick={insertFinancialReport}
                    title="Insert Financial Report"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().insertPageBreak().run()
                    }
                    title="Insert Page Break"
                  >
                    <SeparatorHorizontal className="h-4 w-4" />
                  </MenuButton>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  <MenuButton
                    onClick={() => setImageDialogOpen(true)}
                    title="Insert Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </MenuButton>
                </>
              )}

              {editor.isActive("resizableImage") && (
                <>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().setImageAlign("left").run()
                    }
                    active={
                      editor.getAttributes("resizableImage").align === "left"
                    }
                    title="Align Image Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().setImageAlign("center").run()
                    }
                    active={
                      editor.getAttributes("resizableImage").align === "center"
                    }
                    title="Align Image Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().setImageAlign("right").run()
                    }
                    active={
                      editor.getAttributes("resizableImage").align === "right"
                    }
                    title="Align Image Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </MenuButton>
                </>
              )}

              <Separator orientation="vertical" className="h-6 mx-1" />

              <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </MenuButton>

              {editor.isActive("table") && (
                <>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <MenuButton
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    title="Add Row Above"
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    title="Add Row Below"
                  >
                    <ArrowDownFromLine className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    title="Delete Row"
                  >
                    <CircleMinus className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().addColumnBefore().run()
                    }
                    title="Add Column Before"
                  >
                    <ArrowLeftFromLine className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() =>
                      editor.chain().focus().addColumnAfter().run()
                    }
                    title="Add Column After"
                  >
                    <ArrowRightFromLine className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    title="Delete Column"
                  >
                    <CircleMinus className="h-4 w-4" />
                  </MenuButton>
                  <MenuButton
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    title="Delete Table"
                  >
                    <Trash2 className="h-4 w-4" />
                  </MenuButton>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MenuButton onClick={handleSave} title={t("editor.save")}>
                <Check className="h-4 w-4" />
              </MenuButton>
              <MenuButton onClick={onCancel} title={t("editor.cancel")}>
                <X className="h-4 w-4" />
              </MenuButton>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4">
        <Input
          id="inline-section-title"
          value={editableTitle}
          onChange={(e) => setEditableTitle(e.target.value)}
          className={cn(
            "h-11 text-2xl font-semibold border-ring shadow-sm focus-visible:ring-ring focus-visible:ring-2",
            fontFamily === "serif" && "font-serif",
            fontFamily === "mono" && "font-mono"
          )}
          placeholder={t("editor.sectionTitle")}
          aria-label={t("editor.sectionTitle")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Format tools do not affect this title; standard styling is always
          applied.
        </p>
      </div>
      <EditorContent editor={editor} />
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Insert table</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="inline-table-rows">Rows</Label>
                <Input
                  id="inline-table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inline-table-cols">Columns</Label>
                <Input
                  id="inline-table-cols"
                  type="number"
                  min={1}
                  max={20}
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inline-table-header"
                checked={tableHeaderRow}
                onChange={(e) => setTableHeaderRow(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="inline-table-header" className="font-normal">
                Header row
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleInsertCustomTable}>
              Insert table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="inline-image-url">Image URL</Label>
              <Input
                id="inline-image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={!!imageFile}
              />
            </div>
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inline-image-file">Upload file</Label>
              <Input
                id="inline-image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                disabled={!!imageUrl.trim()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inline-image-alt">Alt text (optional)</Label>
              <Input
                id="inline-image-alt"
                type="text"
                placeholder="Description of the image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImageDialogOpen(false);
                setImageUrl(TEST_IMAGE_URL);
                setImageAlt("");
                setImageFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsertImage}
              disabled={!imageUrl.trim() && !imageFile}
            >
              Insert image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="sr-only">
        <Button onClick={handleSave} title={t("editor.save")}>
          {t("editor.save")}
        </Button>
        <Button onClick={onCancel} title={t("editor.cancel")}>
          {t("editor.cancel")}
        </Button>
      </div>
    </div>
  );
};
