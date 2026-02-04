import { jsPDF } from "jspdf";

import type { Document } from "@/types/document";

/**
 * PDF Export Module
 *
 * This module exports documents to PDF using jsPDF with direct text rendering.
 * Unlike canvas-based approaches (e.g., html2canvas), this extracts text content
 * from the DOM and renders it programmatically, avoiding issues with:
 * - Modern CSS color functions (oklch, color-mix, etc.)
 * - DOM rendering quirks (fonts, CORS, flexbox/grid)
 * - Large document memory issues
 *
 * The approach walks the DOM tree, extracts text content, and renders it to PDF
 * with appropriate formatting (headings, lists, paragraphs, tables).
 */

/** A4 dimensions in mm */
const PDF_WIDTH = 210;
const PDF_HEIGHT = 297;
const PADDING = 15;
const CONTENT_WIDTH = PDF_WIDTH - 2 * PADDING;

/** Font sizes in points */
const FONT_SIZES = {
  h1: 18,
  h2: 15,
  h3: 13,
  body: 11,
  small: 9,
} as const;

/** Line height multiplier */
const LINE_HEIGHT = 1.4;

interface RenderContext {
  pdf: jsPDF;
  y: number;
  listDepth: number;
  listType: "bullet" | "ordered" | null;
  listItemIndex: number;
}

/**
 * Checks if we need a new page and adds one if necessary.
 * Returns the updated y position.
 */
const ensureSpace = (ctx: RenderContext, neededHeight: number): number => {
  const maxY = PDF_HEIGHT - PADDING;
  if (ctx.y + neededHeight > maxY) {
    ctx.pdf.addPage();
    return PADDING;
  }
  return ctx.y;
};

/**
 * Extracts plain text content from an HTML element, preserving structure.
 */
const getTextContent = (element: Node): string => {
  if (element.nodeType === Node.TEXT_NODE) {
    return element.textContent || "";
  }

  if (element.nodeType === Node.ELEMENT_NODE) {
    const el = element as HTMLElement;
    // Skip hidden elements
    if (el.style.display === "none" || el.hidden) {
      return "";
    }
    // Get text from children
    return Array.from(element.childNodes)
      .map((child) => getTextContent(child))
      .join("");
  }

  return "";
};

/**
 * Splits text into lines that fit within the content width.
 */
const wrapText = (
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  indent: number = 0
): string[] => {
  const effectiveWidth = maxWidth - indent;
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);

    if (testWidth > effectiveWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Renders a text block with word wrapping.
 */
const renderTextBlock = (
  ctx: RenderContext,
  text: string,
  fontSize: number,
  fontStyle: "normal" | "bold" | "italic" = "normal",
  indent: number = 0
): void => {
  const { pdf } = ctx;
  pdf.setFontSize(fontSize);
  pdf.setFont("helvetica", fontStyle);

  const lineHeightMm = (fontSize * LINE_HEIGHT * 0.352778); // pt to mm
  const lines = wrapText(pdf, text.trim(), CONTENT_WIDTH, indent);

  for (const line of lines) {
    ctx.y = ensureSpace(ctx, lineHeightMm);
    pdf.text(line, PADDING + indent, ctx.y);
    ctx.y += lineHeightMm;
  }
};

/**
 * Renders a table from a DOM table element.
 */
const renderTable = (ctx: RenderContext, tableElement: HTMLElement): void => {
  const { pdf } = ctx;
  const rows = tableElement.querySelectorAll("tr");
  if (rows.length === 0) return;

  pdf.setFontSize(FONT_SIZES.small);
  pdf.setFont("helvetica", "normal");

  const lineHeightMm = FONT_SIZES.small * LINE_HEIGHT * 0.352778;
  const cellPadding = 2;

  // Calculate column widths based on first row
  const firstRow = rows[0];
  const cells = firstRow.querySelectorAll("th, td");
  const numCols = cells.length;
  if (numCols === 0) return;

  const colWidth = CONTENT_WIDTH / numCols;

  // Render each row
  rows.forEach((row, rowIndex) => {
    ctx.y = ensureSpace(ctx, lineHeightMm + cellPadding * 2);

    const rowCells = row.querySelectorAll("th, td");
    const isHeader = row.querySelector("th") !== null;

    if (isHeader) {
      pdf.setFont("helvetica", "bold");
    } else {
      pdf.setFont("helvetica", "normal");
    }

    rowCells.forEach((cell, colIndex) => {
      const cellText = getTextContent(cell).trim();
      const x = PADDING + colIndex * colWidth + cellPadding;

      // Truncate text if too wide
      let displayText = cellText;
      const maxTextWidth = colWidth - cellPadding * 2;
      while (pdf.getTextWidth(displayText) > maxTextWidth && displayText.length > 3) {
        displayText = displayText.slice(0, -4) + "...";
      }

      pdf.text(displayText, x, ctx.y);

      // Draw cell border
      pdf.setDrawColor(200);
      pdf.rect(
        PADDING + colIndex * colWidth,
        ctx.y - lineHeightMm + cellPadding,
        colWidth,
        lineHeightMm + cellPadding
      );
    });

    // Draw bottom border for row
    if (rowIndex === 0 && isHeader) {
      pdf.setDrawColor(100);
      pdf.line(
        PADDING,
        ctx.y + cellPadding,
        PADDING + CONTENT_WIDTH,
        ctx.y + cellPadding
      );
    }

    ctx.y += lineHeightMm + cellPadding;
  });

  ctx.y += 4; // Space after table
};

/**
 * Processes a DOM element and renders it to PDF.
 */
const processElement = (ctx: RenderContext, element: HTMLElement): void => {
  const tagName = element.tagName.toLowerCase();

  // Handle page breaks
  if (element.classList.contains("page-break")) {
    ctx.pdf.addPage();
    ctx.y = PADDING;
    return;
  }

  // Skip hidden elements
  if (element.style.display === "none" || element.hidden) {
    return;
  }

  switch (tagName) {
    case "h1":
      ctx.y = ensureSpace(ctx, 12);
      ctx.y += 4; // Space before heading
      renderTextBlock(ctx, getTextContent(element), FONT_SIZES.h1, "bold");
      ctx.y += 2; // Space after heading
      break;

    case "h2":
      ctx.y = ensureSpace(ctx, 10);
      ctx.y += 3;
      renderTextBlock(ctx, getTextContent(element), FONT_SIZES.h2, "bold");
      ctx.y += 1.5;
      break;

    case "h3":
      ctx.y = ensureSpace(ctx, 8);
      ctx.y += 2;
      renderTextBlock(ctx, getTextContent(element), FONT_SIZES.h3, "bold");
      ctx.y += 1;
      break;

    case "p":
      renderTextBlock(ctx, getTextContent(element), FONT_SIZES.body);
      ctx.y += 2; // Paragraph spacing
      break;

    case "ul":
      ctx.listDepth++;
      ctx.listType = "bullet";
      ctx.listItemIndex = 0;
      processChildren(ctx, element);
      ctx.listDepth--;
      if (ctx.listDepth === 0) {
        ctx.listType = null;
        ctx.y += 2;
      }
      break;

    case "ol":
      ctx.listDepth++;
      ctx.listType = "ordered";
      ctx.listItemIndex = 0;
      processChildren(ctx, element);
      ctx.listDepth--;
      if (ctx.listDepth === 0) {
        ctx.listType = null;
        ctx.y += 2;
      }
      break;

    case "li": {
      ctx.listItemIndex++;
      const indent = ctx.listDepth * 5;
      const bullet = ctx.listType === "ordered" 
        ? `${ctx.listItemIndex}. `
        : "• ";
      const text = bullet + getTextContent(element).trim();
      renderTextBlock(ctx, text, FONT_SIZES.body, "normal", indent);
      break;
    }

    case "table":
      renderTable(ctx, element);
      break;

    case "strong":
    case "b":
      renderTextBlock(ctx, getTextContent(element), FONT_SIZES.body, "bold");
      break;

    case "em":
    case "i":
      renderTextBlock(ctx, getTextContent(element), FONT_SIZES.body, "italic");
      break;

    case "br":
      ctx.y += FONT_SIZES.body * LINE_HEIGHT * 0.352778;
      break;

    case "hr":
      ctx.y = ensureSpace(ctx, 5);
      ctx.pdf.setDrawColor(200);
      ctx.pdf.line(PADDING, ctx.y, PADDING + CONTENT_WIDTH, ctx.y);
      ctx.y += 5;
      break;

    case "div":
    case "section":
    case "article":
    case "main":
    case "span":
    case "a":
      // Container elements - process children
      processChildren(ctx, element);
      break;

    default: {
      // For unknown elements, try to render text content
      const text = getTextContent(element).trim();
      if (text) {
        renderTextBlock(ctx, text, FONT_SIZES.body);
      }
    }
  }
};

/**
 * Processes all child elements of a container.
 */
const processChildren = (ctx: RenderContext, parent: HTMLElement): void => {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      processElement(ctx, child as HTMLElement);
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) {
        renderTextBlock(ctx, text, FONT_SIZES.body);
      }
    }
  }
};

/**
 * Sanitizes a filename by replacing invalid characters.
 */
const sanitizeFilename = (title: string): string => {
  return title
    .replace(/[^a-z0-9\s-]/gi, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
};

/**
 * Exports a document to PDF.
 *
 * @param doc - The document metadata (used for filename)
 * @param documentElement - The DOM element containing the document content
 * @throws Error if not in a browser environment or if export fails
 */
export const exportToPDF = async (
  doc: Document,
  documentElement: HTMLElement
): Promise<void> => {
  try {
    if (typeof globalThis === "undefined" || !globalThis.document) {
      throw new Error("PDF export is only available in a browser environment.");
    }

    if (!documentElement) {
      throw new Error("No document content available to export.");
    }

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set default font
    pdf.setFont("helvetica", "normal");

    // Initialize render context
    const ctx: RenderContext = {
      pdf,
      y: PADDING,
      listDepth: 0,
      listType: null,
      listItemIndex: 0,
    };

    // Process the document content
    processChildren(ctx, documentElement);

    // Save the PDF
    const filename = `${sanitizeFilename(doc.title)}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};
