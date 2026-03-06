// import { useState } from "react";
// import { PageHelmet } from "@/components/seo/PageHelmet";
// import { FileCheck, XCircle, RotateCcw, Eye } from "lucide-react";
// import { cn } from "@/lib/utils";

// const tabs = [
//   { id: "quotation", label: "Phê duyệt báo giá", icon: FileCheck },
//   { id: "cancel", label: "Phê duyệt hủy đơn", icon: XCircle },
//   { id: "return", label: "Phê duyệt hoàn hàng", icon: RotateCcw },
// ];

// const mockQuotation = [
//   { id: "DH001", customer: "Nguyễn Văn A", total: "95.000.000", date: "12/03" },
//   { id: "DH002", customer: "Trần Văn B", total: "120.000.000", date: "11/03" },
// ];

// const mockCancel = [
//   { id: "DH003", customer: "Lê Văn C", reason: "Khách đổi ý", date: "10/03" },
// ];

// const mockReturn = [
//   {
//     id: "DH004",
//     customer: "Phạm Văn D",
//     product: "Bàn ăn gỗ Hương",
//     date: "09/03",
//   },
// ];

// export default function OwnerApprovals() {
//   const [activeTab, setActiveTab] = useState("quotation");

//   return (
//     <>
//       <PageHelmet title="Phê duyệt | Chủ cửa hàng" />

//       <div className="p-6">
//         {/* HEADER */}
//         <h1 className="text-2xl font-bold text-gray-900">Phê duyệt</h1>
//         <p className="mt-1 text-gray-500">
//           Quản lý các yêu cầu cần chủ cửa hàng phê duyệt.
//         </p>

//         {/* TABS */}
//         <div className="mt-6 flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;

//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={cn(
//                   "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition",
//                   activeTab === tab.id
//                     ? "bg-white text-primary shadow-sm"
//                     : "text-gray-600 hover:bg-white/60",
//                 )}
//               >
//                 <Icon size={18} />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* CONTENT */}
//         <div className="mt-6 rounded-lg border bg-white">
//           {/* QUOTATION */}
//           {activeTab === "quotation" && (
//             <div>
//               <div className="p-4 border-b font-semibold">
//                 Danh sách báo giá cần phê duyệt
//               </div>

//               <div className="max-h-[420px] overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="p-3 text-left">Mã đơn</th>
//                       <th className="p-3 text-left">Khách hàng</th>
//                       <th className="p-3 text-right">Tổng tiền</th>
//                       <th className="p-3 text-center">Ngày tạo</th>
//                       <th className="p-3 text-center">Hành động</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {mockQuotation.map((order) => (
//                       <tr key={order.id} className="border-t">
//                         <td className="p-3 font-medium">{order.id}</td>

//                         <td className="p-3">{order.customer}</td>

//                         <td className="p-3 text-right">{order.total}</td>

//                         <td className="p-3 text-center">{order.date}</td>

//                         <td className="p-3 flex justify-center gap-2">
//                           <button className="text-blue-600">
//                             <Eye size={18} />
//                           </button>

//                           <button className="px-3 py-1 text-xs bg-green-600 text-white rounded">
//                             Duyệt
//                           </button>

//                           <button className="px-3 py-1 text-xs bg-red-600 text-white rounded">
//                             Từ chối
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* CANCEL */}
//           {activeTab === "cancel" && (
//             <div>
//               <div className="p-4 border-b font-semibold">
//                 Danh sách yêu cầu hủy đơn
//               </div>

//               <div className="max-h-[420px] overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="p-3 text-left">Mã đơn</th>
//                       <th className="p-3 text-left">Khách hàng</th>
//                       <th className="p-3 text-left">Lý do</th>
//                       <th className="p-3 text-center">Ngày</th>
//                       <th className="p-3 text-center">Hành động</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {mockCancel.map((order) => (
//                       <tr key={order.id} className="border-t">
//                         <td className="p-3 font-medium">{order.id}</td>

//                         <td className="p-3">{order.customer}</td>

//                         <td className="p-3">{order.reason}</td>

//                         <td className="p-3 text-center">{order.date}</td>

//                         <td className="p-3 flex justify-center gap-2">
//                           <button className="px-3 py-1 text-xs bg-green-600 text-white rounded">
//                             Duyệt hủy
//                           </button>

//                           <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded">
//                             Từ chối
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* RETURN */}
//           {activeTab === "return" && (
//             <div>
//               <div className="p-4 border-b font-semibold">
//                 Danh sách yêu cầu hoàn hàng
//               </div>

//               <div className="max-h-[420px] overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="p-3 text-left">Mã đơn</th>
//                       <th className="p-3 text-left">Khách hàng</th>
//                       <th className="p-3 text-left">Sản phẩm</th>
//                       <th className="p-3 text-center">Ngày</th>
//                       <th className="p-3 text-center">Hành động</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {mockReturn.map((order) => (
//                       <tr key={order.id} className="border-t">
//                         <td className="p-3 font-medium">{order.id}</td>

//                         <td className="p-3">{order.customer}</td>

//                         <td className="p-3">{order.product}</td>

//                         <td className="p-3 text-center">{order.date}</td>

//                         <td className="p-3 flex justify-center gap-2">
//                           <button className="px-3 py-1 text-xs bg-green-600 text-white rounded">
//                             Duyệt
//                           </button>

//                           <button className="px-3 py-1 text-xs bg-red-600 text-white rounded">
//                             Từ chối
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
