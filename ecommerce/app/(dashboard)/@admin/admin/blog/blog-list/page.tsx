"use client";
import React, { useEffect, useState } from "react";
import { Edit, Trash2, Eye, Plus, Search } from "lucide-react";
import Link from "next/link";
import api from "@/utils/apiconfig";
import Helper from "@/helper/helper";
import ListHeader from "@/components/Filter/ListHeader";
import DashboardPagination from "@/components/Filter/DashboardPagination";

// টাইপ ডেফিনিশন (Backend অনুযায়ী)
export type BlogListItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  createdAt: string;
  shortDescription?: string;
};

const BlogList = () => {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");

  // ডাটা ফেচ করার ফাংশন
  const fetchBlogs = async (currentPage: number, searchTerm: string) => {
    try {
      const res = await api.get(`/blog/list`, {
        params: {
          page: currentPage,
          limit: pagination.limit,
          search: searchTerm,
        },
      });

      if (res.data.success) {
        setBlogs(res.data.data.items);
           setPagination((prev) => ({
  ...prev,
  total: res.data.data.total,
  page: res.data.data.page,
}));
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    // ডিব্রাউন্স মেকানিজম দিলে ভালো হয়, আপাতত সরাসরি কল
    const timer = setTimeout(() => {
      fetchBlogs(pagination.page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, search, pagination.limit]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <ListHeader
        title="Blog Posts"
        subtitle="Manage your blogs"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        addHref="/admin/new-blog"
        addLabel="Add Blog"
        limit={pagination.limit}
        onLimitChange={(value) =>
          setPagination((prev) => ({
            ...prev,
            limit: value,
            page: 1,
          }))
        }
      />

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Blog Title
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Thumbnail
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Date
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <tr
                    key={blog._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 line-clamp-1">
                          {blog.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          /{blog.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {blog.thumbnail ? (
                        <img
                          src={blog.thumbnail}
                          alt="thumb"
                          className="w-10 h-10 rounded object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {Helper.formatDate(blog.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/blog/${blog.slug}`}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all"
                        >
                          <Edit size={18} />
                        </Link>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <DashboardPagination
          total={pagination.total}
          page={pagination.page}
          limit={pagination.limit}
          onPageChange={(newPage) =>
            setPagination((prev) => ({ ...prev, page: newPage }))
          }
        />
      </div>
    </div>
  );
};

export default BlogList;
