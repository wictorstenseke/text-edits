import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import type { Document } from "@/types/document";

export const exportToPDF = async (
  document: Document,
  documentElement: HTMLElement
): Promise<void> => {
  try {
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

    // Process each section (page)
    for (let i = 0; i < sections.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const section = sections[i];

      // Create a temporary container for the section
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = `${pdfWidth - 2 * padding}mm`;
      tempContainer.style.padding = `${padding}mm`;
      tempContainer.style.backgroundColor = "white";
      tempContainer.appendChild(section);
      document.body.appendChild(tempContainer);

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
      document.body.removeChild(tempContainer);
    }

    // Save the PDF
    const filename = `${document.title.replace(/[^a-z0-9\s-]/gi, "_").replace(/\s+/g, "_").replace(/_+/g, "_")}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};
