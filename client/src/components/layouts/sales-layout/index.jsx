import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layouts/common/Navbar";
import { SidebarSales } from "./SidebarSales";

/**
 * Component Name: SalesLayout
 * Description: Layout chính dành cho Sales (Header + Sidebar + Content)
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */
export const SalesLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-12">
        {/* Sidebar */}
        <SidebarSales />

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
