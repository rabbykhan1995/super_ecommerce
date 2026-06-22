"use client";
import React, { useEffect, useState } from "react";
import BlogCard from "@/components/Cards/BlogCard";
import api from "@/utils/apiconfig";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// টাইপ ডিফাইন (আপনার ব্যাকএন্ড অনুযায়ী)
interface BlogItem {
  _id: string;
  title: string;
  shortDescription: string;
  thumbnail: string | null;
  slug: string;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6; // প্রতি পেজে কয়টি ব্লগ দেখাবে

  const fetchBlogs = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/blog/list?page=${page}&limit=${limit}`);

      if (res.data.success) {
        setBlogs(res.data.data.items);
        // মোট পেজ সংখ্যা ক্যালকুলেট করা
        setTotalPages(Math.ceil(res.data.data.total / limit));
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage);
    // পেজ চেঞ্জ হলে স্ক্রিন স্ক্রল করে উপরে নিয়ে যাওয়া
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Our Latest Blogs
        </h1>
        <p className="text-slate-500">
          Insights, thoughts, and stories from our experts.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  title={blog.title}
                  shortDescription={blog.shortDescription}
                  thumbnail={blog.thumbnail}
                  slug={blog.slug}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-slate-500">
                No blogs found at the moment.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-16 gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;
