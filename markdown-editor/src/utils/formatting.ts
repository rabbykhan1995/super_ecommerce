import type { SelectionRange, FormatResult } from "../types";

function wrapSelection(
  text: string,
  selection: SelectionRange,
  prefix: string,
  suffix: string,
  placeholder: string
): FormatResult {
  const selected = text.slice(selection.from, selection.to);
  const content = selected || placeholder;
  const newText =
    text.slice(0, selection.from) +
    prefix +
    content +
    suffix +
    text.slice(selection.to);

  if (selected) {
    return {
      text: newText,
      cursorOffset: selection.from + prefix.length + content.length + suffix.length,
      selectionLength: 0,
    };
  }

  return {
    text: newText,
    cursorOffset: selection.from + prefix.length,
    selectionLength: content.length,
  };
}

function insertAtLineStart(
  text: string,
  selection: SelectionRange,
  prefix: string,
  placeholder: string
): FormatResult {
  const lineStart = text.lastIndexOf("\n", selection.from - 1) + 1;
  const selected = text.slice(selection.from, selection.to);
  const content = selected || placeholder;
  const newText =
    text.slice(0, lineStart) +
    prefix +
    text.slice(lineStart, selection.from) +
    content +
    text.slice(selection.to);

  return {
    text: newText,
    cursorOffset: lineStart + prefix.length,
    selectionLength: content.length,
  };
}

export function insertBold(
  text: string,
  selection: SelectionRange
): FormatResult {
  return wrapSelection(text, selection, "**", "**", "bold text");
}

export function insertItalic(
  text: string,
  selection: SelectionRange
): FormatResult {
  return wrapSelection(text, selection, "*", "*", "italic text");
}

export function insertStrikethrough(
  text: string,
  selection: SelectionRange
): FormatResult {
  return wrapSelection(text, selection, "~~", "~~", "strikethrough");
}

export function insertCode(
  text: string,
  selection: SelectionRange
): FormatResult {
  return wrapSelection(text, selection, "`", "`", "code");
}

export function insertHeading(
  text: string,
  selection: SelectionRange,
  level: 1 | 2 | 3 | 4 | 5 | 6
): FormatResult {
  const prefix = "#".repeat(level) + " ";
  return insertAtLineStart(text, selection, prefix, "Heading");
}

export function insertLink(
  text: string,
  selection: SelectionRange
): FormatResult {
  const selected = text.slice(selection.from, selection.to);
  const label = selected || "link text";
  const newText =
    text.slice(0, selection.from) +
    "[" +
    label +
    "](url)" +
    text.slice(selection.to);

  if (selected) {
    const urlStart = selection.from + label.length + 3;
    return {
      text: newText,
      cursorOffset: urlStart,
      selectionLength: 3,
    };
  }

  return {
    text: newText,
    cursorOffset: selection.from + 1,
    selectionLength: label.length,
  };
}

export function insertImage(
  text: string,
  selection: SelectionRange
): FormatResult {
  const selected = text.slice(selection.from, selection.to);
  const alt = selected || "alt text";
  const newText =
    text.slice(0, selection.from) +
    "![" +
    alt +
    "](url)" +
    text.slice(selection.to);

  return {
    text: newText,
    cursorOffset: selection.from + alt.length + 4,
    selectionLength: 3,
  };
}

export function insertBlockquote(
  text: string,
  selection: SelectionRange
): FormatResult {
  return insertAtLineStart(text, selection, "> ", "blockquote");
}

export function insertUnorderedList(
  text: string,
  selection: SelectionRange
): FormatResult {
  return insertAtLineStart(text, selection, "- ", "list item");
}

export function insertOrderedList(
  text: string,
  selection: SelectionRange
): FormatResult {
  return insertAtLineStart(text, selection, "1. ", "list item");
}

export function insertTaskList(
  text: string,
  selection: SelectionRange
): FormatResult {
  return insertAtLineStart(text, selection, "- [ ] ", "task item");
}

export function insertCodeBlock(
  text: string,
  selection: SelectionRange
): FormatResult {
  const selected = text.slice(selection.from, selection.to);
  const content = selected || "code here";
  const newText =
    text.slice(0, selection.from) +
    "\n```\n" +
    content +
    "\n```\n" +
    text.slice(selection.to);

  return {
    text: newText,
    cursorOffset: selection.from + 5,
    selectionLength: content.length,
  };
}

export function insertHorizontalRule(
  text: string,
  selection: SelectionRange
): FormatResult {
  const lineStart = text.lastIndexOf("\n", selection.from - 1) + 1;
  const newText =
    text.slice(0, lineStart) +
    "\n---\n" +
    text.slice(selection.from);

  return {
    text: newText,
    cursorOffset: lineStart + 5,
    selectionLength: 0,
  };
}

export function insertTable(
  text: string,
  selection: SelectionRange
): FormatResult {
  const table = "\n| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n";
  const newText = text.slice(0, selection.from) + table + text.slice(selection.to);

  return {
    text: newText,
    cursorOffset: selection.from + 2,
    selectionLength: 6,
  };
}

export function getWordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function getCharCount(text: string): number {
  return text.length;
}
