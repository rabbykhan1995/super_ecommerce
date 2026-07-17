import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  InsertTable,
  codeBlockPlugin,
  InsertCodeBlock,
  codeMirrorPlugin,
  frontmatterPlugin,
  InsertFrontmatter,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import {type FC, type ForwardedRef, useEffect, useMemo, useState } from "react";

interface EditorProps {
  markdown: string;
  editorRef?: ForwardedRef<MDXEditorMethods>;
  onChange?: (markdown: string) => void;
}

const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }) => {
  const initialMarkdown = useMemo(() => markdown, []);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      frontmatterPlugin(),
      imagePlugin({
        imageUploadHandler: async (file: File) => URL.createObjectURL(file),
      }),
      codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          js: "JavaScript",
          ts: "TypeScript",
          css: "CSS",
          html: "HTML",
          python: "Python",
          rust: "Rust",
        },
      }),
      diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
      directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper>
            <div className="flex flex-wrap items-center gap-1">
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <Separator />
              <InsertCodeBlock />
              <InsertFrontmatter />
            </div>
          </DiffSourceToggleWrapper>
        ),
      }),
    ],
    [] // ⚠️ এই খালি array-টাই মূল ফিক্স — একবারই তৈরি হবে
  );

  return (
    <div className={`mdxeditor-root flex-1 ${isDark ? "dark" : ""}`}>
      <MDXEditor
        ref={editorRef}
        markdown={initialMarkdown}
        onChange={onChange}
        className="mdxe-theme flex-1 border border-gray-300 dark:border-gray-700 p-2"
        plugins={plugins}
      />
    </div>
  );
};

export default Editor;
