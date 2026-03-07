import { Outlet } from "react-router-dom";
import { NavbarSale } from "@/layouts/sales-layout/NavbarSale";
import { SidebarAccountant } from "./SidebarAccountant";

export default function AccountantLayout() {
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <NavbarSale />

            <div className="flex flex-1 overflow-hidden pt-12">
                {/* Sidebar */}
                <SidebarAccountant />

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
