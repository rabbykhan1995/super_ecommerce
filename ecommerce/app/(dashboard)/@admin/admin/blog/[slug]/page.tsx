"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Save, Tag as TagIcon, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/apiconfig";
import toast from "react-hot-toast";

import { refreshBlogData } from "@/app/actions";
import ImageUploader from "@/components/Dashboard/ImageUploader";

const MDXEditorComponent = dynamic(() => import("@/components/MDX/MDXEditor"), {
  ssr: false,
});

const UpdateBlog = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState("");
  const [blogId, setBlogId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 ১️⃣ slug দিয়ে blog fetch
  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blog/blogBySlug/${slug}`);
        const blog = res.data.data;

        setBlogId(blog._id);
        setTitle(blog.title);
        setThumbnail(blog.thumbnail);
        setDescription(blog.description);
        setShortDescription(blog.shortDescription);
        setTags(blog.tags || []);
      } catch (error) {
        toast.error("Blog not found");
        router.push("/admin/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
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

  // 🔥 ২️⃣ update blog
  // 🔥 ২️⃣ Update Blog Function
  const updateBlog = async () => {
    try {
      const payload = {
        title,
        description,
        shortDescription,
        tags,
        thumbnail,
      };

      const res = await api.put(`/blog/update/${blogId}`, payload);

      if (res.data.success) {
        // ✅ ৩. সার্ভার অ্যাকশন কল করুন ক্যাশ ক্লিয়ার করার জন্য
        await refreshBlogData(slug);

        toast.success("Blog updated successfully");

        // রিফ্রেশ এবং রিডাইরেক্ট
        router.refresh();
        router.push(`/blog/${slug}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
 
        <h1 className="text-2xl font-bold">Update Blog</h1>

  

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
            <input
              type="text"
              className="w-full text-3xl font-bold outline-none"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <ImageUploader
            label="Thumbnail"
            value={thumbnail}
            onChange={(val) => setThumbnail(val as string)}
          />
          <h1>Short Description</h1>
          <div className="bg-white rounded-xl border border-gray-300">
            <MDXEditorComponent
              markdown={shortDescription}
              onChange={(v) => setShortDescription(v)}
            />
          </div>

          <h1>Full Description</h1>
          <div className="bg-white rounded-xl border border-gray-300">
            <MDXEditorComponent
              markdown={description}
              onChange={(v) => setDescription(v)}
            />
          </div>
        </div>

        {/* Sidebar */}
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
                {tag}
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
                           <button
          onClick={updateBlog}
          className="global_button my-5"
        >
           Update
        </button>
    </div>
  );
};

export default UpdateBlog;
