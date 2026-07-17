import { useState, useCallback, useRef } from "react";
import EditorToolbar from "./EditorToolbar";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";
import StatusBar from "./StatusBar";
import { useTheme } from "../hooks/useTheme";
import { useMarkdownEditor } from "../hooks/useMarkdownEditor";
import { downloadMarkdown, downloadHtml, copyToClipboard } from "../utils/export";
import type { MarkdownEditorProps, SelectionRange, FormatResult } from "../types";

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = "600px",
  darkMode: forcedDarkMode,
  className = "",
}: MarkdownEditorProps) {
  const isDark = useTheme(forcedDarkMode);
  const { applyFormat } = useMarkdownEditor();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selection, setSelection] = useState<SelectionRange>({ from: 0, to: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFormat = useCallback(
    (
      text: string,
      sel: SelectionRange,
      formatter: (text: string, selection: SelectionRange) => FormatResult
    ): string => {
      return applyFormat(text, sel, formatter);
    },
    [applyFormat]
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  const handleToggleTheme = useCallback(() => {
    document.documentElement.classList.toggle("dark");
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleExport = useCallback(
    (type: "md" | "html") => {
      if (type === "md") {
        downloadMarkdown(value);
      } else {
        downloadHtml(value);
      }
    },
    [value]
  );

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const handleEditorChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  const handleSelectionChange = useCallback((from: number, to: number) => {
    setSelection({ from, to });
  }, []);

  const heightStyle = isFullscreen ? "100vh" : height;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      } ${className}`}
      style={{ height: heightStyle }}
    >
      <EditorToolbar
        value={value}
        selection={selection}
        isDark={isDark}
        isFullscreen={isFullscreen}
        onFormat={handleFormat}
        onValueChange={handleValueChange}
        onToggleTheme={handleToggleTheme}
        onToggleFullscreen={handleToggleFullscreen}
        onExport={handleExport}
        onCopy={handleCopy}
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 border-r border-gray-200 dark:border-gray-700">
          <EditorPane
            value={value}
            onChange={handleEditorChange}
            onSelectionChange={handleSelectionChange}
            isDark={isDark}
            placeholder={placeholder}
          />
        </div>
        <div className="flex-1 min-w-0">
          <PreviewPane value={value} isDark={isDark} />
        </div>
      </div>

      <StatusBar value={value} cursorLine={1} cursorCol={1} />

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg z-50 animate-pulse">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
