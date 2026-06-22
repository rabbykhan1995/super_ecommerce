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
import {type FC, type ForwardedRef } from "react";

interface EditorProps {
  markdown: string;
  editorRef?: ForwardedRef<MDXEditorMethods>;
  onChange?: (markdown: string) => void;
}

const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }) => {
  return (
    <MDXEditor
      ref={editorRef}
      markdown={markdown}
      onChange={onChange}
      className="mdxe-theme flex-1 min-h-0"
      plugins={[
        // 1. Core Plugins
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),

        // 2. Advanced Features
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        frontmatterPlugin(), // Blog er metadata (SEO) er jonno
        imagePlugin({
          imageUploadHandler: async (file) => {
            // Ekhane image upload logic hobe
            return URL.createObjectURL(file);
          },
        }),

        // 3. Code Blocks with Highlighting
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

        // 4. Source vs Visual view switch করার জন্য
        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),

        // 5. Directives (Alert/Admonitions er moto advanced jinish)
        directivesPlugin({
          directiveDescriptors: [AdmonitionDirectiveDescriptor],
        }),

        // 6. Complete Toolbar Setup
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
                {/* Markdown short-hand guide ba alert box add korar jonno niche buttons thakbe */}
              </div>
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  );
};

export default Editor;
