import { Bell, Settings } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";

/**
 * Component Name: NavbarWorker
 * Description: Navbar dành cho Worker Layout (Đồng bộ UI với Sales Layout)
 */

export const NavbarWorker = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 h-12 z-[4] flex items-center justify-between px-3 bg-white border-b"
      style={{ borderColor: "var(--grid-border)" }}
    >
      {/* Background decorative */}
      <div
        className="absolute top-0 -left-3 w-[250px] h-full bg-no-repeat bg-left bg-contain pointer-events-none z-[1]"
        style={{
          backgroundImage:
            "url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/bg_logo1.cddbf3a.png')",
        }}
      />
      <div
        className="absolute top-0 -left-3 w-[250px] h-full bg-no-repeat bg-left bg-contain pointer-events-none z-[2]"
        style={{
          backgroundImage:
            "url('https://amisplatform.misacdn.net/apps/recruit/event-header.0e849439aff9dcfd.png')",
        }}
      />

      {/* LEFT */}
      <div className="relative z-[3] flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer pl-1">
          <img
            src={Logo}
            alt="TPF-SIMS"
            className="h-7 w-7 rounded-md shadow-sm"
          />
          <span
            className="text-base font-bold whitespace-nowrap"
            style={{ color: "var(--text-main)" }}
          >
            TPF-SIMS
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-[3] flex items-center gap-1">
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          title="Thông báo"
        >
          <Bell size={18} />
        </button>

        <button
          className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          title="Cài đặt"
        >
          <Settings size={18} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer ml-1 shrink-0">
          <img
            src="https://i.pravatar.cc/100?u=worker"
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
