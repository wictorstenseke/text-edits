import type { Section } from "@/types/document";

export type SectionKind = "parent" | "child";

export interface SectionGroup {
  parent: Section;
  children: Section[];
}

export interface SectionDragItem {
  sectionId: string;
  kind: SectionKind;
  parentId: string | null;
}

export const EMPTY_SECTION_CONTENT = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const sortSectionsByOrder = (sections: Section[]): Section[] =>
  [...sections]
    .map((section, index) => ({
      section,
      index,
      order:
        typeof section.order === "number" && Number.isFinite(section.order)
          ? section.order
          : index,
    }))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .map(({ section, order }) => ({ ...section, order }));

const groupSections = (sections: Section[]): SectionGroup[] => {
  const ordered = sortSectionsByOrder(sections);
  const parents = ordered.filter((section) => section.parentId === null);
  const childrenByParent = new Map<string, Section[]>();

  for (const section of ordered) {
    if (!section.parentId) continue;
    const existing = childrenByParent.get(section.parentId) || [];
    childrenByParent.set(section.parentId, [...existing, section]);
  }

  return parents.map((parent) => ({
    parent,
    children: childrenByParent.get(parent.id) || [],
  }));
};

export const flattenSectionGroups = (groups: SectionGroup[]): Section[] =>
  groups.flatMap((group) => [group.parent, ...group.children]);

export const reindexSections = (sections: Section[]): Section[] =>
  sections.map((section, index) => ({
    ...section,
    order: index,
  }));

export const normalizeSections = (sections: Section[]): Section[] => {
  if (sections.length === 0) {
    return [];
  }

  const ordered = sortSectionsByOrder(sections).map((section) => ({
    ...section,
    parentId:
      typeof section.parentId === "string" && section.parentId.length > 0
        ? section.parentId
        : null,
  }));

  const idSet = new Set(ordered.map((section) => section.id));
  const withValidParentRefs = ordered.map((section) => {
    if (
      section.parentId === null ||
      !idSet.has(section.parentId) ||
      section.parentId === section.id
    ) {
      return { ...section, parentId: null };
    }
    return section;
  });

  const topLevelIds = new Set(
    withValidParentRefs
      .filter((section) => section.parentId === null)
      .map((section) => section.id)
  );

  const oneLevelOnly = withValidParentRefs.map((section) => {
    if (section.parentId === null) {
      return section;
    }

    return topLevelIds.has(section.parentId)
      ? section
      : { ...section, parentId: null };
  });

  if (!oneLevelOnly.some((section) => section.parentId === null)) {
    oneLevelOnly[0] = { ...oneLevelOnly[0], parentId: null };
  }

  return reindexSections(flattenSectionGroups(groupSections(oneLevelOnly)));
};

export const buildSectionGroups = (sections: Section[]): SectionGroup[] =>
  groupSections(normalizeSections(sections));

const createSectionId = (): string =>
  `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getFirstSectionId = (sections: Section[]): string | null =>
  normalizeSections(sections)[0]?.id || null;

export const addParentSection = (
  sections: Section[],
  title: string
): { sections: Section[]; createdSection: Section } => {
  const groups = buildSectionGroups(sections);
  const createdSection: Section = {
    id: createSectionId(),
    title,
    order: groups.length,
    parentId: null,
    content: EMPTY_SECTION_CONTENT,
  };

  const updatedGroups: SectionGroup[] = [
    ...groups,
    { parent: createdSection, children: [] },
  ];

  const updatedSections = reindexSections(flattenSectionGroups(updatedGroups));
  const persistedSection =
    updatedSections.find((section) => section.id === createdSection.id) ||
    createdSection;

  return { sections: updatedSections, createdSection: persistedSection };
};

export const addChildSection = (
  sections: Section[],
  parentId: string,
  title: string
): { sections: Section[]; createdSection: Section | null } => {
  const groups = buildSectionGroups(sections);
  if (!groups.some((group) => group.parent.id === parentId)) {
    return { sections: normalizeSections(sections), createdSection: null };
  }

  const createdSection: Section = {
    id: createSectionId(),
    title,
    order: sections.length,
    parentId,
    content: EMPTY_SECTION_CONTENT,
  };

  const updatedGroups = groups.map((group) =>
    group.parent.id === parentId
      ? { ...group, children: [...group.children, createdSection] }
      : group
  );

  const updatedSections = reindexSections(flattenSectionGroups(updatedGroups));
  const persistedSection =
    updatedSections.find((section) => section.id === createdSection.id) || null;

  return { sections: updatedSections, createdSection: persistedSection };
};

export const removeSectionWithChildren = (
  sections: Section[],
  sectionId: string
): Section[] => {
  const groups = buildSectionGroups(sections);
  const parentGroup = groups.find((group) => group.parent.id === sectionId);

  if (parentGroup) {
    return reindexSections(
      flattenSectionGroups(
        groups.filter((group) => group.parent.id !== sectionId)
      )
    );
  }

  return reindexSections(
    flattenSectionGroups(
      groups.map((group) => ({
        ...group,
        children: group.children.filter((child) => child.id !== sectionId),
      }))
    )
  );
};

const moveRelative = <T extends { id: string }>(
  items: T[],
  draggedId: string,
  targetId: string,
  position: "above" | "below"
): T[] => {
  const dragIndex = items.findIndex((item) => item.id === draggedId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (dragIndex === -1 || targetIndex === -1 || dragIndex === targetIndex) {
    return items;
  }

  const reordered = [...items];
  const [draggedItem] = reordered.splice(dragIndex, 1);

  let insertionIndex = targetIndex;
  if (position === "above") {
    insertionIndex = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
  } else {
    insertionIndex = dragIndex < targetIndex ? targetIndex : targetIndex + 1;
  }

  const clampedIndex = Math.max(0, Math.min(insertionIndex, reordered.length));
  reordered.splice(clampedIndex, 0, draggedItem);

  return reordered;
};

export const isHierarchyDropAllowed = (
  dragged: SectionDragItem,
  target: SectionDragItem
): boolean => {
  if (dragged.kind === "parent") {
    return target.kind === "parent";
  }

  return (
    dragged.kind === "child" &&
    target.kind === "child" &&
    dragged.parentId !== null &&
    dragged.parentId === target.parentId
  );
};

export const reorderSectionsByDrag = (
  sections: Section[],
  dragged: SectionDragItem,
  target: SectionDragItem,
  position: "above" | "below"
): Section[] => {
  if (!isHierarchyDropAllowed(dragged, target)) {
    return normalizeSections(sections);
  }

  const groups = buildSectionGroups(sections);

  if (dragged.kind === "parent" && target.kind === "parent") {
    const reorderedParents = moveRelative(
      groups.map((group) => group.parent),
      dragged.sectionId,
      target.sectionId,
      position
    );

    const groupByParentId = new Map(
      groups.map((group) => [group.parent.id, group] as const)
    );
    const reorderedGroups = reorderedParents
      .map((parent) => groupByParentId.get(parent.id))
      .filter((group): group is SectionGroup => Boolean(group));

    return reindexSections(flattenSectionGroups(reorderedGroups));
  }

  if (
    dragged.kind === "child" &&
    target.kind === "child" &&
    dragged.parentId !== null
  ) {
    const reorderedGroups = groups.map((group) => {
      if (group.parent.id !== dragged.parentId) {
        return group;
      }

      const reorderedChildren = moveRelative(
        group.children,
        dragged.sectionId,
        target.sectionId,
        position
      );

      return { ...group, children: reorderedChildren };
    });

    return reindexSections(flattenSectionGroups(reorderedGroups));
  }

  return normalizeSections(sections);
};
