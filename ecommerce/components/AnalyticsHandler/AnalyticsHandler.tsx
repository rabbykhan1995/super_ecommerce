"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // @ts-ignore   ← এটা ignore করতেও পারো quick fix
    (window as any).gtag?.("config", "G-XXXXXXX", {
      page_path: pathname + searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}
