import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { DocumentContentRenderer } from "./DocumentContentRenderer";

describe("DocumentContentRenderer", () => {
  describe("tag replacement in rendered content", () => {
    it("should replace tag mentions in text nodes with values from tagValues", () => {
      const content = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Company: CompanyName, Org: OrgNumber, Email: ContactEmail",
              },
            ],
          },
        ],
      });
      const tagValues = {
        CompanyName: "Acme AB",
        OrgNumber: "556677-8899",
        ContactEmail: "info@acme.se",
      };

      render(<DocumentContentRenderer content={content} tagValues={tagValues} />);

      expect(
        screen.getByText(/Company: Acme AB, Org: 556677-8899, Email: info@acme\.se/)
      ).toBeInTheDocument();
    });

    it("should replace mention nodes with values from tagValues", () => {
      const content = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              {
                type: "mention",
                attrs: { id: "CompanyName", label: "Acme AB" },
              },
            ],
          },
        ],
      });
      const tagValues = { CompanyName: "My Company Inc" };

      render(<DocumentContentRenderer content={content} tagValues={tagValues} />);

      expect(screen.getByText("My Company Inc")).toBeInTheDocument();
    });

    it("should fall back to label when tag key is missing from tagValues", () => {
      const content = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "mention",
                attrs: { id: "UnknownTag", label: "Fallback Label" },
              },
            ],
          },
        ],
      });
      const tagValues = { CompanyName: "Acme" };

      render(<DocumentContentRenderer content={content} tagValues={tagValues} />);

      expect(screen.getByText("Fallback Label")).toBeInTheDocument();
    });

    it("should fall back to tag key when both value and label are missing", () => {
      const content = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "mention",
                attrs: { id: "BareTag" },
              },
            ],
          },
        ],
      });
      const tagValues = {};

      render(<DocumentContentRenderer content={content} tagValues={tagValues} />);

      expect(screen.getByText("BareTag")).toBeInTheDocument();
    });

    it("should handle empty tagValues gracefully", () => {
      const content = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Plain text without tags",
              },
            ],
          },
        ],
      });

      render(<DocumentContentRenderer content={content} tagValues={{}} />);

      expect(screen.getByText("Plain text without tags")).toBeInTheDocument();
    });

    it("should replace multiple occurrences of the same tag in text", () => {
      const content = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "CompanyName and CompanyName again",
              },
            ],
          },
        ],
      });
      const tagValues = { CompanyName: "Acme AB" };

      render(<DocumentContentRenderer content={content} tagValues={tagValues} />);

      expect(
        screen.getByText("Acme AB and Acme AB again")
      ).toBeInTheDocument();
    });
  });

  describe("invalid content", () => {
    it("should return null when content is invalid JSON", () => {
      const { container } = render(
        <DocumentContentRenderer content="not valid json" tagValues={{}} />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
