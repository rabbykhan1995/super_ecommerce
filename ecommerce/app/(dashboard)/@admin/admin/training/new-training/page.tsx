"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Save, Tag as TagIcon, X } from "lucide-react";
import api from "@/utils/apiconfig";
import { CldUploadWidget } from "next-cloudinary";
import ImageUploader from "@/components/Dashboard/ImageUploader";
import Dropdown from "@/utils/Ui/Dropdown";
// Editor-ke dynamic import kora holo
const MDXEditorComponent = dynamic(() => import("@/components/MDX/MDXEditor"), {
  ssr: false,
});
interface Level {
  _id: string;
  name: string;
}

const NewTraining = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [levelID, setLevelID] = useState("");
  const [duration, setDuration] = useState(0);
  const [price, setPrice] = useState<number | "">("");
  const [levels, setLevels] = useState<Level[] | []>([]);
  const [thumbnail, setThumbnail] = useState("");
  const fetchLevels = async () => {
    const res = await api("/training/level-list");
    setLevels(res.data.data);
  };

  useEffect(() => {
    fetchLevels();
  }, []);

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
    if (!levelID) {
      alert("Please select a level");
      return;
    }

    const training = {
      title,
      price: Number(price),
      levelID,
      duration,
      description,
      shortDescription,
      tags,
      active: true,
      thumbnail,
    };

    await api.post("/training/create", training);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}

        <h1 className="text-2xl font-bold">New Training</h1>
 


      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Thumbnail */}
          <ImageUploader    label="Thumbnail"
            value={thumbnail}
            onChange={(val) => setThumbnail(val as string)} />
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
          {/* Experience */}
          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm">
            <label className="text-sm font-semibold mb-2 block">
              Level (Experience)
            </label>

            {/* <select
              value={levelID}
              onChange={(e) => setLevelID(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Level</option>
              {levels.map((lvl) => (
                <option key={lvl._id} value={lvl._id}>
                  {lvl.name}
                </option>
              ))}
            </select> */}
<Dropdown
  value={levelID}
  options={levels.map((lvl) => ({ id: lvl._id, name: lvl.name }))}
  onChange={(val: string) => setLevelID(val)}
  title="Select Level"
/>
          </div>
          {/* Price */}
          <div className="bg-white p-5 rounded-xl border border-gray-300 shadow-sm space-y-3">
            <div>
              <label className="text-sm font-semibold block mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min={0}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">
                Duration (hours)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min={0}
              />
            </div>
          </div>
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
          className="global_button my-5"
        >
          Publish
        </button>
    </div>
  );
};

export default NewTraining;
