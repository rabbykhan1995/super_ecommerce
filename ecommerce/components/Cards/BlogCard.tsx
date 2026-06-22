"use client";
import Helper from "@/helper/helper";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogCardProps {
  title: string;
  shortDescription: string;
  thumbnail?: string | null;
  slug: string;
}

const BlogCard = ({
  title,
  shortDescription,
  thumbnail,
  slug,
}: BlogCardProps) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden">
      {/* 1. Thumbnail Section */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        
          <Image
            src={Helper.getImage(thumbnail??null)}
            alt={title}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 "
          />
      
      </div>

      {/* 2. Content Section */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <Link
          href={`/blog/${slug}`}
          className="font-bold text-slate-800 text-lg line-clamp-2"
        >
          {title}
        </Link>

        {/* Short Description */}
        <div className="prose prose-sm max-w-none prose-p:text-slate-400 prose-p:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {shortDescription}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
