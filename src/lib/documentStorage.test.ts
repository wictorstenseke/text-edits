import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  getDefaultAnnualReportDocument,
  getSampleDocument,
  loadDocument,
  saveDocument,
} from "./documentStorage";
import {
  addChildSection,
  addParentSection,
  removeSectionWithChildren,
} from "./sectionHierarchy";

describe("getDefaultAnnualReportDocument", () => {
  it("should return a document with the correct structure", () => {
    const doc = getDefaultAnnualReportDocument("en");

    expect(doc.id).toBe("annual-report-2025");
    expect(doc.title).toBe("Annual Report 2025");
    expect(doc.sections).toHaveLength(9);
    expect(doc.tagValues).toEqual({
      CompanyName: "Acme AB",
      OrgNumber: "556xxx-xxxx",
      ContactEmail: "info@acme.se",
    });
    expect(doc.sections.every((section) => section.parentId === null)).toBe(
      true
    );
  });

  it("should include all required annual report sections in correct order for English", () => {
    const doc = getDefaultAnnualReportDocument("en");
    const sectionTitles = doc.sections.map((s) => s.title);

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

  it("should include all required annual report sections in correct order for Swedish", () => {
    const doc = getDefaultAnnualReportDocument("sv");
    const sectionTitles = doc.sections.map((s) => s.title);

    expect(sectionTitles).toEqual([
      "Framsida / Titelsida",
      "Brev till aktieägarna / VD:s uttalande",
      "Företagsöversikt",
      "Ledningens diskussion & analys",
      "Höjdpunkter / Nyckeltal",
      "Finansiella rapporter",
      "Noter / Förklaringar",
      "Utsikter & mål för nästa år",
      "Bilagor / Ytterligare information",
    ]);
  });

  it("should have valid order values for all sections", () => {
    const doc = getDefaultAnnualReportDocument("en");

    doc.sections.forEach((section, index) => {
      expect(section.order).toBe(index);
    });
  });

  it("should have top-level parentId values for all default sections", () => {
    const doc = getDefaultAnnualReportDocument("en");

    doc.sections.forEach((section) => {
      expect(section.parentId).toBeNull();
    });
  });

  it("should have unique section IDs", () => {
    const doc = getDefaultAnnualReportDocument("en");
    const sectionIds = doc.sections.map((s) => s.id);
    const uniqueIds = new Set(sectionIds);

    expect(uniqueIds.size).toBe(sectionIds.length);
  });

  it("should have valid JSON content for all sections", () => {
    const doc = getDefaultAnnualReportDocument("en");

    doc.sections.forEach((section) => {
      expect(() => JSON.parse(section.content)).not.toThrow();
      const content = JSON.parse(section.content);
      expect(content.type).toBe("doc");
      expect(Array.isArray(content.content)).toBe(true);
    });
  });

  it("should include financialReportBlock in Financial Statements section", () => {
    const doc = getDefaultAnnualReportDocument("en");
    const financialSection = doc.sections.find(
      (s) => s.title === "Financial Statements"
    );

    expect(financialSection).toBeDefined();
    const content = JSON.parse(financialSection!.content);

    const financialBlocks = content.content.filter(
      (node: { type: string }) => node.type === "financialReportBlock"
    );

    // Should have Balance Sheet, Income Statement, and Cash Flow Statement blocks
    expect(financialBlocks).toHaveLength(3);
  });

  it("should have properly structured financial report blocks", () => {
    const doc = getDefaultAnnualReportDocument("en");
    const financialSection = doc.sections.find(
      (s) => s.title === "Financial Statements"
    );
    const content = JSON.parse(financialSection!.content);

    const financialBlocks = content.content.filter(
      (node: { type: string }) => node.type === "financialReportBlock"
    );

    financialBlocks.forEach(
      (block: {
        attrs: {
          leftColumns: unknown[];
          rightColumns: unknown[];
          rows: unknown[];
          showTotals: boolean;
        };
      }) => {
        expect(block.attrs).toHaveProperty("leftColumns");
        expect(block.attrs).toHaveProperty("rightColumns");
        expect(block.attrs).toHaveProperty("rows");
        expect(block.attrs).toHaveProperty("showTotals");
        expect(Array.isArray(block.attrs.leftColumns)).toBe(true);
        expect(Array.isArray(block.attrs.rightColumns)).toBe(true);
        expect(Array.isArray(block.attrs.rows)).toBe(true);
      }
    );
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

  it("should migrate legacy sections that do not have parentId", () => {
    const legacyDoc = {
      id: "legacy-doc",
      title: "Legacy Document",
      sections: [
        {
          id: "legacy-1",
          title: "Legacy Section",
          order: 0,
          content: JSON.stringify({
            type: "doc",
            content: [{ type: "paragraph" }],
          }),
        },
      ],
      tagValues: {},
    };
    localStorage.setItem("document-editor-state", JSON.stringify(legacyDoc));

    const doc = loadDocument();

    expect(doc.sections).toHaveLength(1);
    expect(doc.sections[0].parentId).toBeNull();
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

describe("document persistence round-trip integrity", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should preserve document after load → edit → save → reload", () => {
    const initial = loadDocument();
    expect(initial.sections.length).toBeGreaterThan(0);

    const { sections: afterAdd } = addParentSection(
      initial.sections,
      "New Section"
    );
    const editedDoc = {
      ...initial,
      title: "Edited Title",
      sections: afterAdd,
      tagValues: {
        ...initial.tagValues,
        CompanyName: "Edited Company Name",
      },
    };

    saveDocument(editedDoc);
    const reloaded = loadDocument();

    expect(reloaded.id).toBe(editedDoc.id);
    expect(reloaded.title).toBe("Edited Title");
    expect(reloaded.tagValues.CompanyName).toBe("Edited Company Name");
    expect(reloaded.sections.length).toBe(editedDoc.sections.length);
    expect(reloaded.sections.some((s) => s.title === "New Section")).toBe(true);
  });

  it("should preserve document after add child section, change tags, remove section, save, reload", () => {
    const initial = loadDocument();
    const firstSectionId = initial.sections[0].id;

    const { sections: withChild } = addChildSection(
      initial.sections,
      firstSectionId,
      "Child Section"
    );
    const withRemoved = removeSectionWithChildren(withChild, firstSectionId);
    const editedDoc = {
      ...initial,
      sections: withRemoved,
      tagValues: {
        CompanyName: "Test Corp",
        OrgNumber: "123456-7890",
        ContactEmail: "contact@test.se",
      },
    };

    saveDocument(editedDoc);
    const reloaded = loadDocument();

    expect(reloaded.tagValues).toEqual(editedDoc.tagValues);
    expect(reloaded.sections.length).toBe(withRemoved.length);
  });

  it("should migrate legacy sections without parentId and preserve after round-trip", () => {
    const legacyDoc = {
      id: "legacy-round-trip",
      title: "Legacy Document",
      sections: [
        {
          id: "s1",
          title: "Section 1",
          order: 0,
          content: JSON.stringify({
            type: "doc",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }],
          }),
        },
      ],
      tagValues: { CompanyName: "Legacy Co" },
    };
    localStorage.setItem("document-editor-state", JSON.stringify(legacyDoc));

    const loaded = loadDocument();
    expect(loaded.sections[0].parentId).toBeNull();

    saveDocument(loaded);
    const reloaded = loadDocument();
    expect(reloaded.sections[0].parentId).toBeNull();
    expect(reloaded.tagValues.CompanyName).toBe("Legacy Co");
  });

  it("should fall back to default document when storage has invalid JSON", () => {
    localStorage.setItem("document-editor-state", "not valid json {{{");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const doc = loadDocument();
    const defaultDoc = getDefaultAnnualReportDocument();

    expect(doc.id).toBe(defaultDoc.id);
    expect(doc.sections.length).toBe(defaultDoc.sections.length);

    consoleSpy.mockRestore();
  });
});

describe("i18n for default document and language persistence", () => {
  it("should return correct section titles for en locale", () => {
    const doc = getDefaultAnnualReportDocument("en");
    expect(doc.sections[0].title).toBe("Cover / Title Page");
    expect(doc.sections).toHaveLength(9);
  });

  it("should return correct section titles for sv locale", () => {
    const doc = getDefaultAnnualReportDocument("sv");
    expect(doc.sections[0].title).toBe("Framsida / Titelsida");
    expect(doc.sections).toHaveLength(9);
  });

  it("should return English document when locale is unknown", () => {
    const doc = getDefaultAnnualReportDocument("de");
    const enDoc = getDefaultAnnualReportDocument("en");
    expect(doc.sections[0].title).toBe(enDoc.sections[0].title);
  });

  it("should load default document with Swedish sections when language is sv and storage is empty", async () => {
    const { default: i18n } = await import("./i18n");
    localStorage.clear();
    await i18n.changeLanguage("sv");

    const doc = loadDocument();
    expect(doc.sections[0].title).toBe("Framsida / Titelsida");
  });
});
