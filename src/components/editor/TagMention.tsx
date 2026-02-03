import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { Mention } from "@tiptap/extension-mention";
import { type NodeViewRendererProps } from "@tiptap/react";
import { createRoot, type Root } from "react-dom/client";

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

export const createTagMentionExtension = (tags: TagItem[]) => {
  return Mention.configure({
    HTMLAttributes: {
      class: "tag-mention",
    },
    renderText({ node }) {
      return node.attrs.label ?? node.attrs.id;
    },
    renderHTML({ node }) {
      return node.attrs.label ?? node.attrs.id;
    },
    suggestion: {
      char: "@",
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
  const tagValue = (node.attrs.label as string) || tagKey;

  return (
    <span
      className="tag-pill inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-primary/10 text-primary text-sm font-medium border border-primary/20"
      data-tag-key={tagKey}
      contentEditable={false}
    >
      {tagValue}
    </span>
  );
};
