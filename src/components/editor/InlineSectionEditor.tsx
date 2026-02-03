import { useEffect, useCallback, useMemo } from "react";

import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Check, X } from "lucide-react";

import {
  createTagMentionExtension,
  FinancialReportBlockExtension,
  type TagItem,
} from "@/components/editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineSectionEditorProps {
  content: string;
  tags: TagItem[];
  onSave: (content: string) => void;
  onCancel: () => void;
  className?: string;
}

export const InlineSectionEditor = ({
  content,
  tags,
  onSave,
  onCancel,
  className,
}: InlineSectionEditorProps) => {
  const tagMentionExtension = useMemo(
    () => createTagMentionExtension(tags),
    [tags]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start typing... (use @ to insert tags)",
      }),
      tagMentionExtension,
      FinancialReportBlockExtension,
    ],
    content: content ? JSON.parse(content) : "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[100px] p-2",
      },
    },
    autofocus: true,
  });

  const handleSave = useCallback(() => {
    if (editor) {
      onSave(JSON.stringify(editor.getJSON()));
    }
  }, [editor, onSave]);

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
    <div className={cn("relative", className)}>
      <EditorContent editor={editor} />
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleSave}
          title="Save (Ctrl+S)"
          className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onCancel}
          title="Cancel (Esc)"
          className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
