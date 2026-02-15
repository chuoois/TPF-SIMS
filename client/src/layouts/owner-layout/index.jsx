import { Outlet } from "react-router-dom"
import { Header } from "./HeaderOwner"
import { Sidebar } from "./SidebarOwner"

export const OwnerLayout = () => {
    return (
        <>
            <div className="flex h-dvh flex-col">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}
