import type { ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import i18n from "@/lib/i18n";

import { LanguageToggle } from "./language-toggle";

const renderWithProviders = (ui: ReactElement) =>
  render(
    <TooltipProvider>
      {ui}
    </TooltipProvider>
  );

describe("LanguageToggle", () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem("language", "en");
    await i18n.changeLanguage("en");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should update localStorage when language is toggled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageToggle />);

    const button = screen.getByRole("button", { name: /toggle language/i });
    await user.click(button);

    expect(localStorage.getItem("language")).toBe("sv");
  });

  it("should toggle from sv to en when clicked twice", async () => {
    await i18n.changeLanguage("sv");
    localStorage.setItem("language", "sv");
    const user = userEvent.setup();
    renderWithProviders(<LanguageToggle />);

    const button = screen.getByRole("button");
    await user.click(button);
    expect(localStorage.getItem("language")).toBe("en");

    await user.click(button);
    expect(localStorage.getItem("language")).toBe("sv");
  });
});
