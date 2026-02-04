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

  it("should handle paragraphs with line breaks", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "Line 1<br>Line 2<br>Line 3";
    container.appendChild(paragraph);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    // Verify text was rendered for each line
    const textCalls = textMock.mock.calls.map((call) => call[0]);
    expect(textCalls).toContain("Line 1");
    expect(textCalls).toContain("Line 2");
    expect(textCalls).toContain("Line 3");
  });

  it("should handle empty paragraphs as blank lines", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const p1 = document.createElement("p");
    p1.textContent = "First paragraph";
    const p2 = document.createElement("p");
    // Empty paragraph
    const p3 = document.createElement("p");
    p3.textContent = "Third paragraph";
    
    container.appendChild(p1);
    container.appendChild(p2);
    container.appendChild(p3);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    // Verify text was rendered for non-empty paragraphs
    const textCalls = textMock.mock.calls.map((call) => call[0]);
    expect(textCalls).toContain("First paragraph");
    expect(textCalls).toContain("Third paragraph");
    // Empty paragraph should create vertical space - we can't easily verify
    // y-coordinate changes with current mock structure, but we can verify
    // that the export completed successfully without throwing
    expect(saveMock).toHaveBeenCalled();
  });

  it("should handle consecutive line breaks as empty lines", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "Line 1<br><br>Line 3";
    container.appendChild(paragraph);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    // Verify text was rendered
    const textCalls = textMock.mock.calls.map((call) => call[0]);
    expect(textCalls).toContain("Line 1");
    expect(textCalls).toContain("Line 3");
  });

  it("should handle tables with empty cells", async () => {
    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    container = document.createElement("div");
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    
    // Header row
    const headerRow = document.createElement("tr");
    const th1 = document.createElement("th");
    th1.textContent = "Column 1";
    const th2 = document.createElement("th");
    th2.textContent = "Column 2";
    headerRow.appendChild(th1);
    headerRow.appendChild(th2);
    tbody.appendChild(headerRow);
    
    // Data row with one empty cell
    const dataRow1 = document.createElement("tr");
    const td1 = document.createElement("td");
    td1.textContent = "Value 1";
    const td2 = document.createElement("td");
    // Empty cell
    dataRow1.appendChild(td1);
    dataRow1.appendChild(td2);
    tbody.appendChild(dataRow1);
    
    // Completely empty row
    const dataRow2 = document.createElement("tr");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    dataRow2.appendChild(td3);
    dataRow2.appendChild(td4);
    tbody.appendChild(dataRow2);
    
    table.appendChild(tbody);
    container.appendChild(table);
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    // Verify table was rendered - check for headers and values
    const textCalls = textMock.mock.calls.map((call) => call[0]);
    expect(textCalls).toContain("Column 1");
    expect(textCalls).toContain("Column 2");
    expect(textCalls).toContain("Value 1");
    
    // Verify borders were drawn for all cells (including empty ones)
    // rectMock should be called for each cell (6 cells total: 2 header + 2 + 2)
    expect(rectMock.mock.calls.length).toBe(6);
  });
});
