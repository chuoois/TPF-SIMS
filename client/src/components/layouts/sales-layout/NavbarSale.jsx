import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, Bell, Settings, LogOut, CheckCircle2, XCircle, Info, Clock, Check } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { getWarehouseStatus } from "@/pages/worker-page/mock";

export const NavbarSale = () => {
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [warehouseStatus, setWarehouseStatus] = useState({ isOverloaded: false });
  const settingsRef = useRef(null);
  const notifRef = useRef(null);

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
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors cursor-pointer ${showNotifications ? "bg-gray-100 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
            title="Thông báo"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white shadow-sm animate-in zoom-in duration-300">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800">Thông báo</p>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded-full uppercase tracking-tighter">
                      Mới
                    </span>
                  )}
                </div>
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase tracking-widest cursor-pointer"
                >
                  Đọc tất cả
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Bell size={32} className="opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Không có thông báo</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.pk_notification_id}
                      onClick={() => !n.is_read && markAsRead(n.pk_notification_id)}
                      className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50 ${!n.is_read ? 'bg-green-50/30' : ''}`}
                    >
                      <div className="mt-1 shrink-0">
                        {n.type === "SUCCESS" ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : n.type === "ERROR" ? (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <XCircle size={16} />
                          </div>
                        ) : n.type === "WARNING" ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <AlertTriangle size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Info size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[13px] leading-tight ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                            {n.title}
                          </p>
                          {!n.is_read && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock size={10} className="text-gray-300" />
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                            {new Date(n.createdate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
                  <button className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors cursor-pointer">
                    Xem tất cả lịch sử
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
