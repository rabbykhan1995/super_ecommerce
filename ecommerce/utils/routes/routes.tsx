import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  GraduationCap,
  Users,
  ShoppingCart,
  User,
  Settings,
} from "lucide-react";

export type SidebarRoute = {
  name: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean ;
};


export const adminRoutes:SidebarRoute[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/admin",
    exact: true,
  },
  {
    name: "New Blog",
    icon: <FileText size={20} />,
    href: "/admin/blog/new-blog",
  },
  {
    name: "Blog List",
    icon: <FileText size={20} />,
    href: "/admin/blog/blog-list",
  },
  {
    name: "New Product",
    icon: <ShoppingBag size={20} />,
    href: "/admin/product/new-product",
  },
  {
    name: "Product List",
    icon: <ShoppingBag size={20} />,
    href: "/admin/product/product-list",
  },
  {
    name: "New Training",
    icon: <GraduationCap size={20} />,
    href: "/admin/training/new-training",
  },
  {
    name: "Training List",
    icon: <GraduationCap size={20} />,
    href: "/admin/training/training-list",
  },
  {
    name: "Training Level",
    icon: <GraduationCap size={20} />,
    href: "/admin/training/training-level",
  },
  {
    name: "Customer List",
    icon: <Users size={20} />,
    href: "/admin/customer-list",
  },
  {
    name: "All User List",
    icon: <Users size={20} />,
    href: "/admin/all-user-list",
  },
  {
    name: "Training Requests",
    icon: <Users size={20} />,
    href: "/admin/training-requests",
  },
];

export const userRoutes:SidebarRoute[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/user",
    exact: true,
  },
  {
    name: "My Profile",
    icon: <User size={20} />,
    href: "/user/profile",
  },
  {
    name: "My Orders",
    icon: <ShoppingBag size={20} />,
    href: "/user/my-orders",
  },
  {
    name: "My Cart",
    icon: <ShoppingCart size={20} />,
    href: "/user/my-cart",
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    href: "/user/settings",
  },
];