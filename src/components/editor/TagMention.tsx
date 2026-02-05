import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { Extension } from "@tiptap/core";
import { Mention } from "@tiptap/extension-mention";
import { type NodeViewRendererProps } from "@tiptap/react";
import { createRoot, type Root } from "react-dom/client";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { cn } from "@/lib/utils";

export interface TagItem {
  key: string;
  value: string;
}

export interface TagSuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface TagSuggestionListProps {
  items: TagItem[];
  command: (item: TagItem) => void;
}

export const TagSuggestionList = forwardRef<
  TagSuggestionListRef,
  TagSuggestionListProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prevItemsRef = useRef(items);

  // Reset selection when items change
  // Using useSyncExternalStore-like pattern with refs
  // eslint-disable-next-line react-hooks/refs
  if (items !== prevItemsRef.current) {
    // eslint-disable-next-line react-hooks/refs
    prevItemsRef.current = items;
    if (selectedIndex >= items.length) {
      setSelectedIndex(0);
    }
  }

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-popover border border-border rounded-md shadow-lg overflow-hidden">
      {items.length ? (
        items.map((item, index) => (
          <button
            key={item.key}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-left",
              "hover:bg-accent hover:text-accent-foreground",
              index === selectedIndex && "bg-accent text-accent-foreground"
            )}
            onClick={() => selectItem(index)}
            type="button"
          >
            <span className="font-mono text-xs bg-muted px-1 rounded">
              {item.key}
            </span>
            <span className="text-muted-foreground">{item.value}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          No tags found
        </div>
      )}
    </div>
  );
});

TagSuggestionList.displayName = "TagSuggestionList";

// Extension to highlight freetext tag names in edit mode
export const createTagHighlightExtension = (tags: TagItem[]) => {
  const tagKeys = tags.map((tag) => tag.key);

  return Extension.create({
    name: "tagHighlight",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("tagHighlight"),
          state: {
            init() {
              return DecorationSet.empty;
            },
            apply(tr, decorationSet) {
              const decorations: Decoration[] = [];

              // Only apply decorations if document changed
              if (!tr.docChanged) {
                return decorationSet;
              }

              // Track mention node positions to avoid highlighting inside them
              const mentionRanges: Array<{ from: number; to: number }> = [];
              tr.doc.descendants((node, pos) => {
                if (node.type.name === "mention") {
                  mentionRanges.push({ from: pos, to: pos + node.nodeSize });
                  return false; // Don't descend into mention nodes
                }
              });

              // Check if a position is inside a mention node
              const isInsideMention = (pos: number): boolean => {
                return mentionRanges.some(
                  (range) => pos >= range.from && pos < range.to
                );
              };

              tr.doc.descendants((node, pos) => {
                // Only process text nodes
                if (node.isText) {
                  const text = node.text || "";

                  // Check each tag key
                  tagKeys.forEach((tagKey) => {
                    // Escape special regex characters
                    const escapedKey = tagKey.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      "\\$&"
                    );
                    const regex = new RegExp(`\\b${escapedKey}\\b`, "g");
                    let match;

                    while ((match = regex.exec(text)) !== null) {
                      const from = pos + match.index;
                      const to = from + match[0].length;

                      // Skip if this text is inside a mention node
                      if (isInsideMention(from)) {
                        continue;
                      }

                      // Create decoration with yellow highlight
                      decorations.push(
                        Decoration.inline(from, to, {
                          class: "tag-freetext-highlight",
                          "data-tag-key": tagKey,
                        })
                      );
                    }
                  });
                }
              });

              return DecorationSet.create(tr.doc, decorations);
            },
          },
          props: {
            decorations(state) {
              return this.getState(state);
            },
          },
        }),
      ];
    },
  });
};

export const createTagMentionExtension = (tags: TagItem[]) => {
  return Mention.configure({
    HTMLAttributes: {
      class: "tag-mention tag-mention-edit",
    },
    renderText({ node }) {
      const tagKey = node.attrs.id as string;
      return `/${tagKey}`;
    },
    renderHTML({ node }) {
      const tagKey = node.attrs.id as string;
      return `/${tagKey}`;
    },
    suggestion: {
      char: "/",
      items: ({ query }) => {
        return tags
          .filter(
            (tag) =>
              tag.key.toLowerCase().includes(query.toLowerCase()) ||
              tag.value.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10);
      },
      render: () => {
        let component: HTMLElement | null = null;
        let reactRoot: Root | null = null;
        let ref: TagSuggestionListRef | null = null;

        return {
          onStart: (props) => {
            component = document.createElement("div");
            component.style.position = "absolute";
            component.style.zIndex = "1000";
            document.body.appendChild(component);

            reactRoot = createRoot(component);
            reactRoot.render(
              <TagSuggestionList
                ref={(r) => {
                  ref = r;
                }}
                items={props.items as TagItem[]}
                command={(item) => {
                  props.command({ id: item.key, label: item.value });
                }}
              />
            );

            const rect = props.clientRect?.();
            if (rect && component) {
              component.style.left = `${rect.left}px`;
              component.style.top = `${rect.bottom + 4}px`;
            }
          },

          onUpdate: (props) => {
            if (reactRoot) {
              reactRoot.render(
                <TagSuggestionList
                  ref={(r) => {
                    ref = r;
                  }}
                  items={props.items as TagItem[]}
                  command={(item) => {
                    props.command({ id: item.key, label: item.value });
                  }}
                />
              );
            }

            const rect = props.clientRect?.();
            if (rect && component) {
              component.style.left = `${rect.left}px`;
              component.style.top = `${rect.bottom + 4}px`;
            }
          },

          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              if (component && reactRoot) {
                reactRoot.unmount();
                component.remove();
                component = null;
                reactRoot = null;
              }
              return true;
            }
            return ref?.onKeyDown(props) ?? false;
          },

          onExit: () => {
            if (component && reactRoot) {
              reactRoot.unmount();
              component.remove();
              component = null;
              reactRoot = null;
            }
          },
        };
      },
    },
  });
};

// Tag pill renderer for display mode
export const TagPill = ({
  tagKey,
  tagValue,
}: {
  tagKey: string;
  tagValue: string;
}) => {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-primary/10 text-primary text-sm font-medium border border-primary/20"
      data-tag-key={tagKey}
    >
      {tagValue}
    </span>
  );
};

// NodeView component for tag mentions in TipTap
export const TagMentionNodeView = ({ node }: NodeViewRendererProps) => {
  const tagKey = node.attrs.id as string;

  return (
    <span
      className="tag-mention-edit bg-yellow-200 dark:bg-yellow-900/30 px-1 rounded"
      data-tag-key={tagKey}
      contentEditable={false}
    >
      /{tagKey}
    </span>
  );
};
