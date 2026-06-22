import { MoveLeft, MoveRight } from "lucide-react";

type PaginationProps = {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  total,
  page,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  return (
   


   
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
      className="px-3 py-1 flex items-center gap-2 justify-center border min-w-[100px] border-slate-300 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
        <MoveLeft size={10}/>  Previous
        </button>

        <span className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600">
          {page} of {totalPages} Page
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 flex items-center gap-2 justify-center border min-w-[100px] border-slate-300 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <MoveRight size={10}/>
        </button>
      </div>
        
   
  );
}