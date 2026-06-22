import React from "react";

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index?: number) => React.ReactNode);
  className?: string;
  headerClassName?: string;
 
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  footer?: (columnCount: number) => React.ReactNode;

};

export default function Table<T>({ columns, data, keyExtractor ,footer}: TableProps<T>) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="global_table">
        <thead className="global_thead">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`global_th ${col.headerClassName ?? col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="global_tbody">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-sm opacity-50">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={keyExtractor(row, rowIndex)} className="global_tr"> {/* ✅ rowIndex */}
                {columns.map((col, i) => (
                  <td key={i} className={`global_td ${col.className ?? ""}`}>
                    {typeof col.accessor === "function"
                      ? col.accessor(row, rowIndex)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
            {/* 👇 footer */}
         {footer && footer(columns.length)}
      </table>
    </div>
  );
}