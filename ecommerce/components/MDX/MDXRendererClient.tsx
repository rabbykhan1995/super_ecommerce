"use client";

import { useState, useEffect } from "react";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { mdxComponents } from "./MDXComponents";
import { remarkAdmonition } from "./remark-admonition";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface Props {
  source: string;
}

export default function MdxRendererClient({ source }: Props) {
  const [compiled, setCompiled] = useState<MDXRemoteSerializeResult | null>(null);

  useEffect(() => {
    serialize(source, {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkDirective, remarkAdmonition],
      },
    }).then(setCompiled);
  }, [source]);

  if (!compiled) return null;

  return (
    <div className="prose prose-slate lg:prose-base max-w-none prose-headings:font-bold prose-a:text-blue-600">
      <MDXRemote {...compiled} components={mdxComponents} />
    </div>
  );
}
