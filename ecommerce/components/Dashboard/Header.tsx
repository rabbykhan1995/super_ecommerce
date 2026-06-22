import { Menu } from "lucide-react";
import Link from "next/link";

interface Props {
  user: any;
  toggle: () => void;
}

const Header = ({ user, toggle }: Props) => {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      {/* Mobile Toggle */}
      <button onClick={toggle} className="lg:hidden text-gray-700">
        <Menu size={26} />
      </button>

      {/* User Info */}
      <div className="ml-auto text-right flex items-center gap-5">
        <Link href={"/"} className="global_button">Home</Link>
        <p className="font-semibold text-sm">{user?.name}</p>
       
      </div>
    </header>
  );
};

export default Header;