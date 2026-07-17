import { useCallback, useRef } from "react";
import type { SelectionRange, FormatResult } from "../types";

export interface UseMarkdownEditorReturn {
  applyFormat: (
    text: string,
    selection: SelectionRange,
    formatter: (text: string, selection: SelectionRange) => FormatResult
  ) => string;
}

export function useMarkdownEditor(): UseMarkdownEditorReturn {
  const historyRef = useRef<string[]>([]);

  const applyFormat = useCallback(
    (
      text: string,
      selection: SelectionRange,
      formatter: (text: string, selection: SelectionRange) => FormatResult
    ): string => {
      historyRef.current.push(text);
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
      }
      const result = formatter(text, selection);
      return result.text;
    },
    []
  );

  return { applyFormat };
}
