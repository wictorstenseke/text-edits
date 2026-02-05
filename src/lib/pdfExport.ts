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

/** PDF page height in mm */
const PDF_HEIGHT = 297;

/** Page width configurations in mm (converted from px at 96dpi) */
type PageWidthOption = "narrow" | "medium" | "wide";
const PAGE_WIDTH_CONFIG: Record<PageWidthOption, { width: number; padding: number }> = {
  narrow: { width: 210, padding: 15 }, // A4 portrait, 178mm content
  medium: { width: 260, padding: 12 }, // ~237mm content
  wide: { width: 330, padding: 12 },   // ~305mm content
};

/** Font family mapping from document to jsPDF */
type FontFamilyOption = "sans" | "serif" | "mono";
const FONT_FAMILY_MAP: Record<FontFamilyOption, string> = {
  sans: "helvetica",
  serif: "times",
  mono: "courier",
};

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

/** Default image dimensions in pixels when not specified */
const DEFAULT_IMAGE_WIDTH_PX = 200;
const DEFAULT_IMAGE_HEIGHT_PX = 150;

/** PDF export options */
export interface PDFExportOptions {
  pageWidth?: PageWidthOption;
  fontFamily?: FontFamilyOption;
}

interface RenderContext {
  pdf: jsPDF;
  y: number;
  pdfWidth: number;
  contentWidth: number;
  padding: number;
  fontFamily: string;
}

/**
 * Checks if we need a new page and adds one if necessary.
 * Returns the updated y position.
 */
const ensureSpace = (ctx: RenderContext, neededHeight: number): number => {
  const maxY = PDF_HEIGHT - ctx.padding;
  if (ctx.y + neededHeight > maxY) {
    ctx.pdf.addPage();
    return ctx.padding;
  }
  return ctx.y;
};

/**
 * Extracts plain text content from an HTML element, preserving whitespace appropriately.
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
    // Get text from children, adding space between inline elements
    return Array.from(element.childNodes)
      .map((child) => getTextContent(child))
      .join("");
  }

  return "";
};

/**
 * Splits paragraph content into lines based on <br> elements.
 * Returns an array of strings, including empty strings for consecutive <br> tags.
 */
const getParagraphLines = (element: HTMLElement): string[] => {
  const lines: string[] = [];
  let currentLine = "";

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      currentLine += node.textContent || "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      
      // Skip hidden elements
      if (el.style.display === "none" || el.hidden) {
        return;
      }

      if (el.tagName.toLowerCase() === "br") {
        // Push current line and start new one
        lines.push(currentLine);
        currentLine = "";
      } else {
        // Process children for inline elements
        Array.from(el.childNodes).forEach(processNode);
      }
    }
  };

  Array.from(element.childNodes).forEach(processNode);
  
  // Push the last line
  lines.push(currentLine);

  return lines;
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
  // Normalize whitespace: collapse multiple spaces/newlines into single spaces
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const words = normalizedText.split(" ").filter((w) => w.length > 0);

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
  const { pdf, contentWidth, padding, fontFamily } = ctx;
  pdf.setFontSize(fontSize);
  pdf.setFont(fontFamily, fontStyle);

  const lineHeightMm = fontSize * LINE_HEIGHT * 0.352778; // pt to mm
  const lines = wrapText(pdf, text, contentWidth, indent);

  for (const line of lines) {
    ctx.y = ensureSpace(ctx, lineHeightMm);
    pdf.text(line, padding + indent, ctx.y);
    ctx.y += lineHeightMm;
  }
};

/**
 * Renders a table from a DOM table element.
 */
const renderTable = (ctx: RenderContext, tableElement: HTMLElement): void => {
  const { pdf, contentWidth, padding, fontFamily } = ctx;
  const rows = tableElement.querySelectorAll("tr");
  if (rows.length === 0) return;

  pdf.setFontSize(FONT_SIZES.small);
  pdf.setFont(fontFamily, "normal");

  const lineHeightMm = FONT_SIZES.small * LINE_HEIGHT * 0.352778;
  const cellPadding = 2;

  // Calculate column widths based on first row
  const firstRow = rows[0];
  const cells = firstRow.querySelectorAll("th, td");
  const numCols = cells.length;
  if (numCols === 0) return;

  const colWidth = contentWidth / numCols;

  // Render each row
  rows.forEach((row, rowIndex) => {
    ctx.y = ensureSpace(ctx, lineHeightMm + cellPadding * 2);

    const rowCells = row.querySelectorAll("th, td");
    const isHeader = row.querySelector("th") !== null;

    if (isHeader) {
      pdf.setFont(fontFamily, "bold");
    } else {
      pdf.setFont(fontFamily, "normal");
    }

    rowCells.forEach((cell, colIndex) => {
      const cellText = getTextContent(cell).replace(/\s+/g, " ").trim();
      const x = padding + colIndex * colWidth + cellPadding;

      // Truncate text if too wide using simple character estimation
      let displayText = cellText;
      const maxTextWidth = colWidth - cellPadding * 2;
      if (pdf.getTextWidth(displayText) > maxTextWidth) {
        // Estimate characters that fit
        const avgCharWidth = pdf.getTextWidth("m");
        const maxChars = Math.floor(maxTextWidth / avgCharWidth);
        if (displayText.length > maxChars) {
          displayText = displayText.slice(0, Math.max(0, maxChars - 3)) + "...";
        }
      }

      pdf.text(displayText, x, ctx.y);

      // Draw cell border
      pdf.setDrawColor(200);
      pdf.rect(
        padding + colIndex * colWidth,
        ctx.y - lineHeightMm + cellPadding,
        colWidth,
        lineHeightMm + cellPadding
      );
    });

    // Draw bottom border for row
    if (rowIndex === 0 && isHeader) {
      pdf.setDrawColor(100);
      pdf.line(
        padding,
        ctx.y + cellPadding,
        padding + contentWidth,
        ctx.y + cellPadding
      );
    }

    ctx.y += lineHeightMm + cellPadding;
  });

  ctx.y += 4; // Space after table
};

/** Pixels to mm conversion factor at 96 DPI */
const PX_TO_MM = 0.264583;

/** Max height for images to fit on a page */
const getMaxImageHeight = (padding: number): number => PDF_HEIGHT - 2 * padding - 10;

/**
 * Gets the alignment from an image element or its parent wrapper.
 */
const getImageAlignment = (imgElement: HTMLImageElement): "left" | "center" | "right" => {
  // Check data-align attribute on the image
  const dataAlign = imgElement.getAttribute("data-align");
  if (dataAlign === "center" || dataAlign === "right" || dataAlign === "left") {
    return dataAlign;
  }

  // Check parent wrapper for alignment
  const parent = imgElement.parentElement;
  if (parent) {
    // Check for text-align style on parent
    const textAlign = parent.style.textAlign;
    if (textAlign === "center" || textAlign === "right") {
      return textAlign;
    }

    // Check for data-align on parent
    const parentDataAlign = parent.getAttribute("data-align");
    if (parentDataAlign === "center" || parentDataAlign === "right" || parentDataAlign === "left") {
      return parentDataAlign;
    }

    // Check for alignment classes on parent
    if (parent.classList.contains("text-center")) return "center";
    if (parent.classList.contains("text-right")) return "right";
  }

  return "left";
};

/**
 * Renders an image to PDF.
 */
const renderImage = (ctx: RenderContext, imgElement: HTMLImageElement): void => {
  const src = imgElement.getAttribute("src");
  if (!src) return;

  const { pdf, padding, contentWidth } = ctx;
  const maxImageHeight = getMaxImageHeight(padding);

  // Get image dimensions - prioritize attributes, then DOM properties, then defaults
  const widthAttr = imgElement.getAttribute("width");
  const heightAttr = imgElement.getAttribute("height");
  
  const imgWidthPx = widthAttr 
    ? parseInt(widthAttr, 10) 
    : (imgElement.width || imgElement.naturalWidth || DEFAULT_IMAGE_WIDTH_PX);
  const imgHeightPx = heightAttr 
    ? parseInt(heightAttr, 10) 
    : (imgElement.height || imgElement.naturalHeight || DEFAULT_IMAGE_HEIGHT_PX);

  // Convert to mm
  let imgWidthMm = imgWidthPx * PX_TO_MM;
  let imgHeightMm = imgHeightPx * PX_TO_MM;

  // Scale down if wider than content width
  if (imgWidthMm > contentWidth) {
    const scale = contentWidth / imgWidthMm;
    imgWidthMm = contentWidth;
    imgHeightMm = imgHeightMm * scale;
  }

  // Scale down if taller than max height
  if (imgHeightMm > maxImageHeight) {
    const scale = maxImageHeight / imgHeightMm;
    imgHeightMm = maxImageHeight;
    imgWidthMm = imgWidthMm * scale;
  }

  // Ensure space for image
  ctx.y = ensureSpace(ctx, imgHeightMm + 4);

  // Get alignment
  const align = getImageAlignment(imgElement);

  // Calculate X position based on alignment
  let x: number;
  switch (align) {
    case "center":
      x = padding + (contentWidth - imgWidthMm) / 2;
      break;
    case "right":
      x = padding + contentWidth - imgWidthMm;
      break;
    case "left":
    default:
      x = padding;
      break;
  }

  // Try to add image to PDF
  try {
    // Determine image format from src (use lowercase for consistent matching)
    const srcLower = src.toLowerCase();
    let format: "JPEG" | "PNG" = "PNG";
    if (srcLower.includes(".jpg") || srcLower.includes(".jpeg") || srcLower.includes("data:image/jpeg")) {
      format = "JPEG";
    }

    pdf.addImage(src, format, x, ctx.y, imgWidthMm, imgHeightMm);
    ctx.y += imgHeightMm + 4; // Add spacing after image
  } catch {
    // If image loading fails (CORS, etc.), add a placeholder
    pdf.setDrawColor(180);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, ctx.y, imgWidthMm, imgHeightMm, "FD");

    // Add placeholder text
    pdf.setFontSize(FONT_SIZES.small);
    pdf.setFont(ctx.fontFamily, "italic");
    pdf.setTextColor(128);
    const placeholderText = "[Image]";
    const textWidth = pdf.getTextWidth(placeholderText);
    pdf.text(placeholderText, x + (imgWidthMm - textWidth) / 2, ctx.y + imgHeightMm / 2);
    pdf.setTextColor(0);

    ctx.y += imgHeightMm + 4;
  }
};

/**
 * Processes a DOM element and renders it to PDF.
 */
const processElement = (ctx: RenderContext, element: HTMLElement): void => {
  const tagName = element.tagName.toLowerCase();

  // Handle page breaks
  if (element.classList.contains("page-break")) {
    ctx.pdf.addPage();
    ctx.y = ctx.padding;
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

    case "p": {
      const lines = getParagraphLines(element);
      const bodyLineHeight = FONT_SIZES.body * LINE_HEIGHT * 0.352778; // pt to mm
      
      // If the paragraph has no content or only empty lines, treat as blank lines
      const hasContent = lines.some((line) => line.trim().length > 0);
      
      if (!hasContent) {
        // Empty paragraph: render as full-height blank lines
        // Note: lines.length includes the implicit line after the last <br>,
        // so for n <br> elements, we get n+1 lines. For consistency:
        // - <p></p> (no breaks) → 1 blank line
        // - <p><br></p> (1 break) → 1 blank line
        // - <p><br><br></p> (2 breaks) → 2 blank lines
        const numBlankLines = Math.max(1, lines.length - 1);
        for (let i = 0; i < numBlankLines; i++) {
          ctx.y = ensureSpace(ctx, bodyLineHeight);
          ctx.y += bodyLineHeight;
        }
      } else {
        // Paragraph with content: render each line separately
        for (const line of lines) {
          const normalizedLine = line.replace(/\s+/g, " ").trim();
          
          if (normalizedLine) {
            // Non-empty line: render with text wrapping
            renderTextBlock(ctx, normalizedLine, FONT_SIZES.body);
          } else {
            // Empty line within paragraph: add blank line
            ctx.y = ensureSpace(ctx, bodyLineHeight);
            ctx.y += bodyLineHeight;
          }
        }
        ctx.y += 2; // Paragraph spacing
      }
      break;
    }

    case "ul":
      processListItems(ctx, element, "bullet");
      ctx.y += 2;
      break;

    case "ol":
      processListItems(ctx, element, "ordered");
      ctx.y += 2;
      break;

    case "table":
      renderTable(ctx, element);
      break;

    case "br":
      ctx.y += FONT_SIZES.body * LINE_HEIGHT * 0.352778;
      break;

    case "hr":
      ctx.y = ensureSpace(ctx, 5);
      ctx.pdf.setDrawColor(200);
      ctx.pdf.line(ctx.padding, ctx.y, ctx.padding + ctx.contentWidth, ctx.y);
      ctx.y += 5;
      break;

    case "img":
      renderImage(ctx, element as HTMLImageElement);
      break;

    case "div":
    case "section":
    case "article":
    case "main":
      // Block container elements - process children
      processChildren(ctx, element);
      break;

    case "span":
    case "a":
    case "strong":
    case "b":
    case "em":
    case "i":
    case "s":
    case "u":
      // Inline elements - get their text content within parent context
      // These are handled by getTextContent when processing their parent
      break;

    case "li":
      // List items are handled by processListItems
      break;

    default: {
      // For unknown block elements, try to render text content
      const text = getTextContent(element);
      if (text.trim()) {
        renderTextBlock(ctx, text, FONT_SIZES.body);
      }
    }
  }
};

/**
 * Processes list items within a ul or ol element.
 */
const processListItems = (
  ctx: RenderContext,
  listElement: HTMLElement,
  listType: "bullet" | "ordered",
  depth: number = 1
): void => {
  const indent = depth * 5;
  let itemIndex = 0;

  for (const child of Array.from(listElement.children)) {
    if (child.tagName.toLowerCase() === "li") {
      itemIndex++;
      const bullet = listType === "ordered" ? `${itemIndex}. ` : "• ";

      // Get direct text content, excluding nested lists
      let textContent = "";
      for (const node of Array.from(child.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          textContent += node.textContent || "";
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();
          // Skip nested lists, we'll process them separately
          if (tag !== "ul" && tag !== "ol") {
            textContent += getTextContent(el);
          }
        }
      }

      const text = bullet + textContent.replace(/\s+/g, " ").trim();
      if (text.trim() !== bullet.trim()) {
        renderTextBlock(ctx, text, FONT_SIZES.body, "normal", indent);
      }

      // Process nested lists
      for (const nested of Array.from(child.children)) {
        const nestedTag = nested.tagName.toLowerCase();
        if (nestedTag === "ul") {
          processListItems(ctx, nested as HTMLElement, "bullet", depth + 1);
        } else if (nestedTag === "ol") {
          processListItems(ctx, nested as HTMLElement, "ordered", depth + 1);
        }
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
      // Only render standalone text nodes that have content
      const text = child.textContent;
      if (text && text.trim()) {
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
 * @param options - Optional PDF export settings (pageWidth, fontFamily)
 * @throws Error if not in a browser environment or if export fails
 */
export const exportToPDF = async (
  doc: Document,
  documentElement: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> => {
  try {
    if (typeof globalThis === "undefined" || !globalThis.document) {
      throw new Error("PDF export is only available in a browser environment.");
    }

    if (!documentElement) {
      throw new Error("No document content available to export.");
    }

    // Get page width configuration
    const pageWidthOption = options.pageWidth || "medium";
    const config = PAGE_WIDTH_CONFIG[pageWidthOption];
    const pdfWidth = config.width;
    const padding = config.padding;
    const contentWidth = pdfWidth - 2 * padding;

    // Get font family
    const fontFamilyOption = options.fontFamily || "sans";
    const fontFamily = FONT_FAMILY_MAP[fontFamilyOption];

    // Create a new jsPDF instance with custom page size
    // For A4 (narrow), use the built-in "a4" format
    // For wider pages, use custom dimensions with portrait orientation
    // (orientation only affects A4/letter formats, custom sizes ignore it)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: pdfWidth <= 210 ? "a4" : [pdfWidth, PDF_HEIGHT],
    });

    // Set default font
    pdf.setFont(fontFamily, "normal");

    // Initialize render context
    const ctx: RenderContext = {
      pdf,
      y: padding,
      pdfWidth,
      contentWidth,
      padding,
      fontFamily,
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
