"use client";

type PaginationProps = {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export default function DashboardPagination({
  total,
  page,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-sm text-slate-500">
      {/* Left Info */}
      <span>
        Showing page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{totalPages}</span> ({total} results)
      </span>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="px-3 py-1 rounded bg-white border border-slate-200">
          {page}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
