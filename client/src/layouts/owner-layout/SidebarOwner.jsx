import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  UserCog,
  ShieldAlert,
  Boxes,
  ListChecks,
  Settings2,
} from "lucide-react";
import Logo from "@/assets/tp-logo.svg";

/**
 * Component Sidebar
 * Sidebar dạng app grid cho dashboard hệ thống TPF-SIMS.
 *
 * Hiển thị:
 * - Các module chức năng dưới dạng ô vuông
 * - Icon ở trên, tiêu đề ở dưới
 * - Trạng thái active theo route hiện tại
 * - Footer bản quyền ở cuối sidebar
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
const menus = [
  {
    label: "Tổng quan",
    path: "/owner/home",
    icon: LayoutGrid,
  },
  {
    label: "Quản lý tài khoản",
    path: "/owner/dashboard/account-manage",
    icon: UserCog,
  },
  {
    label: "Nhật ký hệ thống",
    path: "/owner/dashboard/system-log",
    icon: ShieldAlert,
  },
  {
    label: "Quản lý danh mục",
    path: "/owner/dashboard/master-data",
    icon: Settings2,
  },
  {
    label: "Sản phẩm",
    path: "/owner/dashboard/products",
    icon: Package,
  },
  {
    label: "Kho hàng",
    path: "/owner/dashboard/inventory",
    icon: Warehouse,
  },
  {
    label: "Đơn hàng",
    path: "/owner/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    label: "Khách hàng",
    path: "/owner/dashboard/customers",
    icon: Users,
  },
];

export const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-72 border-r bg-background flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b">
        <img src={Logo} alt="TPF-SIMS" className="h-9 w-9 rounded-lg" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground tracking-tight leading-tight">
            TPF-SIMS
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            Management System
          </span>
        </div>
      </div>

      {/* App grid */}
      <nav className="grid grid-cols-2 gap-3 p-4">
        {menus.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4 text-center transition",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted",
              )}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t px-4 py-3 text-center text-xs text-muted-foreground">
        © 2026 5PGroup
      </div>
    </aside>
  );
};
