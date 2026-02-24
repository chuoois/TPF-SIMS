import { Outlet } from "react-router-dom";
import { Header } from "@/layouts/owner-layout/HeaderOwner";
import { SidebarSales } from "./SidebarSales";

/**
 * Sales Layout
 * Layout dành cho nhân viên bán hàng (SALES / OWNER)
 *
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */
export const SalesLayout = () => {
  return (
    <>
      <div className="flex h-dvh flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <SidebarSales />
          <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};
