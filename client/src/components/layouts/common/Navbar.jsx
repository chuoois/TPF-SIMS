import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  AlertTriangle, 
  Bell, 
  Check, 
  Info
} from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { getWarehouseStatus } from "@/pages/worker-page/mock";
import { UserProfileDropdown } from "./UserProfileDropdown";

/**
 * Component Name: Navbar
 * Description: Thanh điều hướng chung duy nhất cho toàn bộ hệ thống (Unified Navbar)
 */
export const Navbar = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [warehouseStatus, setWarehouseStatus] = useState({ isOverloaded: false });
  const notifRef = useRef(null);

  // Cấu hình hiển thị theo Role
  const showWarehouseWarning = user?.role === "OWNER" || user?.role === "SALES";
  const showNotificationPanel = user?.role === "OWNER" || user?.role === "SALES" || user?.role === "ACCOUNTANT";

  useEffect(() => {
    if (!showWarehouseWarning) return;
    const checkStatus = () => setWarehouseStatus(getWarehouseStatus());
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [showWarehouseWarning]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 z-[20] flex items-center justify-between px-3 bg-white border-b border-gray-100 transition-colors duration-300 shadow-sm">
      {/* Background decorative */}
      <div
        className="absolute top-0 -left-3 w-[250px] h-full bg-no-repeat bg-left bg-contain pointer-events-none z-[1] opacity-50"
        style={{
          backgroundImage: "url('https://testcdnamisapp.misacdn.net/apps/payroll/static/img/bg_logo1.cddbf3a.png')",
        }}
      />

      {/* LEFT */}
      <div className="relative z-[3] flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer group">
          <img src={Logo} alt="TPF-SIMS" className="h-7 w-7 rounded-md transition-transform group-hover:scale-110" />
          <span className="text-base font-bold whitespace-nowrap text-gray-900">TPF-SIMS</span>
        </div>

        {showWarehouseWarning && warehouseStatus.isOverloaded && (
          <div className="ml-4 hidden md:flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
            <AlertTriangle size={14} className="text-red-600" />
            <span className="text-[11px] font-bold text-red-600 uppercase">Kho quá tải</span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="relative z-[3] flex items-center gap-1.5">
        {/* Notifications */}
        {showNotificationPanel && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${
                showNotifications ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-85 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <p className="text-[13px] font-bold text-gray-900">Thông báo</p>
                  <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">Đã đọc tất cả</button>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-400"><p className="text-xs">Không có thông báo mới</p></div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.pk_notification_id} onClick={() => !n.is_read && markAsRead(n.pk_notification_id)} className={`px-5 py-3.5 flex gap-4 cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                        <div className="shrink-0 mt-1">{n.type === "SUCCESS" ? <Check size={16} className="text-green-500" /> : <Info size={16} className="text-blue-500" />}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>{n.title}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {showNotificationPanel && <div className="h-4 w-[1.5px] bg-gray-100 mx-1 opacity-50"></div>}
        
        {/* Component UserProfileDropdown xịn xò của bạn ở đây */}
        <UserProfileDropdown />
      </div>
    </nav>
  );
};
