import { describe, expect, it } from "vitest";

import {
  addChildSection,
  addParentSection,
  buildSectionGroups,
  isHierarchyDropAllowed,
  normalizeSections,
  removeSectionWithChildren,
  reorderSectionsByDrag,
} from "./sectionHierarchy";

import type { Section } from "@/types/document";

const makeSection = (
  id: string,
  title: string,
  order: number,
  parentId: string | null = null
): Section => ({
  id,
  title,
  order,
  parentId,
  content: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}",
});

describe("normalizeSections", () => {
  it("migrates invalid parent references to top-level sections", () => {
    const sections: Section[] = [
      makeSection("a", "A", 0, null),
      makeSection("b", "B", 1, "missing"),
      makeSection("c", "C", 2, "b"),
    ];

    const normalized = normalizeSections(sections);
    const b = normalized.find((section) => section.id === "b");
    const c = normalized.find((section) => section.id === "c");

    expect(b?.parentId).toBeNull();
    expect(c?.parentId).toBe("b");
  });
});

describe("buildSectionGroups", () => {
  it("groups child sections under parents", () => {
    const sections: Section[] = [
      makeSection("p1", "Parent 1", 0, null),
      makeSection("c1", "Child 1", 1, "p1"),
      makeSection("p2", "Parent 2", 2, null),
      makeSection("c2", "Child 2", 3, "p2"),
    ];

    const groups = buildSectionGroups(sections);

    expect(groups).toHaveLength(2);
    expect(groups[0].parent.id).toBe("p1");
    expect(groups[0].children.map((child) => child.id)).toEqual(["c1"]);
    expect(groups[1].parent.id).toBe("p2");
    expect(groups[1].children.map((child) => child.id)).toEqual(["c2"]);
  });
});

describe("addParentSection / addChildSection", () => {
  it("adds a top-level section at the end", () => {
    const sections: Section[] = [makeSection("p1", "Parent 1", 0, null)];
    const { sections: updated, createdSection } = addParentSection(
      sections,
      "Parent 2"
    );

    expect(updated).toHaveLength(2);
    expect(createdSection.parentId).toBeNull();
    expect(updated[1].id).toBe(createdSection.id);
  });

  it("adds a child section under the selected parent", () => {
    const sections: Section[] = [
      makeSection("p1", "Parent 1", 0, null),
      makeSection("p2", "Parent 2", 1, null),
    ];
    const { sections: updated, createdSection } = addChildSection(
      sections,
      "p1",
      "Child 1"
    );

    expect(createdSection).not.toBeNull();
    expect(createdSection?.parentId).toBe("p1");
    const groups = buildSectionGroups(updated);
    expect(groups[0].children).toHaveLength(1);
    expect(groups[0].children[0].id).toBe(createdSection?.id);
  });
});

describe("removeSectionWithChildren", () => {
  it("removes a parent and all sub-sections", () => {
    const sections: Section[] = [
      makeSection("p1", "Parent 1", 0, null),
      makeSection("c1", "Child 1", 1, "p1"),
      makeSection("p2", "Parent 2", 2, null),
    ];

    const updated = removeSectionWithChildren(sections, "p1");
    expect(updated.map((section) => section.id)).toEqual(["p2"]);
  });
});

describe("drag rules and reorder", () => {
  it("allows parent-to-parent and same-parent child-to-child drops", () => {
    expect(
      isHierarchyDropAllowed(
        { sectionId: "a", kind: "parent", parentId: null },
        { sectionId: "b", kind: "parent", parentId: null }
      )
    ).toBe(true);

    expect(
      isHierarchyDropAllowed(
        { sectionId: "a1", kind: "child", parentId: "a" },
        { sectionId: "a2", kind: "child", parentId: "a" }
      )
    ).toBe(true);

    expect(
      isHierarchyDropAllowed(
        { sectionId: "a1", kind: "child", parentId: "a" },
        { sectionId: "b1", kind: "child", parentId: "b" }
      )
    ).toBe(false);
  });

  it("reorders parent sections while preserving their children", () => {
    const sections: Section[] = [
      makeSection("p1", "Parent 1", 0, null),
      makeSection("c1", "Child 1", 1, "p1"),
      makeSection("p2", "Parent 2", 2, null),
      makeSection("c2", "Child 2", 3, "p2"),
    ];

    const updated = reorderSectionsByDrag(
      sections,
      { sectionId: "p2", kind: "parent", parentId: null },
      { sectionId: "p1", kind: "parent", parentId: null },
      "above"
    );

    expect(updated.map((section) => section.id)).toEqual(["p2", "c2", "p1", "c1"]);
  });

  it("reorders child sections within the same parent", () => {
    const sections: Section[] = [
      makeSection("p1", "Parent 1", 0, null),
      makeSection("c1", "Child 1", 1, "p1"),
      makeSection("c2", "Child 2", 2, "p1"),
    ];

    const updated = reorderSectionsByDrag(
      sections,
      { sectionId: "c2", kind: "child", parentId: "p1" },
      { sectionId: "c1", kind: "child", parentId: "p1" },
      "above"
    );

    expect(updated.map((section) => section.id)).toEqual(["p1", "c2", "c1"]);
  });
});
