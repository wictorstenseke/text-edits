import { type ReactNode, type RefObject, useMemo } from "react";

import { PageContainer } from "./PageContainer";

import type { SectionKind, SectionGroup } from "@/lib/sectionHierarchy";
import type { Section } from "@/types/document";

interface DocumentPreviewPaneProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  documentContainerRef: RefObject<HTMLDivElement | null>;
  pageWidth: "narrow" | "medium" | "wide";
  title: string;
  sectionGroups: SectionGroup[];
  renderSectionBlock: (section: Section, kind: SectionKind) => ReactNode;
}

export const DocumentPreviewPane = ({
  scrollContainerRef,
  documentContainerRef,
  pageWidth,
  title,
  sectionGroups,
  renderSectionBlock,
}: DocumentPreviewPaneProps) => {
  // Group sections into pages for better visual preview
  // This provides an approximate view of how content will paginate in PDF
  const pagesWithContent = useMemo(() => {
    const pages: Array<{ pageNumber: number; content: ReactNode }> = [];
    
    // Split sections across multiple pages for better preview
    // Grouping strategy: ~3-4 sections per page for reasonable pagination
    const sectionsPerPage = 3;
    let currentPage = 1;
    let sectionsInCurrentPage: SectionGroup[] = [];
    
    sectionGroups.forEach((group, index) => {
      sectionsInCurrentPage.push(group);
      
      // Start a new page after every N sections or on the last section
      if (
        sectionsInCurrentPage.length >= sectionsPerPage ||
        index === sectionGroups.length - 1
      ) {
        const isFirstPage = currentPage === 1;
        pages.push({
          pageNumber: currentPage,
          content: (
            <>
              {isFirstPage && <h1 className="text-3xl font-semibold mb-6">{title}</h1>}
              {sectionsInCurrentPage.map((grp) => (
                <div key={grp.parent.id} className="mb-2">
                  {renderSectionBlock(grp.parent, "parent")}
                  {grp.children.length > 0 && (
                    <div className="ml-6 mt-2 border-l border-border/60 pl-4">
                      {grp.children.map((child) => (
                        <div key={child.id}>{renderSectionBlock(child, "child")}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ),
        });
        
        sectionsInCurrentPage = [];
        currentPage++;
      }
    });
    
    return pages;
  }, [title, sectionGroups, renderSectionBlock]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-muted/50">
      <div ref={documentContainerRef} className="py-8">
        {pagesWithContent.map((page) => (
          <PageContainer
            key={page.pageNumber}
            pageNumber={page.pageNumber}
            pageWidth={pageWidth}
          >
            {page.content}
          </PageContainer>
        ))}
      </div>
    </div>
  );
};
