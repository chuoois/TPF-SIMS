import { Outlet } from "react-router-dom";
import { Header } from "./HeaderOwner";
import { SidebarOwner } from "./SidebarOwner";

export default function OwnerLayout() {
  return (
    <div className="flex flex-col h-dvh">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SidebarOwner />
        <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
