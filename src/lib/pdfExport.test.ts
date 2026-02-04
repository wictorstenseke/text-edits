import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { exportToPDF } from "./pdfExport";

import type { Document } from "@/types/document";

const addPageMock = vi.fn();
const saveMock = vi.fn();
const setFontMock = vi.fn();
const setFontSizeMock = vi.fn();
const textMock = vi.fn();
const getTextWidthMock = vi.fn().mockReturnValue(50);
const setDrawColorMock = vi.fn();
const lineMock = vi.fn();
const rectMock = vi.fn();

vi.mock("jspdf", () => {
  class JsPdfMock {
    addPage = addPageMock;
    save = saveMock;
    setFont = setFontMock;
    setFontSize = setFontSizeMock;
    text = textMock;
    getTextWidth = getTextWidthMock;
    setDrawColor = setDrawColorMock;
    line = lineMock;
    rect = rectMock;
  }

  return {
    jsPDF: JsPdfMock,
  };
});

describe("exportToPDF", () => {
  let container: HTMLElement | null = null;

  beforeEach(() => {
    addPageMock.mockClear();
    saveMock.mockClear().mockImplementation(() => {});
    setFontMock.mockClear();
    setFontSizeMock.mockClear();
    textMock.mockClear();
    getTextWidthMock.mockClear().mockReturnValue(50);
    setDrawColorMock.mockClear();
    lineMock.mockClear();
    rectMock.mockClear();
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
  });

  it("should create a PDF and save it with a sanitized filename", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test Document: 2025/Report",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const paragraph = document.createElement("p");
    paragraph.textContent = "Hello world";
    container.appendChild(paragraph);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith("Test_Document_2025_Report.pdf");
  });

  it("should throw a friendly error when PDF generation fails", async () => {
    saveMock.mockImplementation(() => {
      throw new Error("jsPDF failed");
    });

    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    document.body.appendChild(container);

    await expect(exportToPDF(doc, container)).rejects.toThrow(
      "Failed to generate PDF. Please try again."
    );
  });

  it("should render text content from DOM elements", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const heading = document.createElement("h1");
    heading.textContent = "Title";
    const paragraph = document.createElement("p");
    paragraph.textContent = "Some content";
    container.appendChild(heading);
    container.appendChild(paragraph);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    // Verify text was rendered
    expect(textMock).toHaveBeenCalled();
    // Check that both "Title" and "Some content" were rendered
    const textCalls = textMock.mock.calls.map((call) => call[0]);
    expect(textCalls).toContain("Title");
    expect(textCalls).toContain("Some content");
  });

  it("should handle page breaks by adding new pages", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const section1 = document.createElement("p");
    section1.textContent = "Section 1";
    const pageBreak = document.createElement("div");
    pageBreak.className = "page-break";
    const section2 = document.createElement("p");
    section2.textContent = "Section 2";

    container.appendChild(section1);
    container.appendChild(pageBreak);
    container.appendChild(section2);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    // Verify a new page was added for the page break
    expect(addPageMock).toHaveBeenCalledTimes(1);
  });

  it("should throw error when documentElement is null", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    await expect(
      exportToPDF(doc, null as unknown as HTMLElement)
    ).rejects.toThrow("Failed to generate PDF. Please try again.");
  });
});
