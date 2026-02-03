import type { Document, Template } from "@/types/document";

const STORAGE_KEY = "document-editor-state";

export const getSampleDocument = (): Document => ({
  id: "doc-1",
  title: "Sample Document",
  sections: [
    {
      id: "section-1",
      title: "Introduction",
      order: 0,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Welcome to the Document Editor" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a sample document. You can edit this section using the editor panel on the right.",
              },
            ],
          },
        ],
      }),
    },
    {
      id: "section-2",
      title: "Company Information",
      order: 1,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Company Name: " },
              { type: "text", marks: [{ type: "bold" }], text: "CompanyName" },
            ],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Organization Number: " },
              { type: "text", marks: [{ type: "bold" }], text: "OrgNumber" },
            ],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Contact: " },
              { type: "text", marks: [{ type: "bold" }], text: "ContactEmail" },
            ],
          },
        ],
      }),
    },
    {
      id: "section-3",
      title: "Features",
      order: 2,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Key Features" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "WYSIWYG editing" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Section management" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Tag library" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Table support" }],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
  ],
  tagValues: {
    CompanyName: "Acme AB",
    OrgNumber: "556xxx-xxxx",
    ContactEmail: "info@acme.se",
  },
});

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
        typeof parsed.tagValues === "object"
      ) {
        return parsed as Document;
      }
    }
  } catch (error) {
    console.error("Error loading document:", error);
  }
  return getSampleDocument();
};

export const saveDocument = (document: Document): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  } catch (error) {
    console.error("Error saving document:", error);
  }
};
