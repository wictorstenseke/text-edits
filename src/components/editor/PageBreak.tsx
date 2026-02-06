/* eslint-disable react-refresh/only-export-components -- TipTap extension modules intentionally export non-component APIs alongside local node-view components. */

import { Node, mergeAttributes, type CommandProps } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    insertPageBreak: {
      insertPageBreak: () => ReturnType;
    };
  }
}

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
    const name = this.name;
    return {
      insertPageBreak: () => (props: CommandProps) => {
        return props.commands.insertContent({ type: name });
      },
    };
  },
});
