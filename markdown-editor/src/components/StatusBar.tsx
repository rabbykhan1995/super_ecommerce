import { FileText, Type } from "lucide-react";
import { getWordCount, getCharCount } from "../utils/formatting";

interface StatusBarProps {
  value: string;
  cursorLine?: number;
  cursorCol?: number;
}

export default function StatusBar({ value, cursorLine = 1, cursorCol = 1 }: StatusBarProps) {
  const words = getWordCount(value);
  const chars = getCharCount(value);

  return (
    <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Type size={12} />
          {words} {words === 1 ? "word" : "words"}
        </span>
        <span className="flex items-center gap-1">
          <FileText size={12} />
          {chars} {chars === 1 ? "char" : "chars"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Ln {cursorLine}, Col {cursorCol}</span>
        <span>Markdown</span>
      </div>
    </div>
  );
}
