import { mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeSelection } from "@tiptap/pm/state";
import { ResizableImage } from "tiptap-extension-resizable-image";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageResizeWithAlign: {
      setImageAlign: (align: "left" | "center" | "right") => ReturnType;
    };
  }
}

export const ImageResizeWithAlign = ResizableImage.extend({
  name: "resizableImage",

  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "left",
        parseHTML: (element) => {
          const wrapper = element.parentElement;
          if (wrapper?.style.textAlign) {
            return wrapper.style.textAlign;
          }
          return element.getAttribute("data-align") || "left";
        },
        renderHTML: (attributes) => {
          return {
            "data-align": attributes.align || "left",
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() || [];
    
    return [
      ...parentPlugins,
      new Plugin({
        key: new PluginKey("imageAlignmentSync"),
        view: () => ({
          update: (view) => {
            // Sync alignment attributes to DOM for visual feedback
            view.state.doc.descendants((node, pos) => {
              if (node.type.name === "resizableImage") {
                const dom = view.nodeDOM(pos);
                if (dom instanceof HTMLElement) {
                  const align = node.attrs.align || "left";
                  
                  // Find the wrapper created by ResizableImage
                  const wrapper = dom.closest("[data-node-view-wrapper]") || dom;
                  if (wrapper instanceof HTMLElement) {
                    wrapper.setAttribute("data-align", align);
                    // Apply text-align directly for immediate visual feedback
                    wrapper.style.textAlign = align;
                    wrapper.style.display = "block";
                  }
                  
                  // Also check for img tag directly and apply to its parent
                  const img = dom.querySelector("img") || (dom.tagName === "IMG" ? dom : null);
                  if (img && img.parentElement) {
                    img.parentElement.style.textAlign = align;
                  }
                }
              }
            });
          },
        }),
      }),
      new Plugin({
        key: new PluginKey("maintainImageSelection"),
        appendTransaction: (transactions, oldState, newState) => {
          // Check if any transaction updated a resizableImage node's attributes (width/height change from resize)
          const hasImageUpdate = transactions.some((tr) => {
            let hasUpdate = false;
            tr.docChanged && tr.steps.forEach((step: any) => {
              if (step.jsonID === "setNodeMarkup" || step.jsonID === "replace") {
                const nodePos = step.pos;
                if (nodePos !== undefined) {
                  const node = tr.doc.nodeAt(nodePos);
                  if (node && node.type.name === "resizableImage") {
                    hasUpdate = true;
                  }
                }
              }
            });
            return hasUpdate;
          });

          // If an image was updated and selection changed, restore selection
          if (hasImageUpdate && oldState.selection.from !== newState.selection.from) {
            const { from } = oldState.selection;
            const node = newState.doc.nodeAt(from);
            
            if (node && node.type.name === "resizableImage") {
              const tr = newState.tr;
              tr.setSelection(NodeSelection.create(newState.doc, from));
              return tr;
            }
          }
          
          return null;
        },
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: "div[style*='text-align'] img",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const element = node as HTMLElement;
          const wrapper = element.parentElement;
          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
            width: element.getAttribute("width"),
            height: element.getAttribute("height"),
            align: wrapper?.style.textAlign || "left",
            "data-keep-ratio": element.getAttribute("data-keep-ratio") || "true",
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const element = node as HTMLElement;
          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
            width: element.getAttribute("width"),
            height: element.getAttribute("height"),
            align: element.getAttribute("data-align") || "left",
            "data-keep-ratio": element.getAttribute("data-keep-ratio") || "true",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes["data-align"] || HTMLAttributes.align || "left";
    delete HTMLAttributes["data-align"];

    return [
      "div",
      {
        style: `text-align: ${align}`,
        class: "image-wrapper",
      },
      ["img", mergeAttributes(HTMLAttributes)],
    ];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align: "left" | "center" | "right") =>
        ({ state, chain }: { state: any; chain: any }) => {
          // Get current selection position
          const { from } = state.selection;
          
          // Update attributes and maintain selection
          return chain()
            .updateAttributes(this.name, { align })
            .setNodeSelection(from)
            .run();
        },
    };
  },
});
