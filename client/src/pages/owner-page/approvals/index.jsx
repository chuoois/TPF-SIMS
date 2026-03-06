import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { FileCheck, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "quotation", label: "Phê duyệt báo giá", icon: FileCheck },
  { id: "cancel", label: "Phê duyệt hủy đơn", icon: XCircle },
  { id: "return", label: "Phê duyệt hoàn hàng", icon: RotateCcw },
];

export default function OwnerApprovals() {
  const [activeTab, setActiveTab] = useState("quotation");

  return (
    <>
      <PageHelmet title="Phê duyệt | Chủ cửa hàng" />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Phê duyệt</h1>
        <p className="mt-1 text-gray-500">
          Phê duyệt báo giá, hủy đơn hàng và hoàn hàng.
        </p>

        <div className="mt-6 flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border bg-white p-6 min-h-[200px]">
          {activeTab === "quotation" && (
            <p className="text-gray-600">
              Danh sách báo giá chờ phê duyệt sẽ hiển thị tại đây.
            </p>
          )}
          {activeTab === "cancel" && (
            <p className="text-gray-600">
              Danh sách yêu cầu hủy đơn chờ phê duyệt sẽ hiển thị tại đây.
            </p>
          )}
          {activeTab === "return" && (
            <p className="text-gray-600">
              Danh sách yêu cầu hoàn hàng chờ phê duyệt sẽ hiển thị tại đây.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
