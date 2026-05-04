import React, { useState, useRef, useEffect } from "react";
import { LogOut, Mail, Sun, Moon, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đã đăng xuất thành công");
      navigate("/auth/login");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-2 p-1 rounded-full transition-all duration-300 cursor-pointer ${
          isOpen ? "bg-accent ring-2 ring-primary/20" : "hover:bg-accent/50"
        }`}
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white dark:border-border shadow-sm bg-accent text-primary transition-transform duration-300 hover:scale-105">
            <User size={20} />
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-border rounded-full z-[1]"></div>
        </div>
        <div className="hidden lg:flex flex-col items-start pr-2">
          <p className="text-[13px] font-bold text-foreground leading-none">
            {user?.fullName || "Người dùng"}
          </p>
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 uppercase tracking-tighter">
            {user?.role || "Thành viên"}
          </span>
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-popover border border-border rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden z-[999] animate-in fade-in zoom-in duration-200 origin-top-right">
          {/* Header Section */}
          <div className="p-5 bg-gradient-to-br from-accent/30 to-popover border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ring-4 ring-background bg-accent text-primary">
                <User size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-foreground truncate">
                  {user?.fullName}
                </h4>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Mail size={12} />
                    <span className="truncate">
                      {user?.email || "user@tpf-sims.com"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Action Area */}
          <div className="p-2 bg-popover flex flex-col gap-1">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent group-hover:bg-popover transition-colors shadow-sm text-foreground">
                  {isDarkMode ? (
                    <Sun size={18} className="text-yellow-500" />
                  ) : (
                    <Moon size={18} className="text-blue-600" />
                  )}
                </div>
                <span className="text-[13px] font-bold">
                  {isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
                </span>
              </div>
              <div
                className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isDarkMode ? "bg-primary" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isDarkMode ? "left-4.5" : "left-0.5"}`}
                ></div>
              </div>
            </button>

            <div className="h-[1px] bg-border/30 my-1 mx-2"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-popover transition-colors shadow-sm">
                <LogOut size={18} />
              </div>
              <span className="text-[13px] font-bold">Đăng xuất</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-accent/20 text-center border-t border-border/50">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              Phiên bản hệ thống v2.4.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
