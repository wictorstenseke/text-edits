import type {
  FinancialReportColumn,
  FinancialReportRow,
} from "@/types/document";

/** Legacy row format had accountNumber at top level */
interface LegacyFinancialReportRow extends FinancialReportRow {
  accountNumber?: string;
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
}

interface FinancialReportAttrs {
  leftColumns?: FinancialReportColumn[];
  rightColumns?: FinancialReportColumn[];
  accountNumberColumn?: { label: string; align?: "left" | "right" };
  columns?: FinancialReportColumn[];
  rows?: Array<FinancialReportRow | LegacyFinancialReportRow>;
  showTotals?: boolean;
}

type MigratedAttrs = {
  leftColumns: FinancialReportColumn[];
  rightColumns: FinancialReportColumn[];
  rows: FinancialReportRow[];
  showTotals: boolean;
};

const migrateFinancialReportAttrs = (attrs: FinancialReportAttrs): MigratedAttrs => {
  const leftCols = attrs.leftColumns;
  const rightCols = attrs.rightColumns;

  const rawRows = attrs.rows ?? [];

  if (leftCols && rightCols) {
    // New structure – migrate any legacy rows (accountNumber -> values)
    const hasLegacyRows = rawRows.some(
      (row): row is LegacyFinancialReportRow =>
        "accountNumber" in row && row.accountNumber !== undefined
    );
    if (!hasLegacyRows)
      return {
        leftColumns: leftCols,
        rightColumns: rightCols,
        rows: rawRows as FinancialReportRow[],
        showTotals: attrs.showTotals ?? false,
      };

    const leftColId = leftCols[0]?.id ?? "account";
    const migratedRows: FinancialReportRow[] = rawRows.map((row) => {
      const legacy = row as LegacyFinancialReportRow;
      if (legacy.accountNumber === undefined) return row;

      const values = { ...row.values };
      values[leftColId] =
        legacy.accountNumber ?? values[leftColId] ?? "";
      return { id: row.id, values };
    });

    return {
      leftColumns: leftCols,
      rightColumns: rightCols,
      rows: migratedRows,
      showTotals: attrs.showTotals ?? false,
    };
  }

  // Old structure – full migration to leftColumns/rightColumns + values
  const accountNumberColumn = attrs.accountNumberColumn || {
    label: "Account #",
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
          { id: "openingBalance", label: "Opening Balance", align: "right" },
          { id: "closingBalance", label: "Closing Balance", align: "right" },
        ];

  const migratedRows: FinancialReportRow[] = rawRows.map((row) => {
    const legacy = row as LegacyFinancialReportRow;
    const values: Record<string, string> = {};

    values[leftColumns[0].id] =
      legacy.accountNumber ?? row.values[leftColumns[0].id] ?? "";
    rightColumns.forEach((col) => {
      values[col.id] = row.values[col.id] ?? "";
    });

    return { id: row.id, values };
  });

  return {
    leftColumns,
    rightColumns,
    rows: migratedRows,
    showTotals: attrs.showTotals ?? false,
  };
};


const migrateNode = (node: TipTapNode): TipTapNode => {
  if (node.type === "financialReportBlock" && node.attrs) {
    const attrs = node.attrs as unknown as FinancialReportAttrs;
    const migrated = migrateFinancialReportAttrs(attrs);
    return {
      ...node,
      attrs: migrated as Record<string, unknown>,
    };
  }

  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map(migrateNode),
    };
  }

  return node;
};

/**
 * One-time migration of Financial Report blocks from legacy format.
 * Converts accountNumber-at-row-level to values[leftColumnId].
 */
export const migrateFinancialReportContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content) as TipTapNode;
    if (!parsed || parsed.type !== "doc") return content;

    const migrated = migrateNode(parsed);
    return JSON.stringify(migrated);
  } catch {
    return content;
  }
};
