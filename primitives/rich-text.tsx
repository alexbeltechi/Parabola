"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Bold, Columns3, Heading2, Italic, Link2, List, ListOrdered, Rows3, Table2, Trash2 } from "lucide-react";
import { cn } from "../cn";
import { DsButton } from "./button";
import { DS_PROSE_CLASS } from "./prose";
import { DS_TRAY_CLASS } from "./tray";

/**
 * Parabola rich text: the bare field (no box, text straight on the page, see
 * DsTextarea `bare`) with formatting, for writing surfaces like post blocks.
 * Text reads in the shared prose style (DS_PROSE_CLASS), so what you write
 * looks like the published page.
 *
 * Formatting stays out of the way: select text and a small tray offers title,
 * bold, italic, link, lists and a table. In a table the tray adds a row or a
 * column, or deletes the table. Markdown shortcuts work as you type
 * (`## ` for a title, `- ` or `1. ` for lists, `**bold**`, `*italic*`).
 * Reads and writes HTML; an empty field reports "".
 */
export function DsRichText({
  value,
  onValueChange,
  placeholder = "Write something...",
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}) {
  // Keep the latest callback without recreating the editor.
  const onChange = React.useRef(onValueChange);
  React.useLayoutEffect(() => {
    onChange.current = onValueChange;
  });

  const editor = useEditor({
    // Next renders on the server first; let the client build the editor.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
        // Not offered in the tray; keep the HTML simple.
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        underline: false,
      }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(DS_PROSE_CLASS, "text-ds-fg outline-none min-h-7"),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange.current(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Take outside changes (undo of a block, a reload) without fighting the cursor.
  React.useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  return (
    <div
      data-slot="ds-rich-text"
      className={cn(
        "w-full",
        // Placeholder on the empty first paragraph.
        "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-ds-fg-subtle [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
        className
      )}
    >
      {editor && <FormatTray editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

/** The selection tray: small icon buttons, pressed when the format is on. */
function FormatTray({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      heading: editor.isActive("heading", { level: 2 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      link: editor.isActive("link"),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      table: editor.isActive("table"),
    }),
  });

  const toggleLink = () => {
    if (state.link) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = window.prompt("Link to", "https://");
    if (href && href !== "https://") editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const tools = [
    { label: "Title", icon: Heading2, on: state.heading, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bold", icon: Bold, on: state.bold, run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, on: state.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Link", icon: Link2, on: state.link, run: toggleLink },
    { label: "Bulleted list", icon: List, on: state.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, on: state.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
    {
      label: "Table",
      icon: Table2,
      on: state.table,
      run: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];

  // Inside a table, the tray works on the table instead.
  const tableTools = [
    { label: "Add column", icon: Columns3, run: () => editor.chain().focus().addColumnAfter().run() },
    { label: "Add row", icon: Rows3, run: () => editor.chain().focus().addRowAfter().run() },
    { label: "Delete table", icon: Trash2, run: () => editor.chain().focus().deleteTable().run() },
  ];
  const shown = state.table ? tableTools.map((t) => ({ ...t, on: false })) : tools;
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      className={cn(DS_TRAY_CLASS, "flex items-center gap-1")}
    >
      {shown.map((tool) => (
        <DsButton
          key={tool.label}
          size="small"
          variant={tool.on ? "default" : "text"}
          pressed={tool.on}
          iconLeft={tool.icon}
          aria-label={tool.label}
          title={tool.label}
          // Keep the selection while clicking.
          onMouseDown={(e) => e.preventDefault()}
          onClick={tool.run}
        />
      ))}
    </BubbleMenu>
  );
}
