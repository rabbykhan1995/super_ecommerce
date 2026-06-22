"use client";

import Dropdown from "@/utils/Ui/Dropdown";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

type ListHeaderProps = {
  title: string;
  subtitle?: string;
  search: string;
  onSearchChange: (value: any) => void;
  addHref: string;
  addLabel: string;
  limit: number;
  onLimitChange: (value: any) => void;
};

export default function ListHeader({
  title,
  subtitle,
  search,
  onSearchChange,
  addHref,
  addLabel,
  limit,
  onLimitChange,
}: ListHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 input_field"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/*  Limit Dropdown */}
        <div className="w-fit">
          <Dropdown
          value={limit}
          options={[20, 50, 100, 150, 200]}
          onChange={onLimitChange}
          title={" / page"}
        />
        </div>

        {/* Add Button */}
        <Link
          href={addHref}
          className="flex items-center gap-2 global_button"
        >
          <Plus size={18} />
          <span>{addLabel}</span>
        </Link>
      </div>
    </div>
  );
}
