"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import api from "@/utils/apiconfig";
import DashboardPagination from "@/components/Filter/DashboardPagination";
import Image from "next/image";
import Helper from "@/helper/helper";
import ListHeader from "@/components/Filter/ListHeader";

// টাইপ ডেফিনিশন (Backend অনুযায়ী)
export type UserListItem = {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  admin: boolean;
  createdAt: string;
  image?:string;
};

const UserList = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");

  // ডাটা ফেচ করার ফাংশন
  const fetchUsers = async (currentPage: number, searchTerm: string) => {
    try {
      const res = await api.get(`/user/list`, {
        params: {
          page: currentPage,
          limit: pagination.limit,
          search: searchTerm,
        },
      });
       
      if (res.data.success) {
     
        setUsers(res.data.items);
          setPagination((prev) => ({
  ...prev,
  total: res.data.total,
  page: res.data.page,
}));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(pagination.page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.page, search, pagination.limit]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <ListHeader
        title="Users"
        subtitle="Manage your users"
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        addHref="/admin/new-user"
        addLabel="Add User"
        limit={pagination.limit}
        onLimitChange={(value) =>
          setPagination((prev) => ({ ...prev, limit: value, page: 1 }))
        }
      />

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Mobile
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center"><Image alt={user._id} height={100} width={100} className="rounded-full object-contain h-10 w-10" src={Helper.getImage(user.image || null)} /> {user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.mobile || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                          <Eye size={18} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all">
                          <Edit size={18} />
                        </button>
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
                    No users found.
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

export default UserList;