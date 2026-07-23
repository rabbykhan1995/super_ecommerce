"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  className?: string;
  onClick?: () => void;
}

const NavLink = ({ href, children, exact = false, className = "", onClick }: Props) => {
  const pathname = usePathname();

  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm
        ${
          isActive
            ? "bg-orange-500/20 text-orange-300 shadow-sm"
            : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
        } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
