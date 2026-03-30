import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, Bell, Settings, LogOut } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { useAuth } from "@/context/AuthContext";
import { getWarehouseStatus } from "@/pages/worker-page/mock";

export const NavbarSale = () => {
  const { logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [warehouseStatus, setWarehouseStatus] = useState({ isOverloaded: false });
  const settingsRef = useRef(null);

  // Poll warehouse status (mocking real-time updates)
  useEffect(() => {
    const checkStatus = () => {
      setWarehouseStatus(getWarehouseStatus());
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đã đăng xuất");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

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
        <div className="flex items-center gap-2 cursor-pointer">
          <img src={Logo} alt="TPF-SIMS" className="h-7 w-7 rounded-md" />
          <span
            className="text-base font-bold whitespace-nowrap"
            style={{ color: "var(--text-main)" }}
          >
            TPF-SIMS
          </span>
        </div>

        {/* Warehouse Overload Warning for Sales */}
        {warehouseStatus.isOverloaded && (
          <div className="ml-4 flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse transition-all">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-[12px] font-bold text-red-600 whitespace-nowrap">
              KHO ĐANG QUÁ TẢI - HẠN CHẾ NHẬN ĐƠN MỚI
            </span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="relative z-[3] flex items-center gap-1">
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          title="Thông báo"
        >
          <Bell size={18} />
        </button>

        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`relative flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors cursor-pointer ${showSettings ? "bg-gray-100 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
            title="Cài đặt"
          >
            <Settings size={18} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cài đặt hệ thống</p>
              </div>
              
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors cursor-pointer"
              >
                <Settings size={16} />
                <span>Cấu hình hồ sơ</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer ml-1 shrink-0 border border-gray-100">
          <img
            src="https://i.pravatar.cc/100"
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
