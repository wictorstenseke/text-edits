import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

const PageBreakComponent = () => {
  return (
    <NodeViewWrapper>
      <div
        className="page-break my-8 flex items-center justify-center"
        contentEditable={false}
      >
        <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
        <span className="mx-4 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-muted-foreground/30">
          Page Break
        </span>
        <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
      </div>
    </NodeViewWrapper>
  );
};

export const PageBreakExtension = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  draggable: false,

  parseHTML() {
    return [
      {
        tag: "div[data-type=page-break]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "page-break" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakComponent);
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },
});
