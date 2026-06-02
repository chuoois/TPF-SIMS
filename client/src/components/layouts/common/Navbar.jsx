import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Check,
  Lock,
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ShieldCheck,
  X
} from "lucide-react";
import Logo from "@/assets/tp-logo.svg";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import authService from "@/services/auth.service";

export const Navbar = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const settingsRef = useRef(null);
  const notifRef = useRef(null);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    phoneNumber: "",
    dob: "",
    gender: 1
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingPassword, setSavingPassword] = useState(false);


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

  // Action Handlers
  const openProfileModal = async () => {
    setShowSettings(false);
    setShowProfileModal(true);
    setProfileLoading(true);
    try {
      const data = await authService.getProfile();
      if (data && data.user) {
        setProfileData({
          fullName: data.user.fullName || "",
          phoneNumber: data.user.phoneNumber || "",
          dob: data.user.dob ? data.user.dob.substring(0, 10) : "",
          gender: data.user.gender !== null && data.user.gender !== undefined ? data.user.gender : 1
        });
      }
    } catch (error) {
      toast.error("Không thể tải thông tin hồ sơ");
      setShowProfileModal(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) {
      toast.error("Họ và tên không được để trống");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        fullName: profileData.fullName.trim(),
        phoneNumber: profileData.phoneNumber.trim(),
        dob: profileData.dob || null,
        gender: Number(profileData.gender)
      });
      
      // Cập nhật thông tin trong AuthContext để hiển thị đồng bộ trên thanh Navbar
      if (res && res.user) {
        setUser(prev => ({
          ...prev,
          fullName: res.user.fullName
        }));
        // Cập nhật localStorage
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        localUser.name = res.user.fullName;
        localStorage.setItem("user", JSON.stringify(localUser));
      }

      toast.success("Cập nhật hồ sơ thành công");
      setShowProfileModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật hồ sơ");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword) {
      toast.error("Vui lòng nhập mật khẩu cũ");
      return;
    }
    if (!passwordData.newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setShowChangePasswordModal(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đã đăng xuất");
      navigate("/auth/login");
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
      className="fixed top-0 left-0 right-0 h-12 z-[50] flex items-center justify-between px-3 bg-white border-b"
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

      {/* ─── PERSONAL PROFILE MODAL ──────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <User size={18} className="text-[var(--brand-primary)]" />
                Hồ sơ cá nhân
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {profileLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={32} className="animate-spin text-[var(--brand-primary)]" />
                  <span className="text-sm font-medium text-slate-500">Đang tải thông tin...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail size={13} /> Email tài khoản
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 outline-none cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Email không thể tự thay đổi. Vui lòng liên hệ quản trị viên để cập nhật.</span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User size={13} /> Họ và tên
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder="Nhập họ và tên..."
                      required
                      className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Phone size={13} /> Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="Nhập số điện thoại..."
                      className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                    />
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Calendar size={13} /> Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                        className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        Giới tính
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: Number(e.target.value) })}
                        className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition bg-white"
                      >
                        <option value={1}>Nam</option>
                        <option value={0}>Nữ</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 mt-6 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHANGE PASSWORD MODAL ───────────────────────────────────────── */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Lock size={18} className="text-[var(--brand-primary)]" />
                Đổi mật khẩu
              </h2>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSavePassword} className="space-y-4">
                {/* Old Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lock size={13} /> Mật khẩu cũ
                  </label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại..."
                    required
                    className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự..."
                    required
                    className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                  />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới..."
                    required
                    className="w-full border border-slate-200 focus:border-[var(--brand-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition"
                  />
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 mt-6 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
