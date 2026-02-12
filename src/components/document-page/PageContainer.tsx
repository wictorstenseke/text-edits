import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  pageNumber: number;
  pageWidth: "narrow" | "medium" | "wide";
  className?: string;
}

/**
 * Represents a single page in the document preview with page numbering.
 * Provides visual page boundaries and page numbers to preview how content
 * will appear in the exported PDF.
 */
export const PageContainer = ({
  children,
  pageNumber,
  pageWidth,
  className,
}: PageContainerProps) => {
  // Convert mm to pixels at 96dpi: 1mm = 3.7795275591px
  // PDF uses 297mm height
  const pageHeightPx = 297 * 3.78; // ~1122px

  return (
    <div
      className={cn(
        "relative bg-background shadow-lg mb-8 mx-auto",
        "border border-border/30",
        pageWidth === "narrow" && "max-w-2xl",
        pageWidth === "medium" && "max-w-4xl",
        pageWidth === "wide" && "max-w-6xl",
        className
      )}
      style={{
        minHeight: `${pageHeightPx}px`,
      }}
    >
      {/* Page number in top right corner */}
      <div className="absolute top-6 right-8 text-sm text-muted-foreground/70 font-medium select-none">
        {pageNumber}
      </div>

      {/* Page content with padding matching PDF export */}
      <div
        className={cn(
          "h-full",
          pageWidth === "narrow" ? "px-8 py-10" : "px-6 py-8"
        )}
      >
        {children}
      </div>
    </div>
  );
};
