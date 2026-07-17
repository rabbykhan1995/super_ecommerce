import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface PreviewPaneProps {
  value: string;
  isDark: boolean;
}

export default function PreviewPane({ value, isDark }: PreviewPaneProps) {
  return (
    <div
      className={`h-full overflow-y-auto px-8 py-6 prose prose-sm max-w-none
        prose-headings:scroll-mt-4
        prose-pre:bg-gray-900 prose-pre:text-gray-100
        prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-lg prose-img:shadow-md
        prose-table:text-sm
        ${isDark ? "prose-invert prose-pre:bg-gray-800 prose-code:text-pink-400 prose-a:text-blue-400" : ""}`}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {value || "_Start writing to see the preview..._"}
      </Markdown>
    </div>
  );
}
