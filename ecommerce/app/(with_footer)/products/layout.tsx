import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading products...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
