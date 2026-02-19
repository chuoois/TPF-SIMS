import { Button } from "@/components/ui/button";
import { Bell, User, LogOut } from "lucide-react";
import Logo from "@/assets/logos/Logo.png";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { toast } from "react-hot-toast";

/**
 * Component Header
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đã đăng xuất");
      localStorage.clear();
      navigate("/auth/login");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi đăng xuất");
    }
  };
  const handleGoProfile = () => {
    navigate("/me");
  };
  
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <img src={Logo} alt="TPF-SIMS" className="h-8 w-auto" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleGoProfile}>
          <User className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
