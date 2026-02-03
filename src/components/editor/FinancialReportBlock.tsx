import {
  useState,
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { Plus, Trash2, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

import type {
  FinancialReportColumn,
  FinancialReportRow,
} from "@/types/document";

interface FinancialReportBlockAttrs {
  columns: FinancialReportColumn[];
  rows: FinancialReportRow[];
  showTotals: boolean;
}

const generateId = () => crypto.randomUUID();

const FinancialReportNodeView = ({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) => {
  const attrs = node.attrs as FinancialReportBlockAttrs;
  const { columns, rows, showTotals } = attrs;
  const [focusedCell, setFocusedCell] = useState<{
    rowIndex: number;
    colId: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editColumns, setEditColumns] = useState<FinancialReportColumn[]>(columns);
  const [editShowTotals, setEditShowTotals] = useState(showTotals);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleCellChange = useCallback(
    (rowIndex: number, field: "accountNumber" | "accountName" | string, value: string) => {
      const newRows = [...rows];
      if (field === "accountNumber" || field === "accountName") {
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
      } else {
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          values: { ...newRows[rowIndex].values, [field]: value },
        };
      }
      updateAttributes({ rows: newRows });
    },
    [rows, updateAttributes]
  );

  const handleAddRow = useCallback(() => {
    const newRow: FinancialReportRow = {
      id: generateId(),
      accountNumber: "",
      accountName: "",
      values: columns.reduce(
        (acc, col) => ({ ...acc, [col.id]: "" }),
        {} as Record<string, string>
      ),
    };
    updateAttributes({ rows: [...rows, newRow] });
  }, [columns, rows, updateAttributes]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const newRows = rows.filter((_, i) => i !== rowIndex);
      updateAttributes({ rows: newRows });
    },
    [rows, updateAttributes]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, colId: string) => {
      const allCols = ["accountNumber", "accountName", ...columns.map((c) => c.id)];
      const colIndex = allCols.indexOf(colId);

      const focusCell = (newRowIndex: number, newColId: string) => {
        const key = `${newRowIndex}-${newColId}`;
        const input = inputRefs.current.get(key);
        if (input) {
          input.focus();
          setFocusedCell({ rowIndex: newRowIndex, colId: newColId });
        }
      };

      if (e.key === "Tab") {
        e.preventDefault();
        const nextColIndex = e.shiftKey ? colIndex - 1 : colIndex + 1;
        
        if (nextColIndex >= 0 && nextColIndex < allCols.length) {
          focusCell(rowIndex, allCols[nextColIndex]);
        } else if (!e.shiftKey && nextColIndex >= allCols.length && rowIndex < rows.length - 1) {
          // Move to next row
          focusCell(rowIndex + 1, allCols[0]);
        } else if (e.shiftKey && nextColIndex < 0 && rowIndex > 0) {
          // Move to previous row
          focusCell(rowIndex - 1, allCols[allCols.length - 1]);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (rowIndex < rows.length - 1) {
          focusCell(rowIndex + 1, colId);
        } else {
          handleAddRow();
          // Focus new row after render
          setTimeout(() => {
            focusCell(rows.length, colId);
          }, 0);
        }
      } else if (e.key === "ArrowUp" && rowIndex > 0) {
        e.preventDefault();
        focusCell(rowIndex - 1, colId);
      } else if (e.key === "ArrowDown" && rowIndex < rows.length - 1) {
        e.preventDefault();
        focusCell(rowIndex + 1, colId);
      } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
        if (colIndex > 0) {
          e.preventDefault();
          focusCell(rowIndex, allCols[colIndex - 1]);
        }
      } else if (
        e.key === "ArrowRight" &&
        e.currentTarget.selectionStart === e.currentTarget.value.length
      ) {
        if (colIndex < allCols.length - 1) {
          e.preventDefault();
          focusCell(rowIndex, allCols[colIndex + 1]);
        }
      }
    },
    [columns, rows.length, handleAddRow]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, rowIndex: number, colId: string) => {
      const pasteData = e.clipboardData.getData("text");
      if (!pasteData.includes("\t") && !pasteData.includes("\n")) {
        return; // Let default paste handle single values
      }

      e.preventDefault();
      const lines = pasteData.split("\n").filter((line) => line.trim());
      const allCols = ["accountNumber", "accountName", ...columns.map((c) => c.id)];
      const startColIndex = allCols.indexOf(colId);

      const newRows = [...rows];

      lines.forEach((line, lineIndex) => {
        const cells = line.split("\t");
        const targetRowIndex = rowIndex + lineIndex;

        // Add new rows if necessary
        while (newRows.length <= targetRowIndex) {
          newRows.push({
            id: generateId(),
            accountNumber: "",
            accountName: "",
            values: columns.reduce(
              (acc, col) => ({ ...acc, [col.id]: "" }),
              {} as Record<string, string>
            ),
          });
        }

        cells.forEach((cell, cellIndex) => {
          const targetColIndex = startColIndex + cellIndex;
          if (targetColIndex < allCols.length) {
            const targetColId = allCols[targetColIndex];
            if (targetColId === "accountNumber" || targetColId === "accountName") {
              newRows[targetRowIndex] = {
                ...newRows[targetRowIndex],
                [targetColId]: cell.trim(),
              };
            } else {
              newRows[targetRowIndex] = {
                ...newRows[targetRowIndex],
                values: {
                  ...newRows[targetRowIndex].values,
                  [targetColId]: cell.trim(),
                },
              };
            }
          }
        });
      });

      updateAttributes({ rows: newRows });
    },
    [columns, rows, updateAttributes]
  );

  const calculateTotal = (colId: string) => {
    return rows.reduce((sum, row) => {
      const value = parseFloat(row.values[colId]?.replace(/[^\d.-]/g, "") || "0");
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleSaveSettings = useCallback(() => {
    // Update columns and sync row values
    const newRows = rows.map((row) => ({
      ...row,
      values: editColumns.reduce(
        (acc, col) => ({
          ...acc,
          [col.id]: row.values[col.id] || "",
        }),
        {} as Record<string, string>
      ),
    }));
    updateAttributes({
      columns: editColumns,
      rows: newRows,
      showTotals: editShowTotals,
    });
    setSettingsOpen(false);
  }, [editColumns, editShowTotals, rows, updateAttributes]);

  const handleAddColumn = useCallback(() => {
    setEditColumns([
      ...editColumns,
      { id: generateId(), label: `Column ${editColumns.length + 1}` },
    ]);
  }, [editColumns]);

  const handleRemoveColumn = useCallback(
    (colId: string) => {
      setEditColumns(editColumns.filter((c) => c.id !== colId));
    },
    [editColumns]
  );

  const handleColumnLabelChange = useCallback(
    (colId: string, label: string) => {
      setEditColumns(
        editColumns.map((c) => (c.id === colId ? { ...c, label } : c))
      );
    },
    [editColumns]
  );

  // Sync edit state when dialog opens
  // Using sync state update pattern with ref tracking
  const prevSettingsOpenRef = useRef(settingsOpen);
  // eslint-disable-next-line react-hooks/refs
  if (settingsOpen && !prevSettingsOpenRef.current) {
    // Dialog just opened, sync edit state
    if (editColumns !== columns || editShowTotals !== showTotals) {
      setEditColumns(columns);
      setEditShowTotals(showTotals);
    }
  }
  // eslint-disable-next-line react-hooks/refs
  prevSettingsOpenRef.current = settingsOpen;

  const setInputRef = useCallback(
    (rowIndex: number, colId: string) => (el: HTMLInputElement | null) => {
      const key = `${rowIndex}-${colId}`;
      if (el) {
        inputRefs.current.set(key, el);
      } else {
        inputRefs.current.delete(key);
      }
    },
    []
  );

  return (
    <NodeViewWrapper className="financial-report-block my-4">
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <span className="text-sm font-semibold">Financial Report</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
              type="button"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={deleteNode}
              className="text-destructive hover:text-destructive"
              title="Delete block"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border-b px-3 py-2 text-left text-sm font-semibold min-w-[100px]">
                  Account #
                </th>
                <th className="border-b px-3 py-2 text-left text-sm font-semibold min-w-[150px]">
                  Account Name
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="border-b px-3 py-2 text-right text-sm font-semibold min-w-[120px]"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="border-b px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-accent/30",
                    focusedCell?.rowIndex === rowIndex && "bg-accent/20"
                  )}
                >
                  <td className="border-b px-1 py-1">
                    <input
                      ref={setInputRef(rowIndex, "accountNumber")}
                      type="text"
                      value={row.accountNumber}
                      onChange={(e) =>
                        handleCellChange(rowIndex, "accountNumber", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, "accountNumber")}
                      onPaste={(e) => handlePaste(e, rowIndex, "accountNumber")}
                      onFocus={() =>
                        setFocusedCell({ rowIndex, colId: "accountNumber" })
                      }
                      className="w-full px-2 py-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded text-sm font-mono"
                      placeholder="####"
                    />
                  </td>
                  <td className="border-b px-1 py-1">
                    <input
                      ref={setInputRef(rowIndex, "accountName")}
                      type="text"
                      value={row.accountName}
                      onChange={(e) =>
                        handleCellChange(rowIndex, "accountName", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, "accountName")}
                      onPaste={(e) => handlePaste(e, rowIndex, "accountName")}
                      onFocus={() =>
                        setFocusedCell({ rowIndex, colId: "accountName" })
                      }
                      className="w-full px-2 py-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded text-sm"
                      placeholder="Account name"
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="border-b px-1 py-1">
                      <input
                        ref={setInputRef(rowIndex, col.id)}
                        type="text"
                        value={row.values[col.id] || ""}
                        onChange={(e) =>
                          handleCellChange(rowIndex, col.id, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, col.id)}
                        onPaste={(e) => handlePaste(e, rowIndex, col.id)}
                        onFocus={() => setFocusedCell({ rowIndex, colId: col.id })}
                        className="w-full px-2 py-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded text-sm text-right font-mono"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="border-b px-1 py-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      title="Delete row"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
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
                  <td className="border-t-2 px-2 py-2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="px-4 py-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddRow}
            className="text-muted-foreground"
            type="button"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Settings</DialogTitle>
            <DialogDescription>
              Configure the columns and display options for this financial report
              block.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Columns</Label>
              {editColumns.map((col, index) => (
                <div key={col.id} className="flex items-center gap-2">
                  <Input
                    value={col.label}
                    onChange={(e) =>
                      handleColumnLabelChange(col.id, e.target.value)
                    }
                    placeholder={`Column ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleRemoveColumn(col.id)}
                    disabled={editColumns.length <= 1}
                    className="text-destructive hover:text-destructive"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddColumn}
                className="w-full"
                type="button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showTotals"
                checked={editShowTotals}
                onChange={(e) => setEditShowTotals(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="showTotals">Show totals row</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  );
};

export const FinancialReportBlockExtension = Node.create({
  name: "financialReportBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      columns: {
        default: [
          { id: "openingBalance", label: "Opening Balance" },
          { id: "closingBalance", label: "Closing Balance" },
        ],
      },
      rows: {
        default: [],
      },
      showTotals: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="financial-report-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "financial-report-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FinancialReportNodeView);
  },
});

// Create a financial report block with custom configuration
export const createFinancialReportBlock = (
  columns: { label: string }[],
  showTotals = true
): FinancialReportBlockAttrs => {
  return {
    columns: columns.map((col, index) => ({
      id: generateId(),
      label: col.label || `Column ${index + 1}`,
    })),
    rows: [],
    showTotals,
  };
};
