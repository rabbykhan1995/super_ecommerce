import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { mdxComponents } from "./MDXComponents";
import { remarkAdmonition } from "./remark-admonition";

interface Props {
  source: string;
}

export default function MdxRenderer({ source }: Props) {
  return (
    <div className="prose prose-slate lg:prose-base max-w-none prose-headings:font-bold prose-a:text-blue-600">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkDirective, remarkAdmonition],
          },
        }}
      />
    </div>
  );
}
