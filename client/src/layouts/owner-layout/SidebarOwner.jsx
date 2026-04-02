/**
 * Component Name: SidebarSales
 * Description: Sidebar dành cho Sales Layout
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */


import { useEffect, useState } from "react";
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
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { text: "Tổng quan", icon: Home, path: "/owner/dashboard" },
  { text: "Yêu cầu khách hàng", icon: ClipboardList, path: "/owner/requirements" },
  { text: "Đơn hàng", icon: ClipboardList, path: "/owner/orders" },
  { text: "Mã giảm giá", icon: Tag, path: "/owner/coupons" },
  {
    text: "Sản phẩm",
    icon: Package,
    path: "/owner/products",
    subItems: [
      { text: "Danh mục hàng hóa", path: "/owner/products?tab=products" },
      { text: "Thiết lập thuộc tính", path: "/owner/products?tab=properties" },
    ],
  },
  { text: "Quản lý sản xuất", icon: Hammer, path: "/owner/production" },
  { text: "Nhà cung cấp", icon: Building2, path: "/owner/suppliers" },
  { text: "Quản lý tài khoản", icon: UserCog, path: "/owner/employees" },
  { text: "Bảo hành", icon: ShieldCheck, path: "/owner/warranty" },
  { text: "Báo cáo", icon: BarChart3, path: "/owner/reports" },
  { text: "Nhật ký hệ thống", icon: History, path: "/owner/system-logs" },
];


export const SidebarOwner = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    // Tự động mở menu nếu đang ở trang con của nó
    const activeItem = menuItems.find(
      (item) => item.subItems && location.pathname.startsWith(item.path)
    );
    if (activeItem) {
      setExpandedItems((prev) => ({ ...prev, [activeItem.text]: true }));
    }
  }, [location.pathname]);

  const toggleExpand = (text) => {
    setExpandedItems((prev) => ({ ...prev, [text]: !prev[text] }));
  };

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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems[item.text];
            const isActive =
              item.path === "/owner/dashboard"
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

            return (
              <div key={item.text} className="flex flex-col gap-1">
                {hasSubItems ? (
                  <div
                    onClick={() => toggleExpand(item.text)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200 no-underline
                      ${isActive
                        ? "bg-[var(--brand-primary)] text-white font-medium shadow-sm shadow-black/20"
                        : "text-gray-300 hover:text-white hover:bg-white/[0.1]"
                      }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-white" : "text-gray-400"}
                    />
                    <span className="flex-1">{item.text}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-white" : "text-gray-500"
                        }`}
                    />
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200 no-underline
                      ${isActive
                        ? "bg-[var(--brand-primary)] text-white font-medium"
                        : "text-gray-300 hover:text-white hover:bg-white/[0.1]"
                      }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-white" : "text-gray-400"}
                    />
                    <span className="flex-1">{item.text}</span>
                  </NavLink>
                )}

                {/* Sub items */}
                {hasSubItems && isExpanded && (
                  <div className="flex flex-col gap-1 ml-6 pl-3 border-l border-white/10 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname + location.search === sub.path || (sub.path.includes("products") && location.pathname === "/owner/products" && !location.search && sub.text === "Danh mục hàng hóa");
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={`px-3 py-2 text-[13px] rounded-lg transition-all duration-200 no-underline
                            ${isSubActive
                              ? "text-[var(--brand-primary)] font-bold bg-white/[0.08]"
                              : "text-gray-400 hover:text-white hover:bg-white/[0.08]"
                            }`}
                        >
                          {sub.text}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
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
