import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { FinancialReportColumn, FinancialReportRow } from "@/types/document";

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

interface DocumentContentRendererProps {
  content: string;
  tagValues: Record<string, string>;
}

const renderNode = (
  node: TipTapNode,
  tagValues: Record<string, string>
): ReactNode => {
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

      const textAlign = node.attrs?.textAlign as string;
      const alignClass =
        textAlign === "center"
          ? "text-center"
          : textAlign === "right"
            ? "text-right"
            : "text-left";

      if (!hasMeaningfulContent) {
        // Render a non-empty paragraph so typography styles don't collapse it
        return <p className={cn("mb-2", alignClass)}>&nbsp;</p>;
      }

      return <p className={cn("mb-2", alignClass)}>{children}</p>;
    }
    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const textAlign = node.attrs?.textAlign as string;
      const alignClass =
        textAlign === "center"
          ? "text-center"
          : textAlign === "right"
            ? "text-right"
            : "text-left";

      const className = cn(
        level === 1
          ? "text-xl font-semibold mb-3"
          : level === 2
            ? "text-lg font-semibold mb-2"
            : "text-base font-semibold mb-2",
        alignClass
      );

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
      return <ol className="list-decimal list-outside pl-6 mb-2">{children}</ol>;
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
      // Render tag as plain text with resolved value (no pill styling)
      const tagKey = node.attrs?.id as string;
      const resolvedValue =
        tagValues[tagKey] || (node.attrs?.label as string) || tagKey;
      // Return plain text fragment - parent node styling (heading, bold, etc.) will apply
      return <>{resolvedValue}</>;
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
          const inner = isBold || isStrike ? token.slice(2, -2) : token.slice(1, -1);

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
                        legacyRow.accountNumber ?? rowValues[leftColumns[0].id] ?? "";
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
    case "image":
    case "imageResize":
    case "resizableImage": {
      const src = node.attrs?.src as string;
      const alt = node.attrs?.alt as string;
      const title = node.attrs?.title as string;
      const width = node.attrs?.width as number;
      const height = node.attrs?.height as number;
      const align = node.attrs?.align as string;

      if (!src) return null;

      return (
        <span
          className={cn(
            "block my-2",
            align === "center"
              ? "text-center"
              : align === "right"
                ? "text-right"
                : "text-left"
          )}
        >
          <img
            src={src}
            alt={alt || ""}
            title={title}
            width={width}
            height={height}
            className="max-w-full h-auto inline-block"
          />
        </span>
      );
    }
    default:
      return children;
  }
};

export const DocumentContentRenderer = ({
  content,
  tagValues,
}: DocumentContentRendererProps) => {
  let json: TipTapNode;
  try {
    json = JSON.parse(content) as TipTapNode;
  } catch {
    return null;
  }

  return <>{renderNode(json, tagValues)}</>;
};
