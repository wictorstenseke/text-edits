import { describe, it, expect } from "vitest";

import { sanitizeTagValue, sanitizeTagValues } from "./tagValidation";

describe("sanitizeTagValue", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeTagValue(null as unknown as string)).toBe("");
    expect(sanitizeTagValue(undefined as unknown as string)).toBe("");
  });

  it("strips control characters", () => {
    expect(sanitizeTagValue("Hello\x00World\x1F")).toBe("HelloWorld");
    expect(sanitizeTagValue("Tab\there")).toBe("Tabhere");
  });

  it("truncates to max length", () => {
    const long = "a".repeat(600);
    expect(sanitizeTagValue(long).length).toBe(500);
  });

  it("preserves normal content", () => {
    expect(sanitizeTagValue("Acme AB")).toBe("Acme AB");
    expect(sanitizeTagValue("556677-8899")).toBe("556677-8899");
  });
});

describe("sanitizeTagValues", () => {
  it("sanitizes all values in record", () => {
    const input = {
      CompanyName: "Acme\x00AB",
      OrgNumber: "556677-8899",
    };
    expect(sanitizeTagValues(input)).toEqual({
      CompanyName: "AcmeAB",
      OrgNumber: "556677-8899",
    });
  });

  it("skips invalid keys", () => {
    const input = { "": "value", valid: "ok" };
    expect(sanitizeTagValues(input)).toEqual({ valid: "ok" });
  });
});
