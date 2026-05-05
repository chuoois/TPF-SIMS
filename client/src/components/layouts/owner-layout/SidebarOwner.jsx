/**
 * Component Name: SidebarOwner
 * Description: Sidebar dành cho Owner Layout
 * Updated: Redesign menu Sản phẩm — giảm từ 3 cấp xuống 2 cấp
 */

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Package,
  Hammer,
  Building2,
  UserCog,
  BarChart3,
  PanelLeftClose,
  History,
  ShieldCheck,
  Tag,
  ChevronDown,
  ChevronRight,
  Settings2,
  FileStack,
} from "lucide-react";

// ─── Menu structure ───────────────────────────────────────────────────────────
// "Thiết lập" không còn là subItem lồng nhau nữa — được tách thành
// settingsGroup riêng để tránh nested 3 cấp khó dùng.
const menuItems = [
  { text: "Tổng quan", icon: Home, path: "/owner/dashboard" },
  {
    text: "Yêu cầu khách hàng",
    icon: ClipboardList,
    path: "/owner/requirements",
  },
  { text: "Đơn hàng", icon: ClipboardList, path: "/owner/orders" },
  { text: "Tạo yêu cầu nhập hàng", icon: FileStack, path: "/owner/manufacturing-orders" },

  {
    text: "Sản phẩm",
    icon: Package,
    path: "/owner/products",
    subItems: [{ text: "Hàng hóa", path: "/owner/products", exactMatch: true }],
    settingsGroup: {
      text: "Thiết lập",
      path: "/owner/products/properties",
      items: [
        { text: "Danh mục sản phẩm", path: "/owner/products/properties/categories" },
        { text: "Màu sắc", path: "/owner/products/properties/colors" },
        { text: "Phòng / Khu vực", path: "/owner/products/properties/rooms" },
        { text: "Chất liệu", path: "/owner/products/properties/materials" },
      ],
    },
  },
  { text: "Mã giảm giá", icon: Tag, path: "/owner/coupons" },
  { text: "Nhà cung cấp", icon: Building2, path: "/owner/suppliers" },
  { text: "Quản lý tài khoản", icon: UserCog, path: "/owner/employees" },
  { text: "Nhật ký hệ thống", icon: History, path: "/owner/system-logs" },
];

// ─── Helper ────────────────────────────────────────────────────────────────────
function isCollapsibleSectionActive(item, pathname) {
  // Parent path match (e.g., /owner/warranty)
  if (pathname === item.path) return true;

  if (!item.subItems && !item.settingsGroup) return false;
  const subActive = item.subItems?.some((s) =>
    s.exactMatch ? pathname === s.path : pathname.startsWith(s.path),
  );
  const settingsActive = item.settingsGroup?.items.some((s) =>
    pathname.startsWith(s.path),
  );
  return subActive || settingsActive;
}

// ─── Sub-item link ─────────────────────────────────────────────────────────────
function SubLink({ text, path, exactMatch }) {
  const location = useLocation();
  const isActive = exactMatch
    ? location.pathname === path
    : location.pathname.startsWith(path);

  return (
    <NavLink
      to={path}
      className={`flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-md transition-colors no-underline
        ${isActive
          ? "text-[var(--brand-primary)] font-semibold bg-white/[0.08]"
          : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors
          ${isActive ? "bg-[var(--brand-primary)]" : "bg-gray-600"}`}
      />
      {text}
    </NavLink>
  );
}

// ─── Settings group (thu gọn riêng, tránh nested 3 cấp) ──────────────────────
function SettingsGroup({ group }) {
  const location = useLocation();
  const isAnyActive = group.items.some((s) =>
    location.pathname.startsWith(s.path),
  );
  const [open, setOpen] = useState(isAnyActive);

  useEffect(() => {
    if (isAnyActive) setOpen(true);
  }, [location.pathname]);

  return (
    <div className="rounded-md overflow-hidden bg-black/20 mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium tracking-wide
          transition-colors cursor-pointer
          ${isAnyActive ? "text-gray-300" : "text-gray-500 hover:text-gray-300"}`}
      >
        <span className="flex items-center gap-1.5">
          <Settings2 size={11} />
          {group.text.toUpperCase()}
        </span>
        <ChevronRight
          size={10}
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-col pb-1 animate-in slide-in-from-top-1 duration-150">
          {group.items.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 text-[12px] no-underline transition-colors
                  ${isActive
                    ? "text-[var(--brand-primary)] font-semibold"
                    : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                <span
                  className={`w-1 h-1 rounded-full flex-shrink-0
                    ${isActive ? "bg-[var(--brand-primary)]" : "bg-gray-600"}`}
                />
                {item.text}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Collapsible menu item (Products, Warranty, etc.) ────────────────────────
function CollapsibleMenuItem({ item }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(
    isCollapsibleSectionActive(item, location.pathname),
  );

  useEffect(() => {
    if (isCollapsibleSectionActive(item, location.pathname)) setExpanded(true);
  }, [location.pathname]);

  const isActive = isCollapsibleSectionActive(item, location.pathname);
  const Icon = item.icon;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        onClick={() => setExpanded((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200
          ${isActive
            ? "bg-[var(--brand-primary)] text-white font-medium shadow-sm shadow-black/20"
            : "text-gray-300 hover:text-white hover:bg-white/[0.1]"
          }`}
      >
        {Icon && (
          <Icon
            size={18}
            className={isActive ? "text-white" : "text-gray-400"}
          />
        )}
        <span className="flex-1">{item.text}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200
            ${expanded ? "rotate-180" : ""}
            ${isActive ? "text-white" : "text-gray-500"}`}
        />
      </div>

      {expanded && (
        <div className="ml-2 pl-3 border-l border-white/10 flex flex-col gap-0.5 animate-in slide-in-from-top-2 duration-200">
          {item.subItems?.map((sub) => (
            <SubLink key={sub.path} {...sub} />
          ))}
          {item.settingsGroup && <SettingsGroup group={item.settingsGroup} />}
        </div>
      )}
    </div>
  );
}

// ─── Generic menu item ─────────────────────────────────────────────────────────
function MenuItem({ item }) {
  const location = useLocation();
  const Icon = item.icon;
  const isExact = item.path === "/owner/dashboard";
  const isActive = isExact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  if (item.subItems || item.settingsGroup) {
    return <CollapsibleMenuItem item={item} />;
  }

  return (
    <NavLink
      to={item.path}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 no-underline
        ${isActive
          ? "bg-[var(--brand-primary)] text-white font-medium shadow-sm shadow-black/20"
          : "text-gray-300 hover:text-white hover:bg-white/[0.1]"
        }`}
    >
      {Icon && (
        <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
      )}
      <span className="flex-1">{item.text}</span>
    </NavLink>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────
export const SidebarOwner = () => {
  return (
    <aside
      className="w-[220px] h-full relative overflow-hidden bg-[#1a1a1b] bg-bottom bg-no-repeat bg-contain"
      style={{
        backgroundImage:
          "url('https://amisplatform.misacdn.net/apps/recruit/event-sidebar.b836f9e63b28d1c0.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/65 z-[1]" />
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(30,30,30,1) 0%, rgba(30,30,30,0.9) 30%, rgba(30,30,30,0.4) 70%, rgba(30,30,30,0) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full px-2.5 py-3 overflow-y-auto">
        <div className="flex flex-col flex-1 pt-4 gap-0.5">
          {menuItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-center gap-2 h-9 rounded-lg cursor-pointer bg-white/[0.12] text-white hover:bg-white/[0.18] transition-colors">
            <PanelLeftClose size={16} />
            <span className="text-sm">Thu gọn</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
