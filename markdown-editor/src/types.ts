export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  darkMode?: boolean;
  className?: string;
}

export interface SelectionRange {
  from: number;
  to: number;
}

export interface FormatAction {
  name: string;
  label: string;
  icon: string;
  action: (text: string, selection: SelectionRange) => FormatResult;
}

export interface FormatResult {
  text: string;
  cursorOffset: number;
  selectionLength: number;
}
