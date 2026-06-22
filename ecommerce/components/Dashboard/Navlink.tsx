"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
}

const NavLink = ({ href, children, exact = false, className = "" }: Props) => {
  const pathname = usePathname();

  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-400"
            : "hover:bg-slate-800 text-slate-300"
        } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
