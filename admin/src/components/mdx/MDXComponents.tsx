import React from "react";

export const mdxComponents = {
  admonition: ({ type = "note", children }: any) => {
    const styles: Record<string, string> = {
      note: "bg-blue-100 text-blue-900",
      tip: "bg-green-100 text-green-900",
      warning: "bg-yellow-100 text-yellow-900",
      danger: "bg-red-100 text-red-900",
    };

    return (
      <div className={`p-4 rounded-xl my-4 ${styles[type] || styles.note}`}>
        {children}
      </div>
    );
  },
};
