/**
 * Component Name: SidebarSales
 * Description: Sidebar dành cho Sales Layout
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */

import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingBag,
  ClipboardList,
  ChevronRight,
  PanelLeftClose,
  Package,
  Hammer,
} from "lucide-react";

const menuItems = [
  {
    text: "Quản lý đơn hàng",
    icon: Package,
    path: "/sales/dashboard/orders",
  },
  {
    text: "Quản lý khách hàng",
    icon: Users,
    path: "/sales/dashboard/customers",
  },
  {
    text: "Tạo đơn hàng",
    icon: ShoppingBag,
    path: "/sales/dashboard/invoice-instock",
  },
  {
    text: "Hàng khách đặt",
    icon: ClipboardList,
    path: "/sales/dashboard/requirements-custom-order",
  },
  {
    text: "Quản lý yêu cầu từ khách hàng",
    icon: ClipboardList,
    path: "/sales/dashboard/requirements",
  },
];

export const SidebarSales = () => {
  const location = useLocation();

  return (
    <aside
      className="w-[220px] h-full relative overflow-hidden bg-[#1a1a1b] bg-bottom bg-no-repeat bg-contain"
      style={{
        backgroundImage:
          "url('https://amisplatform.misacdn.net/apps/recruit/event-sidebar.b836f9e63b28d1c0.png')",
      }}
    >
      {/* Overlay đen */}
      <div className="absolute inset-0 bg-black/65 z-[1]" />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(30,30,30,1) 0%, rgba(30,30,30,0.9) 30%, rgba(30,30,30,0.4) 70%, rgba(30,30,30,0) 100%)",
        }}
      />

      {/* Menu content */}
      <div className="relative z-10 flex flex-col h-full px-2.5 py-3">
        <div className="flex flex-col gap-1.5 pt-4 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all no-underline
                  ${
                    isActive
                      ? "bg-[var(--brand-primary)] text-white font-medium"
                      : "text-gray-300 hover:bg-white/[0.08]"
                  }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                <span className="flex-1">{item.text}</span>
                {item.hasArrow && (
                  <ChevronRight
                    size={14}
                    className={isActive ? "text-white/70" : "text-gray-500"}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Collapse button */}
        <div className="mt-auto">
          <div className="flex items-center justify-center gap-2 h-9 rounded-lg cursor-pointer bg-white/[0.12] text-white hover:bg-white/[0.18] transition-colors">
            <PanelLeftClose size={16} />
            <span className="text-sm">Thu gọn</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
