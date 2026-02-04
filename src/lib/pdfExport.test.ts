import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Document } from "@/types/document";

const addImageMock = vi.fn();
const addPageMock = vi.fn();
const saveMock = vi.fn();

vi.mock("jspdf", () => {
  class JsPdfMock {
    addImage = addImageMock;
    addPage = addPageMock;
    save = saveMock;
  }

  return {
    jsPDF: JsPdfMock,
  };
});

vi.mock("html2canvas", () => ({
  default: vi.fn(),
}));

import { exportToPDF } from "./pdfExport";
import html2canvas from "html2canvas";

describe("exportToPDF", () => {
  beforeEach(() => {
    addImageMock.mockClear();
    addPageMock.mockClear();
    saveMock.mockClear();
    vi.mocked(html2canvas).mockReset();
  });

  it("should create a PDF and save it with a sanitized filename", async () => {
    const canvasStub = {
      width: 800,
      height: 600,
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,fake"),
    } as unknown as HTMLCanvasElement;

    vi.mocked(html2canvas).mockResolvedValue(canvasStub);

    const doc: Document = {
      id: "doc-1",
      title: "Test Document: 2025/Report",
      sections: [],
      tagValues: {},
    };

    const container = document.createElement("div");
    container.textContent = "Hello world";
    document.body.appendChild(container);

    await exportToPDF(doc, container);

    expect(addImageMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith("Test_Document_2025_Report.pdf");
  });

  it("should throw a friendly error when html2canvas fails", async () => {
    vi.mocked(html2canvas).mockRejectedValue(new Error("html2canvas failed"));

    const doc: Document = {
      id: "doc-1",
      title: "Test",
      sections: [],
      tagValues: {},
    };

    const container = document.createElement("div");
    document.body.appendChild(container);

    await expect(exportToPDF(doc, container)).rejects.toThrow(
      "Failed to generate PDF. Please try again."
    );
  });
});
