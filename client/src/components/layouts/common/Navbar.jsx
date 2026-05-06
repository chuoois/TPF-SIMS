import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, Bell, Settings, LogOut, CheckCircle2, XCircle, Info, Clock, Check } from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { getWarehouseStatus } from "@/pages/worker-page/mock";

export const Navbar = () => {
  const { user, logout } = useAuth();
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

  const roleMap = {
    OWNER: "Chủ cửa hàng",
    SALES: "Nhân viên bán hàng",
    WORKER: "Nhân viên sản xuất",
    ACCOUNTANT: "Kế toán",
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-12 z-[4] flex items-center justify-between px-3 bg-white border-b"
      style={{ borderColor: "var(--grid-border)" }}
    >
      {/* ... (background decorative blocks remain same) ... */}
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
      <div className="relative z-[3] flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${showNotifications ? "bg-[var(--status-focus)] text-[var(--brand-primary)]" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            title="Thông báo"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full border border-white text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--grid-border)] rounded-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-[13px] font-bold text-[var(--text-main)]">Thông báo</p>
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-medium text-[var(--brand-primary)] hover:underline cursor-pointer"
                >
                  Đã đọc tất cả
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Bell size={20} className="opacity-30" />
                    <p className="text-[11px]">Không có thông báo mới</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.pk_notification_id}
                      onClick={() => !n.is_read && markAsRead(n.pk_notification_id)}
                      className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50 ${!n.is_read ? 'bg-gray-50/50' : ''}`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === "SUCCESS" ? <Check size={14} className="text-green-500" /> : <Info size={14} className="text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-tight truncate ${!n.is_read ? 'font-bold text-[var(--text-main)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-placeholder)] line-clamp-1 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <button className="w-full py-2.5 text-[11px] font-medium text-[var(--text-placeholder)] hover:bg-gray-50 border-t border-gray-100 transition-colors cursor-pointer">
                  Xem tất cả thông báo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>

        {/* User Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2.5 p-1 rounded-full transition-all cursor-pointer ${showSettings ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white ring-1 ring-gray-100">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.fullName || "U",
                )}&background=34B057&color=fff&bold=true`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:flex flex-col items-start pr-1">
              <p className="text-[13px] font-bold text-[var(--text-main)] leading-none">
                {user?.fullName || "Người dùng"}
              </p>
              <p className="text-[10px] font-medium text-[var(--text-placeholder)] uppercase tracking-wider mt-1">
                {roleMap[user?.role] || "Thành viên"}
              </p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showSettings && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[var(--grid-border)] rounded-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[13px] font-bold text-[var(--text-main)] truncate">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-[var(--text-placeholder)] truncate mt-0.5">
                  {user?.email || "user@tpf-sims.com"}
                </p>
              </div>

              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
                  <Settings size={16} />
                  <span>Hồ sơ cá nhân</span>
                </button>

                <div className="h-[1px] bg-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
