import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import type { Document } from "@/types/document";

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

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const padding = 10;

    // Find all page break elements
    const pageBreaks = documentElement.querySelectorAll(".page-break");
    const sections: HTMLElement[] = [];

    // If no page breaks, treat the whole document as one page
    if (pageBreaks.length === 0) {
      sections.push(documentElement);
    } else {
      // Split content by page breaks
      let currentSection = documentElement.cloneNode(false) as HTMLElement;
      const allNodes = Array.from(documentElement.childNodes);

      for (const node of allNodes) {
        if (
          node instanceof HTMLElement &&
          node.classList.contains("page-break")
        ) {
          sections.push(currentSection);
          currentSection = documentElement.cloneNode(false) as HTMLElement;
        } else {
          currentSection.appendChild(node.cloneNode(true));
        }
      }

      // Add the last section
      if (currentSection.childNodes.length > 0) {
        sections.push(currentSection);
      }
    }

    /**
     * Default fallback color when OKLCH parsing fails.
     */
    const OKLCH_FALLBACK_COLOR = "#888888";

    /**
     * Converts OKLCH color values to hex approximations.
     * html2canvas doesn't support oklch() so we need to convert them.
     */
    const oklchToHex = (oklchStr: string): string => {
      // Parse oklch(L C H) or oklch(L C H / alpha)
      const match = oklchStr.match(
        /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/
      );
      if (!match) return OKLCH_FALLBACK_COLOR;

      const L = parseFloat(match[1]);
      const C = parseFloat(match[2]);
      const H = parseFloat(match[3]);
      // Note: alpha is parsed but not used in hex output (hex doesn't support alpha)

      // Convert OKLCH to OKLab
      const a = C * Math.cos((H * Math.PI) / 180);
      const b = C * Math.sin((H * Math.PI) / 180);

      // Convert OKLab to linear sRGB
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.291485548 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      // Linear sRGB to sRGB
      const linearR = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const linearG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const linearB = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

      const toSrgb = (c: number): number => {
        const clamped = Math.max(0, Math.min(1, c));
        if (clamped <= 0.0031308) {
          return clamped * 12.92;
        }
        return 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      };

      const r = Math.round(toSrgb(linearR) * 255);
      const g = Math.round(toSrgb(linearG) * 255);
      const bVal = Math.round(toSrgb(linearB) * 255);

      const toHex = (n: number): string =>
        Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");

      return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
    };

    /**
     * Replaces all oklch() occurrences in a CSS value string with hex colors.
     */
    const replaceOklchInValue = (value: string): string => {
      const oklchRegex = /oklch\([^)]+\)/g;
      return value.replace(oklchRegex, (match) => oklchToHex(match));
    };

    /**
     * CSS properties that can contain color values which may use oklch().
     */
    const COLOR_PROPERTIES = [
      "color",
      "background-color",
      "background",
      "border-color",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "border-block-start-color",
      "border-block-end-color",
      "border-inline-start-color",
      "border-inline-end-color",
      "outline-color",
      "text-decoration-color",
      "box-shadow",
      "text-shadow",
      "caret-color",
      "column-rule-color",
      "accent-color",
      "fill",
      "stroke",
    ] as const;

    const normalizeUnsupportedColors = (root: HTMLElement) => {
      if (!("getComputedStyle" in globalThis)) return;

      const elements: HTMLElement[] = [
        root,
        ...Array.from(root.querySelectorAll<HTMLElement>("*")),
      ];

      for (const el of elements) {
        const computed = globalThis.getComputedStyle(el);

        for (const prop of COLOR_PROPERTIES) {
          const value = computed.getPropertyValue(prop).trim();
          if (value && value.includes("oklch(")) {
            const converted = replaceOklchInValue(value);
            // Use setProperty to handle hyphenated properties
            el.style.setProperty(prop, converted);
          }
        }
      }
    };

    const overrideRootBackgroundsForExport = () => {
      if (!("getComputedStyle" in globalThis)) {
        return {
          htmlBackground: "",
          bodyBackground: "",
        };
      }

      const doc = globalThis.document;
      const htmlEl = doc.documentElement as HTMLElement;
      const bodyEl = doc.body as HTMLElement;

      const originals = {
        htmlBackground: htmlEl.style.backgroundColor,
        bodyBackground: bodyEl.style.backgroundColor,
      };

      const normalizeElement = (el: HTMLElement) => {
        const computed = globalThis.getComputedStyle(el);
        const bg = computed.getPropertyValue("background-color").trim();
        if (bg.includes("oklch(")) {
          el.style.backgroundColor = replaceOklchInValue(bg);
        }
      };

      normalizeElement(htmlEl);
      normalizeElement(bodyEl);

      return originals;
    };

    const restoreRootBackgroundsAfterExport = (originals: {
      htmlBackground: string;
      bodyBackground: string;
    }) => {
      const doc = globalThis.document;
      (doc.documentElement as HTMLElement).style.backgroundColor =
        originals.htmlBackground;
      (doc.body as HTMLElement).style.backgroundColor =
        originals.bodyBackground;
    };

    const rootBackgrounds = overrideRootBackgroundsForExport();

    try {
      // Process each section (page)
      for (let i = 0; i < sections.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const section = sections[i];

        // Create a temporary container for the section
        const tempContainer = globalThis.document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "0";
        tempContainer.style.width = `${pdfWidth - 2 * padding}mm`;
        tempContainer.style.padding = `${padding}mm`;
        tempContainer.style.backgroundColor = "white";
        tempContainer.appendChild(section);
        globalThis.document.body.appendChild(tempContainer);

        // Work around html2canvas not supporting modern color functions like oklch()
        normalizeUnsupportedColors(tempContainer);

        // Convert to canvas
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        // Calculate dimensions
        const imgWidth = pdfWidth - 2 * padding;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(
          imgData,
          "PNG",
          padding,
          padding,
          imgWidth,
          Math.min(imgHeight, pdfHeight - 2 * padding)
        );

        // Clean up
        globalThis.document.body.removeChild(tempContainer);
      }
    } finally {
      restoreRootBackgroundsAfterExport(rootBackgrounds);
    }

    // Save the PDF
    const filename = `${doc.title
      .replace(/[^a-z0-9\s-]/gi, "_")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};
