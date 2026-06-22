"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Save, Tag as TagIcon, X } from "lucide-react";
import api from "@/utils/apiconfig";
import ImageUploader from "@/components/Dashboard/ImageUploader";

// Editor-ke dynamic import kora holo
const MDXEditorComponent = dynamic(() => import("@/components/MDX/MDXEditor"), {
  ssr: false,
});

const NewBlog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, ""),
    );
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const publish = async () => {
    const blog: any = {
      description,
      shortDescription,
      tags,
      title,
      thumbnail,
    };

    const res = await api.post(`/blog/create`, blog);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}

        <h1 className="text-2xl font-bold">New Blog</h1>
      


      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Title Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
            <input
              type="text"
              placeholder="Post Title..."
              className="w-full text-3xl font-bold outline-none border-none placeholder:text-gray-300"
              value={title}
              onChange={handleTitleChange}
            />
            <div className="text-sm text-gray-400 mt-2 font-mono">
              Slug: {slug}
            </div>
          </div>
          <ImageUploader
            label="Thumbnail"
            value={thumbnail}
            onChange={(val) => setThumbnail(val as string)}
          />
          <h1>Short Description</h1>
          {/* MDX Editor Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col min-h-0">
            <MDXEditorComponent
              markdown={shortDescription}
              onChange={(v) => setShortDescription(v)}
            />
          </div>
          <h1>Full Description</h1>
          {/* MDX Editor Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col min-h-0">
            <MDXEditorComponent
              markdown={description}
              onChange={(v) => setDescription(v)}
            />
          </div>{" "}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <TagIcon size={16} /> Tags
            </label>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={addTag}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  {tag}{" "}
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
        <button
          onClick={() => publish()}
          className="global_button mt-5"
        >
           Publish
        </button>
    </div>
  );
};

export default NewBlog;
