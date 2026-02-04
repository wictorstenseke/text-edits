import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { getDefaultAnnualReportDocument, getSampleDocument, loadDocument, saveDocument } from "./documentStorage";

describe("getDefaultAnnualReportDocument", () => {
  it("should return a document with the correct structure", () => {
    const doc = getDefaultAnnualReportDocument();
    
    expect(doc.id).toBe("annual-report-2025");
    expect(doc.title).toBe("Annual Report 2025");
    expect(doc.sections).toHaveLength(9);
    expect(doc.tagValues).toEqual({
      CompanyName: "Acme AB",
      OrgNumber: "556xxx-xxxx",
      ContactEmail: "info@acme.se",
    });
  });

  it("should include all required annual report sections in correct order", () => {
    const doc = getDefaultAnnualReportDocument();
    const sectionTitles = doc.sections.map(s => s.title);
    
    expect(sectionTitles).toEqual([
      "Cover / Title Page",
      "Letter to Shareholders / CEO Statement",
      "Company Overview",
      "Management's Discussion & Analysis",
      "Highlights / Key Metrics",
      "Financial Statements",
      "Notes / Explanations",
      "Outlook & Goals for Next Year",
      "Appendices / Additional Info",
    ]);
  });

  it("should have valid order values for all sections", () => {
    const doc = getDefaultAnnualReportDocument();
    
    doc.sections.forEach((section, index) => {
      expect(section.order).toBe(index);
    });
  });

  it("should have unique section IDs", () => {
    const doc = getDefaultAnnualReportDocument();
    const sectionIds = doc.sections.map(s => s.id);
    const uniqueIds = new Set(sectionIds);
    
    expect(uniqueIds.size).toBe(sectionIds.length);
  });

  it("should have valid JSON content for all sections", () => {
    const doc = getDefaultAnnualReportDocument();
    
    doc.sections.forEach(section => {
      expect(() => JSON.parse(section.content)).not.toThrow();
      const content = JSON.parse(section.content);
      expect(content.type).toBe("doc");
      expect(Array.isArray(content.content)).toBe(true);
    });
  });

  it("should include financialReportBlock in Financial Statements section", () => {
    const doc = getDefaultAnnualReportDocument();
    const financialSection = doc.sections.find(s => s.title === "Financial Statements");
    
    expect(financialSection).toBeDefined();
    const content = JSON.parse(financialSection!.content);
    
    const financialBlocks = content.content.filter(
      (node: { type: string }) => node.type === "financialReportBlock"
    );
    
    // Should have Balance Sheet, Income Statement, and Cash Flow Statement blocks
    expect(financialBlocks).toHaveLength(3);
  });

  it("should have properly structured financial report blocks", () => {
    const doc = getDefaultAnnualReportDocument();
    const financialSection = doc.sections.find(s => s.title === "Financial Statements");
    const content = JSON.parse(financialSection!.content);
    
    const financialBlocks = content.content.filter(
      (node: { type: string }) => node.type === "financialReportBlock"
    );
    
    financialBlocks.forEach((block: { 
      attrs: { 
        leftColumns: unknown[];
        rightColumns: unknown[];
        rows: unknown[];
        showTotals: boolean;
      } 
    }) => {
      expect(block.attrs).toHaveProperty("leftColumns");
      expect(block.attrs).toHaveProperty("rightColumns");
      expect(block.attrs).toHaveProperty("rows");
      expect(block.attrs).toHaveProperty("showTotals");
      expect(Array.isArray(block.attrs.leftColumns)).toBe(true);
      expect(Array.isArray(block.attrs.rightColumns)).toBe(true);
      expect(Array.isArray(block.attrs.rows)).toBe(true);
    });
  });
});

describe("getSampleDocument", () => {
  it("should return the annual report document", () => {
    const sample = getSampleDocument();
    const annualReport = getDefaultAnnualReportDocument();
    
    expect(sample.id).toBe(annualReport.id);
    expect(sample.title).toBe(annualReport.title);
    expect(sample.sections.length).toBe(annualReport.sections.length);
  });
});

describe("loadDocument", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return the default annual report when localStorage is empty", () => {
    const doc = loadDocument();
    const defaultDoc = getDefaultAnnualReportDocument();
    
    expect(doc.id).toBe(defaultDoc.id);
    expect(doc.title).toBe(defaultDoc.title);
  });

  it("should return stored document when localStorage has valid data", () => {
    const customDoc = {
      id: "custom-doc",
      title: "Custom Document",
      sections: [],
      tagValues: {},
    };
    localStorage.setItem("document-editor-state", JSON.stringify(customDoc));
    
    const doc = loadDocument();
    
    expect(doc.id).toBe("custom-doc");
    expect(doc.title).toBe("Custom Document");
  });

  it("should return default document when localStorage has invalid data", () => {
    localStorage.setItem("document-editor-state", "invalid-json");
    
    // Mock console.error to suppress expected error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    const doc = loadDocument();
    const defaultDoc = getDefaultAnnualReportDocument();
    
    expect(doc.id).toBe(defaultDoc.id);
    
    consoleSpy.mockRestore();
  });
});

describe("saveDocument", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should save document to localStorage", () => {
    const doc = {
      id: "test-doc",
      title: "Test Document",
      sections: [],
      tagValues: {},
    };
    
    saveDocument(doc);
    
    const stored = localStorage.getItem("document-editor-state");
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(doc);
  });
});
