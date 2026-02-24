import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, ShoppingCart, LayoutGrid } from "lucide-react";

/**
 * Component Sidebar – Sales Layout
 * Sidebar cho nhân viên bán hàng (SALES/OWNER)
 *
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */

const menus = [
  {
    label: "Tổng quan",
    path: "/sales/home",
    icon: LayoutGrid,
  },
  {
    label: "Khách hàng",
    path: "/sales/dashboard/customers",
    icon: Users,
  },
  {
    label: "Đơn hàng",
    path: "/sales/dashboard/orders",
    icon: ShoppingCart,
  },
];

export const SidebarSales = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-72 border-r bg-background flex flex-col">
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
