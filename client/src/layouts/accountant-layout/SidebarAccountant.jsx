import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";

/**
 * Sidebar – Accountant Layout
 * Menu dành cho Kế toán
 *
 * Created By: ThinhBui
 * Created Date: 27/02/2026
 */

const menus = [
  {
    label: "Tổng quan",
    path: "/accountant/dashboard",
    icon: LayoutGrid,
  },
  {
    label: "Quản lý sản phẩm",
    path: "/accountant/products",
    icon: Package,
  },
];

export const SidebarAccountant = () => {
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
