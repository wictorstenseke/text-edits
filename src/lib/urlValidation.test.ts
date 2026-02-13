import { describe, it, expect } from "vitest";

import { isValidHref } from "./urlValidation";

describe("isValidHref", () => {
  it("rejects javascript: URLs", () => {
    expect(isValidHref("javascript:alert(1)")).toBe(false);
    expect(isValidHref("JavaScript:void(0)")).toBe(false);
  });

  it("rejects vbscript: URLs", () => {
    expect(isValidHref("vbscript:msgbox(1)")).toBe(false);
  });

  it("rejects data: URLs", () => {
    expect(isValidHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isValidHref("data:image/png;base64,abc")).toBe(false);
  });

  it("allows https URLs", () => {
    expect(isValidHref("https://example.com")).toBe(true);
    expect(isValidHref("https://example.com/path")).toBe(true);
  });

  it("allows http URLs", () => {
    expect(isValidHref("http://example.com")).toBe(true);
  });

  it("allows mailto URLs", () => {
    expect(isValidHref("mailto:user@example.com")).toBe(true);
  });

  it("allows relative paths", () => {
    expect(isValidHref("/about")).toBe(true);
    expect(isValidHref("#section")).toBe(true);
    expect(isValidHref("about")).toBe(true);
    expect(isValidHref("./page")).toBe(true);
  });

  it("rejects empty or whitespace-only strings", () => {
    expect(isValidHref("")).toBe(false);
    expect(isValidHref("   ")).toBe(false);
  });
});
