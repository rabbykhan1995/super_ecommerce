import { Menu, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  user: any;
  toggle: () => void;
}

const Header = ({ user, toggle }: Props) => {
  return (
    <header className="h-10 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-2 sticky top-0 z-20">
      {/* Mobile Toggle */}
      <button
        onClick={toggle}
        className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          Back to Store
        </Link>
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center overflow-hidden">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={14} className="text-white" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
