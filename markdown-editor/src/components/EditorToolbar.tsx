import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Quote,
  List,
  ListOrdered,
  ListChecks,
  CodeSquare,
  Minus,
  Table,
  Copy,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { SelectionRange, FormatResult } from "../types";

interface ToolbarAction {
  icon: LucideIcon;
  label: string;
  action: (text: string, selection: SelectionRange) => FormatResult;
  group: number;
}

interface EditorToolbarProps {
  value: string;
  selection: SelectionRange;
  isDark: boolean;
  isFullscreen: boolean;
  onFormat: (
    text: string,
    selection: SelectionRange,
    formatter: (text: string, selection: SelectionRange) => FormatResult
  ) => string;
  onValueChange: (value: string) => void;
  onToggleTheme: () => void;
  onToggleFullscreen: () => void;
  onExport: (type: "md" | "html") => void;
  onCopy: () => void;
}

import {
  insertBold,
  insertItalic,
  insertStrikethrough,
  insertCode,
  insertHeading,
  insertLink,
  insertImage,
  insertBlockquote,
  insertUnorderedList,
  insertOrderedList,
  insertTaskList,
  insertCodeBlock,
  insertHorizontalRule,
  insertTable,
} from "../utils/formatting";

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: "Bold", action: insertBold, group: 1 },
  { icon: Italic, label: "Italic", action: insertItalic, group: 1 },
  { icon: Strikethrough, label: "Strikethrough", action: insertStrikethrough, group: 1 },
  { icon: Code, label: "Inline Code", action: insertCode, group: 1 },
  { icon: Heading1, label: "Heading 1", action: (t, s) => insertHeading(t, s, 1), group: 2 },
  { icon: Heading2, label: "Heading 2", action: (t, s) => insertHeading(t, s, 2), group: 2 },
  { icon: Heading3, label: "Heading 3", action: (t, s) => insertHeading(t, s, 3), group: 2 },
  { icon: Link, label: "Link", action: insertLink, group: 3 },
  { icon: Image, label: "Image", action: insertImage, group: 3 },
  { icon: Quote, label: "Blockquote", action: insertBlockquote, group: 4 },
  { icon: List, label: "Unordered List", action: insertUnorderedList, group: 4 },
  { icon: ListOrdered, label: "Ordered List", action: insertOrderedList, group: 4 },
  { icon: ListChecks, label: "Task List", action: insertTaskList, group: 4 },
  { icon: CodeSquare, label: "Code Block", action: insertCodeBlock, group: 5 },
  { icon: Table, label: "Table", action: insertTable, group: 5 },
  { icon: Minus, label: "Horizontal Rule", action: insertHorizontalRule, group: 5 },
];

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    >
      <Icon size={16} />
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5" />;
}

function DropdownMenu({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

export default function EditorToolbar({
  value,
  selection,
  isDark,
  isFullscreen,
  onFormat,
  onValueChange,
  onToggleTheme,
  onToggleFullscreen,
  onExport,
  onCopy,
}: EditorToolbarProps) {
  const handleFormat = (formatter: (text: string, selection: SelectionRange) => FormatResult) => {
    const newValue = onFormat(value, selection, formatter);
    onValueChange(newValue);
  };

  const groups = toolbarActions.reduce<number[]>((acc, action) => {
    if (!acc.includes(action.group)) acc.push(action.group);
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-wrap">
      {groups.map((group, i) => (
        <div key={group} className="flex items-center gap-0.5">
          {i > 0 && <ToolbarSeparator />}
          {toolbarActions
            .filter((a) => a.group === group)
            .map((action) => (
              <ToolbarButton
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={() => handleFormat(action.action)}
              />
            ))}
        </div>
      ))}

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <ToolbarSeparator />
        <DropdownMenu
          trigger={
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              Export <ChevronDown size={12} />
            </button>
          }
        >
          <button
            type="button"
            onClick={() => onExport("md")}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Download .md
          </button>
          <button
            type="button"
            onClick={() => onExport("html")}
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Download .html
          </button>
        </DropdownMenu>

        <ToolbarButton
          icon={Copy}
          label="Copy Markdown"
          onClick={onCopy}
        />

        <ToolbarButton
          icon={isDark ? Sun : Moon}
          label={isDark ? "Light Mode" : "Dark Mode"}
          onClick={onToggleTheme}
        />

        <ToolbarButton
          icon={isFullscreen ? Minimize2 : Maximize2}
          label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={onToggleFullscreen}
        />
      </div>
    </div>
  );
}
