import i18n from "@/lib/i18n";
import { migrateFinancialReportContent } from "@/lib/migrateFinancialReport";
import {
  EMPTY_SECTION_CONTENT,
  normalizeSections,
} from "@/lib/sectionHierarchy";
import { sanitizeTagValues } from "@/lib/tagValidation";

import { getEnglishAnnualReportDocument } from "./en";
import { getSwedishAnnualReportDocument } from "./sv";

import type { Document, Section, Template } from "@/types/document";

const STORAGE_KEY = "document-editor-state";

export { getEnglishAnnualReportDocument } from "./en";
export { getSwedishAnnualReportDocument } from "./sv";

export const getDefaultAnnualReportDocument = (language?: string): Document => {
  const lang = language || i18n.language;
  return lang === "sv"
    ? getSwedishAnnualReportDocument()
    : getEnglishAnnualReportDocument();
};

export const getSampleDocument = (): Document => {
  const sample = getDefaultAnnualReportDocument();
  return {
    ...sample,
    sections: normalizeSections(sample.sections),
  };
};

export const getSampleTemplates = (): Template[] => [
  {
    id: "template-1",
    name: "Basic Document",
    sections: [
      { title: "Introduction", content: "" },
      { title: "Main Content", content: "" },
      { title: "Conclusion", content: "" },
    ],
  },
  {
    id: "template-2",
    name: "Business Proposal",
    sections: [
      { title: "Executive Summary", content: "" },
      { title: "Problem Statement", content: "" },
      { title: "Proposed Solution", content: "" },
      { title: "Budget", content: "" },
      { title: "Timeline", content: "" },
      { title: "Conclusion", content: "" },
    ],
  },
];

export const loadDocument = (): Document => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the parsed object has the required Document structure
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.id === "string" &&
        typeof parsed.title === "string" &&
        Array.isArray(parsed.sections) &&
        typeof parsed.tagValues === "object" &&
        parsed.tagValues !== null
      ) {
        const normalizedSections: Section[] = parsed.sections
          .map((section: unknown, index: number) => {
            if (!section || typeof section !== "object") {
              return null;
            }

            const candidate = section as Partial<Section>;
            if (
              typeof candidate.id !== "string" ||
              typeof candidate.title !== "string"
            ) {
              return null;
            }

            const rawContent =
              typeof candidate.content === "string" &&
              candidate.content.length > 0
                ? candidate.content
                : EMPTY_SECTION_CONTENT;
            const migratedContent = migrateFinancialReportContent(rawContent);

            return {
              id: candidate.id,
              title: candidate.title,
              order:
                typeof candidate.order === "number" &&
                Number.isFinite(candidate.order)
                  ? candidate.order
                  : index,
              parentId:
                typeof candidate.parentId === "string" &&
                candidate.parentId.length > 0
                  ? candidate.parentId
                  : null,
              content: migratedContent,
            };
          })
          .filter(
            (section: Section | null): section is Section => section !== null
          );

        return {
          id: parsed.id,
          title: parsed.title,
          sections: normalizeSections(normalizedSections),
          tagValues: sanitizeTagValues(parsed.tagValues as Record<string, string>),
        };
      }
    }
  } catch (error) {
    console.error("Error loading document:", error);
  }
  return getSampleDocument();
};

export const saveDocument = (document: Document): void => {
  try {
    const sanitized = {
      ...document,
      tagValues: sanitizeTagValues(document.tagValues),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (error) {
    console.error("Error saving document:", error);
  }
};
