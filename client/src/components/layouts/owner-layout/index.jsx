import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layouts/common/Navbar";
import { SidebarOwner } from "./SidebarOwner";

export default function OwnerLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-12">
        {/* Sidebar */}
        <SidebarOwner />

        {/* Main Content */}
        <main
          className="flex-1 min-h-0 overflow-auto px-6 py-4"
          style={{ backgroundColor: "var(--bg-main)" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
