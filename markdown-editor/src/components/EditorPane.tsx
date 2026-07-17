import { useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (from: number, to: number) => void;
  isDark: boolean;
  placeholder?: string;
}

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    overflow: "auto",
  },
  ".cm-content": {
    padding: "12px 0",
  },
  ".cm-gutters": {
    borderRight: "1px solid",
    minWidth: "40px",
  },
});

export default function EditorPane({
  value,
  onChange,
  onSelectionChange,
  isDark,
  placeholder,
}: EditorPaneProps) {
  const viewRef = useRef<EditorView | null>(null);

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const handleCreateEditor = useCallback(
    (view: EditorView) => {
      viewRef.current = view;
    },
    []
  );

  const selectionExtension = EditorView.updateListener.of((update) => {
    if ((update.selectionSet || update.docChanged) && onSelectionChange) {
      const sel = update.state.selection.main;
      onSelectionChange(sel.from, sel.to);
    }
  });

  return (
    <div className="h-full overflow-hidden">
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          baseTheme,
          EditorView.lineWrapping,
          selectionExtension,
        ]}
        theme={isDark ? "dark" : "light"}
        placeholder={placeholder || "Start writing markdown..."}
        className="h-full"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: false,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
          tabSize: 2,
        }}
        onCreateEditor={handleCreateEditor}
      />
    </div>
  );
}
