/**
 * Component Name: SidebarSales
 * Description: Sidebar dành cho Sales Layout
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */


import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Package,
  Hammer,
  Users,
  Building2,
  UserCog,
  BarChart3,
  ChevronRight,
  PanelLeftClose,
  History,
  ShieldCheck,
  Tag,
} from "lucide-react";

const menuItems = [
  { text: "Tổng quan", icon: Home, path: "/owner/dashboard" },
  { text: "Yêu cầu khách hàng", icon: ClipboardList, path: "/owner/requirements" },
  { text: "Đơn hàng", icon: ClipboardList, path: "/owner/orders" },
  { text: "Mã giảm giá", icon: Tag, path: "/owner/coupons" },
  { text: "Sản phẩm", icon: Package, path: "/owner/products" },
  { text: "Quản lý sản xuất", icon: Hammer, path: "/owner/production" },
  // { text: "Khách hàng", icon: Users, path: "/owner/customers" },
  { text: "Nhà cung cấp", icon: Building2, path: "/owner/suppliers" },
  { text: "Quản lý tài khoản", icon: UserCog, path: "/owner/employees" },
  { text: "Bảo hành", icon: ShieldCheck, path: "/owner/warranty" },
  { text: "Báo cáo", icon: BarChart3, path: "/owner/reports" },
  { text: "Nhật ký hệ thống", icon: History, path: "/owner/system-logs" },
];


export const SidebarOwner = () => {
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
            const isActive = item.path === '/owner/dashboard' ? location.pathname === item.path : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all no-underline
                  ${isActive
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
