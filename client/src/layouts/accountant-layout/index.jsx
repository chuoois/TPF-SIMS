import { Outlet } from "react-router-dom";
import { Header } from "@/layouts/owner-layout/HeaderOwner";
import { SidebarAccountant } from "./SidebarAccountant";

/**
 * Accountant Layout
 * Layout dành cho Kế toán (ACCOUNTANT / OWNER)
 *
 * Created By: ThinhBui
 * Created Date: 27/02/2026
 */
export const AccountantLayout = () => {
    return (
        <>
            <div className="flex h-dvh flex-col">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <SidebarAccountant />
                    <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
};
