import {
  useState,
  useCallback,
  useRef,
  useEffect,
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
  leftColumns?: FinancialReportColumn[];
  rightColumns?: FinancialReportColumn[];
  // Legacy support
  accountNumberColumn?: { label: string; align?: "left" | "right" };
  accountNameColumn?: { label: string; align?: "left" | "right" };
  columns?: FinancialReportColumn[];
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

  // Migration logic: convert old structure to new structure
  const migrateAttrs = useCallback((attrs: FinancialReportBlockAttrs) => {
    // If new structure exists, use it
    if (attrs.leftColumns && attrs.rightColumns) {
      return {
        leftColumns: attrs.leftColumns,
        rightColumns: attrs.rightColumns,
        rows: attrs.rows.map((row) => {
          // Ensure all column values exist
          const allColIds = [
            ...attrs.leftColumns.map((c) => c.id),
            ...attrs.rightColumns.map((c) => c.id),
          ];
          const values = { ...row.values };
          allColIds.forEach((colId) => {
            if (!(colId in values)) {
              values[colId] = "";
            }
          });
          return { ...row, values };
        }),
        showTotals: attrs.showTotals,
      };
    }

    // Migrate from old structure
    const accountNumberColumn = attrs.accountNumberColumn || {
      label: "Account #",
      align: "left" as const,
    };
    const accountNameColumn = attrs.accountNameColumn || {
      label: "Account Name",
      align: "left" as const,
    };
    const oldColumns = attrs.columns || [];

    const leftColumns: FinancialReportColumn[] = [
      {
        id: "account",
        label: accountNumberColumn.label,
        align: accountNumberColumn.align || "left",
      },
    ];

    const rightColumns: FinancialReportColumn[] =
      oldColumns.length > 0
        ? oldColumns
        : [
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

    // Migrate row data
    const migratedRows = attrs.rows.map((row) => {
      const values: Record<string, string> = {};

      // Add left column values (from accountNumber)
      values[leftColumns[0].id] =
        (row as any).accountNumber || row.values[leftColumns[0].id] || "";

      // Add right column values
      rightColumns.forEach((col) => {
        values[col.id] = row.values[col.id] || "";
      });

      return {
        id: row.id,
        values,
      };
    });

    return {
      leftColumns,
      rightColumns,
      rows: migratedRows,
      showTotals: attrs.showTotals,
    };
  }, []);

  const migrated = migrateAttrs(attrs);
  const { leftColumns, rightColumns, rows, showTotals } = migrated;

  const [focusedCell, setFocusedCell] = useState<{
    rowIndex: number;
    colId: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editLeftColumns, setEditLeftColumns] =
    useState<FinancialReportColumn[]>(leftColumns);
  const [editRightColumns, setEditRightColumns] =
    useState<FinancialReportColumn[]>(rightColumns);
  const [editShowTotals, setEditShowTotals] = useState(showTotals);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleCellChange = useCallback(
    (rowIndex: number, colId: string, value: string) => {
      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        values: { ...newRows[rowIndex].values, [colId]: value },
      };
      updateAttributes({ rows: newRows });
    },
    [rows, updateAttributes]
  );

  const handleAddRow = useCallback(() => {
    const allColIds = [
      ...leftColumns.map((c) => c.id),
      ...rightColumns.map((c) => c.id),
    ];
    const newRow: FinancialReportRow = {
      id: generateId(),
      values: allColIds.reduce(
        (acc, colId) => ({ ...acc, [colId]: "" }),
        {} as Record<string, string>
      ),
    };
    updateAttributes({ rows: [...rows, newRow] });
  }, [leftColumns, rightColumns, rows, updateAttributes]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const newRows = rows.filter((_, i) => i !== rowIndex);
      updateAttributes({ rows: newRows });
    },
    [rows, updateAttributes]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, colId: string) => {
      const allCols = [
        ...leftColumns.map((c) => c.id),
        ...rightColumns.map((c) => c.id),
      ];
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
        } else if (
          !e.shiftKey &&
          nextColIndex >= allCols.length &&
          rowIndex < rows.length - 1
        ) {
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
      } else if (
        e.key === "ArrowLeft" &&
        e.currentTarget.selectionStart === 0
      ) {
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
    [leftColumns, rightColumns, rows.length, handleAddRow]
  );

  const applyFormattingToActiveCell = useCallback(
    (format: "bold" | "italic" | "strike") => {
      if (!focusedCell) return;

      const key = `${focusedCell.rowIndex}-${focusedCell.colId}`;
      const input = inputRefs.current.get(key);
      if (!input) return;

      const value = input.value ?? "";
      const selectionStart = input.selectionStart ?? 0;
      const selectionEnd = input.selectionEnd ?? selectionStart;

      const hasSelection = selectionEnd > selectionStart;
      const start = hasSelection ? selectionStart : 0;
      const end = hasSelection ? selectionEnd : value.length;

      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);

      if (!selected && !hasSelection) {
        return;
      }

      let wrapped: string;
      if (format === "bold") {
        wrapped = `**${selected || value}**`;
      } else if (format === "italic") {
        wrapped = `*${selected || value}*`;
      } else {
        wrapped = `~~${selected || value}~~`;
      }

      const newValue = hasSelection ? `${before}${wrapped}${after}` : wrapped;

      input.value = newValue;
      handleCellChange(focusedCell.rowIndex, focusedCell.colId, newValue);

      // Place caret just after the formatted text
      const newCaretPos = hasSelection
        ? before.length + wrapped.length
        : wrapped.length;
      input.setSelectionRange(newCaretPos, newCaretPos);
    },
    [focusedCell, handleCellChange]
  );

  useEffect(() => {
    const handler = (
      event: Event | CustomEvent<{ type: "bold" | "italic" | "strike" }>
    ) => {
      const custom = event as CustomEvent<{
        type: "bold" | "italic" | "strike";
      }>;
      if (!custom.detail?.type) return;
      applyFormattingToActiveCell(custom.detail.type);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("financial-report-toggle-format", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("financial-report-toggle-format", handler);
      }
    };
  }, [applyFormattingToActiveCell]);

  const handlePaste = useCallback(
    (
      e: React.ClipboardEvent<HTMLInputElement>,
      rowIndex: number,
      colId: string
    ) => {
      const pasteData = e.clipboardData.getData("text");
      if (!pasteData.includes("\t") && !pasteData.includes("\n")) {
        return; // Let default paste handle single values
      }

      e.preventDefault();
      const lines = pasteData.split("\n").filter((line) => line.trim());
      const allCols = [
        ...leftColumns.map((c) => c.id),
        ...rightColumns.map((c) => c.id),
      ];
      const startColIndex = allCols.indexOf(colId);

      const newRows = [...rows];

      lines.forEach((line, lineIndex) => {
        const cells = line.split("\t");
        const targetRowIndex = rowIndex + lineIndex;

        // Add new rows if necessary
        while (newRows.length <= targetRowIndex) {
          const allColIds = [
            ...leftColumns.map((c) => c.id),
            ...rightColumns.map((c) => c.id),
          ];
          newRows.push({
            id: generateId(),
            values: allColIds.reduce(
              (acc, colId) => ({ ...acc, [colId]: "" }),
              {} as Record<string, string>
            ),
          });
        }

        cells.forEach((cell, cellIndex) => {
          const targetColIndex = startColIndex + cellIndex;
          if (targetColIndex < allCols.length) {
            const targetColId = allCols[targetColIndex];
            newRows[targetRowIndex] = {
              ...newRows[targetRowIndex],
              values: {
                ...newRows[targetRowIndex].values,
                [targetColId]: cell.trim(),
              },
            };
          }
        });
      });

      updateAttributes({ rows: newRows });
    },
    [leftColumns, rightColumns, rows, updateAttributes]
  );

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

  const handleSaveSettings = useCallback(() => {
    // Update columns and sync row values
    const allColIds = [
      ...editLeftColumns.map((c) => c.id),
      ...editRightColumns.map((c) => c.id),
    ];
    const newRows = rows.map((row) => ({
      ...row,
      values: allColIds.reduce(
        (acc, colId) => ({
          ...acc,
          [colId]: row.values[colId] || "",
        }),
        {} as Record<string, string>
      ),
    }));
    updateAttributes({
      leftColumns: editLeftColumns,
      rightColumns: editRightColumns,
      rows: newRows,
      showTotals: editShowTotals,
    });
    setSettingsOpen(false);
  }, [
    editLeftColumns,
    editRightColumns,
    editShowTotals,
    rows,
    updateAttributes,
  ]);

  const handleAddLeftColumn = useCallback(() => {
    setEditLeftColumns([
      ...editLeftColumns,
      {
        id: generateId(),
        label: `Left Column ${editLeftColumns.length + 1}`,
        align: "left",
      },
    ]);
  }, [editLeftColumns]);

  const handleRemoveLeftColumn = useCallback(
    (colId: string) => {
      setEditLeftColumns(editLeftColumns.filter((c) => c.id !== colId));
    },
    [editLeftColumns]
  );

  const handleAddRightColumn = useCallback(() => {
    setEditRightColumns([
      ...editRightColumns,
      {
        id: generateId(),
        label: `Right Column ${editRightColumns.length + 1}`,
        align: "right",
      },
    ]);
  }, [editRightColumns]);

  const handleRemoveRightColumn = useCallback(
    (colId: string) => {
      setEditRightColumns(editRightColumns.filter((c) => c.id !== colId));
    },
    [editRightColumns]
  );

  const handleLeftColumnLabelChange = useCallback(
    (colId: string, label: string) => {
      setEditLeftColumns(
        editLeftColumns.map((c) => (c.id === colId ? { ...c, label } : c))
      );
    },
    [editLeftColumns]
  );

  const handleLeftColumnAlignChange = useCallback(
    (colId: string, align: "left" | "right") => {
      setEditLeftColumns(
        editLeftColumns.map((c) => (c.id === colId ? { ...c, align } : c))
      );
    },
    [editLeftColumns]
  );

  const handleRightColumnLabelChange = useCallback(
    (colId: string, label: string) => {
      setEditRightColumns(
        editRightColumns.map((c) => (c.id === colId ? { ...c, label } : c))
      );
    },
    [editRightColumns]
  );

  const handleRightColumnAlignChange = useCallback(
    (colId: string, align: "left" | "right") => {
      setEditRightColumns(
        editRightColumns.map((c) => (c.id === colId ? { ...c, align } : c))
      );
    },
    [editRightColumns]
  );

  const columnAlignClass = (align: "left" | "right" | undefined) =>
    align === "left" ? "text-left" : "text-right";

  // Sync edit state when dialog opens
  // Using sync state update pattern with ref tracking
  const prevSettingsOpenRef = useRef(settingsOpen);
  // eslint-disable-next-line react-hooks/refs
  if (settingsOpen && !prevSettingsOpenRef.current) {
    // Dialog just opened, sync edit state
    if (
      editLeftColumns !== leftColumns ||
      editRightColumns !== rightColumns ||
      editShowTotals !== showTotals
    ) {
      setEditLeftColumns(leftColumns);
      setEditRightColumns(rightColumns);
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
        <div className="overflow-x-auto pr-2">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              {leftColumns.map((col) => (
                <col key={col.id} />
              ))}
              {rightColumns.map((col) => (
                <col key={col.id} className="w-[12ch]" />
              ))}
              <col className="w-10" />
            </colgroup>
            <thead>
              <tr className="bg-muted/50">
                {leftColumns.map((col) => (
                  <th
                    key={col.id}
                    className={cn(
                      "border-b px-3 py-2 text-sm font-semibold min-w-[180px]",
                      columnAlignClass(col.align)
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
                      "border-b py-2 text-sm font-semibold whitespace-normal wrap-break-word tabular-nums",
                      "px-2",
                      rightIndex === 0 && "border-l border-border/60",
                      columnAlignClass(col.align)
                    )}
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
                  {leftColumns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "border-b px-1 py-1",
                        columnAlignClass(col.align)
                      )}
                    >
                      <input
                        ref={setInputRef(rowIndex, col.id)}
                        type="text"
                        value={row.values[col.id] || ""}
                        onChange={(e) =>
                          handleCellChange(rowIndex, col.id, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, col.id)}
                        onPaste={(e) => handlePaste(e, rowIndex, col.id)}
                        onFocus={() =>
                          setFocusedCell({ rowIndex, colId: col.id })
                        }
                        className={cn(
                          "w-full px-2 py-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded text-sm",
                          columnAlignClass(col.align)
                        )}
                        placeholder=""
                      />
                    </td>
                  ))}
                  {rightColumns.map((col, rightIndex) => (
                    <td
                      key={col.id}
                      className={cn(
                        "border-b py-1 whitespace-nowrap",
                        "px-2",
                        rightIndex === 0 && "border-l border-border/60",
                        columnAlignClass(col.align)
                      )}
                    >
                      <input
                        ref={setInputRef(rowIndex, col.id)}
                        type="text"
                        value={row.values[col.id] || ""}
                        onChange={(e) =>
                          handleCellChange(rowIndex, col.id, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, col.id)}
                        onPaste={(e) => handlePaste(e, rowIndex, col.id)}
                        onFocus={() =>
                          setFocusedCell({ rowIndex, colId: col.id })
                        }
                        className={cn(
                          // Column width comes from colgroup; keep input comfortable
                          "w-full min-w-0 px-1 py-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded text-sm font-semibold tabular-nums",
                          columnAlignClass(col.align)
                        )}
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
                        "whitespace-nowrap",
                        columnAlignClass(col.align)
                      )}
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
              Configure the columns and display options for this financial
              report block.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Left Columns</Label>
              <p className="text-xs text-muted-foreground">
                Set label and alignment (left or right) for each left column.
              </p>
              {editLeftColumns.map((col, index) => (
                <div
                  key={col.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2"
                >
                  <Input
                    value={col.label}
                    onChange={(e) =>
                      handleLeftColumnLabelChange(col.id, e.target.value)
                    }
                    placeholder={`Left Column ${index + 1}`}
                    className="flex-1 min-w-[120px]"
                  />
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor={`align-left-${col.id}`}
                      className="text-xs whitespace-nowrap"
                    >
                      Align:
                    </Label>
                    <select
                      id={`align-left-${col.id}`}
                      value={col.align ?? "left"}
                      onChange={(e) =>
                        handleLeftColumnAlignChange(
                          col.id,
                          e.target.value as "left" | "right"
                        )
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleRemoveLeftColumn(col.id)}
                    disabled={editLeftColumns.length <= 1}
                    className="text-destructive hover:text-destructive shrink-0"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddLeftColumn}
                className="w-full"
                type="button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Left Column
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Right Columns</Label>
              <p className="text-xs text-muted-foreground">
                Set label and alignment (left or right) for each right column.
              </p>
              {editRightColumns.map((col, index) => (
                <div
                  key={col.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2"
                >
                  <Input
                    value={col.label}
                    onChange={(e) =>
                      handleRightColumnLabelChange(col.id, e.target.value)
                    }
                    placeholder={`Right Column ${index + 1}`}
                    className="flex-1 min-w-[120px]"
                  />
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor={`align-right-${col.id}`}
                      className="text-xs whitespace-nowrap"
                    >
                      Align:
                    </Label>
                    <select
                      id={`align-right-${col.id}`}
                      value={col.align ?? "right"}
                      onChange={(e) =>
                        handleRightColumnAlignChange(
                          col.id,
                          e.target.value as "left" | "right"
                        )
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleRemoveRightColumn(col.id)}
                    disabled={editRightColumns.length <= 1}
                    className="text-destructive hover:text-destructive shrink-0"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddRightColumn}
                className="w-full"
                type="button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Right Column
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
      leftColumns: {
        default: [
          {
            id: "account",
            label: "Account",
            align: "left" as const,
          },
        ],
      },
      rightColumns: {
        default: [
          {
            id: "openingBalance",
            label: "Opening Balance",
            align: "right" as const,
          },
          {
            id: "closingBalance",
            label: "Closing Balance",
            align: "right" as const,
          },
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
      mergeAttributes(HTMLAttributes, {
        "data-type": "financial-report-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FinancialReportNodeView);
  },
});

// Create a financial report block with custom configuration
export const createFinancialReportBlock = (
  leftColumns: { label: string; align?: "left" | "right" }[],
  rightColumns: { label: string; align?: "left" | "right" }[],
  showTotals = true
): FinancialReportBlockAttrs => {
  return {
    leftColumns: leftColumns.map((col, index) => ({
      id: generateId(),
      label: col.label || `Left Column ${index + 1}`,
      align: col.align ?? "left",
    })),
    rightColumns: rightColumns.map((col, index) => ({
      id: generateId(),
      label: col.label || `Right Column ${index + 1}`,
      align: col.align ?? "right",
    })),
    rows: [],
    showTotals,
  };
};
