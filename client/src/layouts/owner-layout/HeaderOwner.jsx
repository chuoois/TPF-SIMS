import { useState, useEffect, useRef } from "react";
import { Bell, LogOut, UserCircle2, KeyRound, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/assets/logos/Logo.png";
import { authService } from "@/services/auth.service";
import { commonService } from "@/services/common.service";
import { toast } from "react-hot-toast";
import { ProfileModal } from "./ProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/tp-logo.svg";

/**
 * Component Header – Owner Layout
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 * Updated: 20/02/2026 – thêm user dropdown, profile & change password modal
 */

// Lấy chữ cái đầu của tên để hiển thị avatar
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1]?.[0]?.toUpperCase() ?? "U";
};

export const Header = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Fetch profile khi mount
  const fetchProfile = async () => {
    try {
      const data = await commonService.getProfile();
      setProfile(data);
    } catch {
      // silent fail – token invalid sẽ bị interceptor handle
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đã đăng xuất");
      localStorage.clear();
      navigate("/auth/login");
    } catch {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const handleProfileClose = (shouldReload) => {
    setProfileModalOpen(false);
    if (shouldReload) fetchProfile();
  };

  const displayName =
    profile?.profile?.full_name ?? profile?.email ?? "Người dùng";
  const displayEmail = profile?.email ?? "";
  const roleLabel = profile?.role?.role_name ?? profile?.role?.role_code ?? "";

  return (
    <>
      <header className="h-16 border-b bg-background flex items-center justify-between px-6 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="TPF-SIMS" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold text-foreground tracking-tight">
            TPF-SIMS
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
            >
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold select-none shrink-0">
                {getInitials(profile?.profile?.full_name)}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                  {displayName}
                </span>
                {roleLabel && (
                  <span className="text-xs text-muted-foreground">
                    {roleLabel}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-popover shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b bg-muted/40">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                    Hồ sơ cá nhân
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setChangePasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    Đổi mật khẩu
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal open={profileModalOpen} onClose={handleProfileClose} />
      <ChangePasswordModal
        open={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </>
  );
};
