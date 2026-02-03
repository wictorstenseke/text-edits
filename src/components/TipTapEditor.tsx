import { useEffect, useState } from "react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table/kit";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Undo,
  Redo,
  Table as TableIcon,
  Rows2,
  Columns2,
  Minus,
  Trash2,
  FileSpreadsheet,
  FileBreak,
} from "lucide-react";

import {
  createTagMentionExtension,
  FinancialReportBlockExtension,
  PageBreakExtension,
  type TagItem,
} from "@/components/editor";
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

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  tags?: TagItem[];
  className?: string;
}

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
    className={cn("h-8 w-8", active && "bg-accent text-accent-foreground")}
  >
    {children}
  </Button>
);

const TABLE_PRESETS: { rows: number; cols: number; label: string }[] = [
  { rows: 2, cols: 2, label: "2×2" },
  { rows: 3, cols: 3, label: "3×3" },
  { rows: 4, cols: 4, label: "4×4" },
  { rows: 5, cols: 5, label: "5×5" },
  { rows: 6, cols: 6, label: "6×6" },
];

const EditorMenuBar = ({
  editor,
  onInsertFinancialReport,
}: {
  editor: Editor | null;
  onInsertFinancialReport?: () => void;
}) => {
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeaderRow, setTableHeaderRow] = useState(true);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = (rows: number, cols: number, withHeaderRow: boolean) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
  };

  const handleInsertCustomTable = () => {
    const rows = Math.min(20, Math.max(1, tableRows));
    const cols = Math.min(20, Math.max(1, tableCols));
    insertTable(rows, cols, tableHeaderRow);
    setTableDialogOpen(false);
  };

  const insertFinancialReport = () => {
    if (onInsertFinancialReport) {
      onInsertFinancialReport();
    }
  };

  return (
    <div className="border-b bg-background p-2 flex flex-wrap gap-1 items-center">
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <UnderlineIcon className="h-4 w-4" />
      </MenuButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <MenuButton
        onClick={() =>
          editor.chain().focus().toggleList("bulletList", "listItem").run()
        }
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() =>
          editor.chain().focus().toggleList("orderedList", "listItem").run()
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

      <Separator orientation="vertical" className="h-6 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Insert Table"
            className="h-8 w-8"
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
          <DropdownMenuItem onSelect={() => setTableDialogOpen(true)}>
            Custom size…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Insert table</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="table-rows">Rows</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="table-cols">Columns</Label>
                <Input
                  id="table-cols"
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
                id="table-header"
                checked={tableHeaderRow}
                onChange={(e) => setTableHeaderRow(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="table-header" className="font-normal">
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

      <MenuButton
        onClick={insertFinancialReport}
        title="Insert Financial Report"
      >
        <FileSpreadsheet className="h-4 w-4" />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().insertPageBreak().run()}
        title="Insert Page Break"
      >
        <FileBreak className="h-4 w-4" />
      </MenuButton>

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
            <Rows2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row Below"
          >
            <Rows2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Delete Row"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Add Column Before"
          >
            <Columns2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column After"
          >
            <Columns2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Delete Column"
          >
            <Minus className="h-4 w-4" />
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
  );
};

export const TipTapEditor = ({
  content,
  onChange,
  tags = [],
  className,
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      Placeholder.configure({
        placeholder: "Start typing... (use @ to insert tags)",
      }),
      createTagMentionExtension(tags),
      FinancialReportBlockExtension,
      PageBreakExtension,
    ],
    content: content ? JSON.parse(content) : "",
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  const [, setSelectionTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const handler = () => setSelectionTick((t) => t + 1);
    editor.on("selectionUpdate", handler);
    return () => {
      editor.off("selectionUpdate", handler);
    };
  }, [editor]);

  const handleInsertFinancialReport = () => {
    if (editor) {
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
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden bg-background",
        className
      )}
    >
      <EditorMenuBar
        editor={editor}
        onInsertFinancialReport={handleInsertFinancialReport}
      />
      <EditorContent editor={editor} />
    </div>
  );
};
