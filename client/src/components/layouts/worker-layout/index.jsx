import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layouts/common/Navbar";
import { SidebarWorker } from "./SidebarWorker";

/**
 * Component Name: WorkerLayout
 * Description: Layout chính dành cho Worker (Header + Sidebar + Content)
 * Lấy cảm hứng từ thiết kế Tablet-first với thanh Navbar và Sidebar tối giản.
 */
export const WorkerLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-12">
        {/* Sidebar */}
        <SidebarWorker />

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
