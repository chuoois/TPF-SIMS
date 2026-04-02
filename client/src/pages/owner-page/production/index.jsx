/**
 * Component OwnerProduction
 * Quản lý Sản xuất — Chủ cửa hàng (Static Data)
 *
 * Created Date: 06/03/2026
 */

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  Calendar,
  Eye,
  UserPlus,
  Hammer,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  XCircle,
  PackagePlus,
  Pencil,
  FileText,
  AlertTriangle,
  RotateCcw,
  Camera,
  Paintbrush,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";

// ===================== STATIC DATA =====================
const INITIAL_PRODUCTIONS = [
  // Order 1: Multi-product (Kitchen)
  {
    id: "LSX001",
    code: "LSX-2603-0001",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0912345678",
    productName: "Tủ bếp chữ L",
    productImage: "https://images.unsplash.com/photo-1556912177-c54030639a03?q=80&w=300",
    variantName: "Gỗ sồi Nga — Sơn PU",
    orderType: "Hàng khách đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: null,
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
  },
  {
    id: "LSX021",
    code: "LSX-2603-0021",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0912345678",
    productName: "Đảo bếp",
    productImage: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?q=80&w=300",
    variantName: "Đồng bộ tủ bếp",
    orderType: "Hàng khách đặt",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    isPendingApproval: true,
    completionPhoto: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?q=80&w=300",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: null,
    expectedEndDate: "2026-03-22",
    date: "2026-03-05T16:32:00",
  },
  {
    id: "LSX022",
    code: "LSX-2603-0022",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0912345678",
    productName: "Kệ trang trí",
    productImage: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=300",
    variantName: "Gỗ sồi Nga — Sơn PU",
    orderType: "Hàng khách đặt",
    quantityPlanned: 2,
    quantityCompleted: 2,
    status: "Hoàn thành",
    subStage: "son_hoan_thien",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: null,
    expectedEndDate: "2026-03-22",
    date: "2026-03-05T16:33:00",
  },
  // Order 2: Single product (Dining room)
  {
    id: "LSX002",
    code: "LSX-2603-0002",
    orderCode: "DH-2603-0002",
    orderId: "DH002",
    customerName: "Trần Thị B",
    customerPhone: "0988777666",
    productName: "Bàn ăn nguyên tấm",
    productImage: "https://images.unsplash.com/photo-1577145745727-42b77daeb623?q=80&w=300",
    variantName: "Gỗ gõ đỏ — Live Edge",
    orderType: "Hàng mộc",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: null,
    expectedEndDate: "2026-03-25",
    date: "2026-03-05T16:35:00",
  },
  // Order 3: Multi-product (Living room - Mixed Status)
  {
    id: "LSX003",
    code: "LSX-2603-0003",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    customerName: "Lê Văn C",
    customerPhone: "0903111222",
    productName: "Bàn trà phòng khách",
    productImage: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=300",
    variantName: "Gỗ hương đá — Chạm nghê",
    orderType: "Hàng khách đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    needsRedo: true,
    redoReason: "Mộng còn bị hở, yêu cầu chỉnh lại khít hơn.",
    isDelayed: true,
    delayReason: "Thời tiết nồm ẩm báo thợ sơn không khô kịp, xin thêm 3 ngày.",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
  },
  // Order 4: Pending Approval (was Chờ nghiệm thu)
  {
    id: "LSX005",
    code: "LSX-2603-0005",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    customerName: "Phạm Văn D",
    customerPhone: "0915999888",
    productName: "Tủ quần áo 4 cánh",
    productImage: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300",
    variantName: "Gỗ công nghiệp MDF — Phủ Melamine",
    orderType: "Hàng khách đặt",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    isPendingApproval: true,
    completionPhoto: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=3000&auto=format&fit=crop",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: "2026-03-01",
    expectedEndDate: "2026-03-10",
    date: "2026-03-01T09:00:00",
  },
  // Order 5: High Priority / Delayed
  {
    id: "LSX006",
    code: "LSX-2603-0006",
    orderCode: "DH-2603-0015",
    orderId: "DH015",
    customerName: "Hoàng Anh Tuấn",
    customerPhone: "0334555666",
    productName: "Giường ngủ 1m8",
    productImage: "https://images.unsplash.com/photo-1505693419173-42b925b406af?q=80&w=300",
    variantName: "Gỗ xoan đào — Kiểu hiện đại",
    orderType: "Hàng khách đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: "2026-03-02",
    expectedEndDate: "2026-03-12",
    date: "2026-03-02T10:00:00",
  },
  {
    id: "LSX023",
    code: "LSX-2603-0023",
    orderCode: "DH-2603-0015",
    orderId: "DH015",
    customerName: "Hoàng Anh Tuấn",
    customerPhone: "0334555666",
    productName: "Tủ đầu giường",
    productImage: "https://images.unsplash.com/photo-1616137509918-62f4f22c1926?q=80&w=300",
    variantName: "Gỗ xoan đào — Đồng bộ giường",
    orderType: "Hàng khách đặt",
    quantityPlanned: 2,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả: Trần Minh Tâm",
    startDate: null,
    expectedEndDate: "2026-03-15",
    date: "2026-03-02T09:58:00",
  },
  // Order 6: Completed
  {
    id: "LSX007",
    code: "LSX-2603-0007",
    orderCode: "DH-2603-0018",
    orderId: "DH018",
    customerName: "Nguyễn Thu Hà",
    customerPhone: "0888222333",
    productName: "Bộ bàn ghế ăn 6 ghế",
    productImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b?q=80&w=300",
    variantName: "Gỗ sồi — Màu óc chó",
    orderType: "Hàng mộc",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Hoàn thành",
    assignedWorker: "Thợ cả",
    startDate: "2026-02-28",
    expectedEndDate: "2026-03-08",
    date: "2026-02-27T14:20:00",
  },
];

const MOCK_WORKERS = [
  { id: "W001", name: "Nguyễn Văn Đức", role: "Thợ sản xuất", avatar: "Đ" },
  { id: "W002", name: "Trần Minh Tâm", role: "Thợ sản xuất", avatar: "T" },
  { id: "W003", name: "Lê Văn Hùng", role: "Thợ sơn", avatar: "H" },
  { id: "W004", name: "Phạm Quốc Bảo", role: "Thợ mộc", avatar: "B" },
];

const STATUSES = [
  "Tất cả",
  "Đang đánh giấy ráp",
  "Đang sơn",
  "Chờ duyệt",
  "Hoàn thành",
];

const ORDER_TYPES = ["Tất cả", "Hàng mộc", "Hàng khách đặt"];

// ===================== HELPERS =====================
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const getDeadlineStyle = (dateString) => {
  if (!dateString) return { color: "var(--text-main)", text: "Chưa định ngày" };
  const d = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(d);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: "#EF4444", text: formatDate(dateString), urgent: true };
  if (diffDays <= 3) return { color: "#F59E0B", text: formatDate(dateString), urgent: true };
  return { color: "var(--text-main)", text: formatDate(dateString), urgent: false };
};

const getStatusColor = (status, subStage = null, isPendingApproval = false, needsRedo = false) => {
  // 1. Primary Status (Matching the Tabs)
  const displayStatus = isPendingApproval ? "Chờ duyệt" : status;
  
  const primaryBadge = {
    "Đang đánh giấy ráp": { label: "Đang đánh giấy ráp", bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" },
    "Đang sơn": { label: "Đang sơn", bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
    "Chờ duyệt": { label: "Chờ duyệt", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Hoàn thành": { label: "Hoàn thành", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  }[displayStatus] || { label: displayStatus, bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };

  // 2. Detail Status (The Nuance)
  let detailBadge = null;
  if (needsRedo) {
    detailBadge = { label: "Sửa lại", bg: "#FEF2F2", text: "#EF4444", border: "#FEE2E2" };
  }

  return { primaryBadge, detailBadge };
};

// ===================== SUB-COMPONENTS =====================
const ProductionItemRow = ({ item, onInspect, onRedo, onDelay }) => {
  const sc = getStatusColor(item.status, item.subStage, item.isPendingApproval, item.needsRedo);
  const ds = getDeadlineStyle(item.expectedEndDate);

  return (
    <div className="flex items-center gap-6 py-4 px-6 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 transition-all rounded-xl group/item">
      {/* Product Image */}
      <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-50">
        <img
          src={item.productImage}
          alt={item.productName}
          className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <h4 className="text-[13px] font-bold text-gray-900 truncate uppercase tracking-tighter">
            {item.productName}
          </h4>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <span className="text-gray-400 font-medium italic">Thợ cả:</span>
            <span className="font-bold text-gray-900 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">{item.assignedWorker}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="text-gray-400 font-medium italic">Hạn giao:</span>
             <span className="font-bold" style={{ color: ds.color }}>{ds.text}</span>
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="shrink-0 flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter"
              style={{
                backgroundColor: sc.primaryBadge.bg,
                color: sc.primaryBadge.text,
                border: `1px solid ${sc.primaryBadge.border}`,
              }}
            >
              {sc.primaryBadge.label}
            </span>
            {sc.detailBadge && (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter"
                style={{
                  backgroundColor: sc.detailBadge.bg,
                  color: sc.detailBadge.text,
                  border: `1px solid ${sc.detailBadge.border}`
                }}
              >
                {sc.detailBadge.label}
              </span>
            )}
          </div>
          {item.isDelayed && (
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-red-50 text-red-600 border border-red-100 italic">
              <AlertTriangle size={10} /> Báo chậm trễ
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
           {item.isPendingApproval ? (
              <button
                onClick={(e) => { e.stopPropagation(); onInspect(item); }}
                className="h-8 px-3 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
              >
                <Camera size={13} /> Duyệt
              </button>
           ) : null}
           {item.isDelayed && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelay(item); }}
                className="h-8 px-3 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 transition shadow-sm flex items-center gap-1.5"
              >
                <Calendar size={13} /> Gia hạn
              </button>
           )}
           <Link
             to={`/owner/production/${item.id}`}
             className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition bg-white"
           >
             <Eye size={14} />
           </Link>
        </div>
      </div>
    </div>
  );
};

// ===================== COMPONENT =====================
export default function OwnerProduction() {
  const [productions, setProductions] = useState(() => {
    const saved = localStorage.getItem("tpf_simulated_productions");
    if (saved) return JSON.parse(saved);
    return INITIAL_PRODUCTIONS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("tpf_simulated_productions", JSON.stringify(productions));
  }, [productions]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [orderTypeFilter, setOrderTypeFilter] = useState("Tất cả");

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };


  const navigate = () => { }; // Dummy for now since we're using static data update alerts

  // Filter & Search
  const filtered = useMemo(() => {
    let result = productions.filter(p => p.orderType !== "Hàng sẵn");

    // Filter by status
    if (statusFilter !== "Tất cả") {
      if (statusFilter === "Chờ duyệt") {
        result = result.filter(p => p.isPendingApproval);
      } else if (statusFilter === "Đang sơn") {
        result = result.filter(p => p.status === "Đang sơn" && !p.isPendingApproval);
      } else {
        result = result.filter((p) => p.status === statusFilter);
      }
    }

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((p) => new Date(p.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((p) => new Date(p.date) <= to);
    }

    // Filter by order type
    if (orderTypeFilter !== "Tất cả") {
      result = result.filter((p) => p.orderType === orderTypeFilter);
    }

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.orderCode?.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productions, searchTerm, statusFilter, dateFrom, dateTo, orderTypeFilter]);

  const groupedItems = useMemo(() => {
    const groups = {};
    filtered.forEach(p => {
      const gid = p.orderId || p.orderCode; // Grouping by Order ID or Order Code
      if (!groups[gid]) {
        groups[gid] = {
          orderId: gid,
          orderCode: p.orderCode,
          customerName: p.customerName,
          customerPhone: p.customerPhone,
          orderType: p.orderType,
          items: [],
          date: p.date,
          status: "Hoàn thành" 
        };
      }
      groups[gid].items.push(p);
    });

    // Determine aggregate status for the group
    return Object.values(groups).map(g => {
      const total = g.items.length;
      const completed = g.items.filter(i => i.status === "Hoàn thành").length;
      g.totalCount = total;
      g.completedCount = completed;

      if (g.items.some(i => i.needsRedo)) g.status = "Sửa lại";
      else if (g.items.some(i => i.isDelayed)) g.status = "Báo chậm";
      else if (g.items.some(i => i.isPendingApproval)) g.status = "Chờ duyệt";
      else if (completed === total) g.status = "Hoàn thành";
      else {
        // Find the earliest stage among incomplete items (bottleneck)
        if (g.items.some(i => i.status === "Đang đánh giấy ráp")) g.status = "Đang đánh giấy ráp";
        else g.status = "Đang sơn";
      }
      return g;
    });
  }, [filtered]);

  const hasActiveFilters =
    statusFilter !== "Tất cả" || searchTerm !== "" || dateFrom !== "" || dateTo !== "" || orderTypeFilter !== "Tất cả";

  const clearAllFilters = () => {
    setStatusFilter("Tất cả");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setOrderTypeFilter("Tất cả");
  };

  const handleQuickComplete = (item) => {
    if (item.isPendingApproval) {
      setSelectedItem(item);
      setShowInspectModal(true);
    } else {
      toast((t) => (
        <div className="flex flex-col gap-3">
            Xác nhận <strong>Duyệt & Hoàn thành</strong> cho <strong>{item.orderCode}</strong>?
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setProductions(prev => prev.map(p =>
                  p.id === item.id
                    ? { ...p, isPendingApproval: true, quantityCompleted: p.quantityPlanned }
                    : p
                ));
                toast.success(`Đã ghi nhận yêu cầu duyệt cho ${item.orderCode}`);
              }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      ), { duration: 5000, position: 'top-center' });
    }
  };

  const handleApprove = (item) => {
    setProductions(prev => prev.map(p =>
      p.id === item.id
        ? { ...p, status: "Hoàn thành", isPendingApproval: false }
        : p
    ));
    setShowInspectModal(false);
  };

  const handleQuickRedo = (reason, backToStage) => {
    if (!selectedItem) return;
    
    const newStatus = backToStage === 'gia_cong_moc' ? "Đang đánh giấy ráp" : "Đang sơn";
    
    setProductions(prev => prev.map(p =>
      p.id === selectedItem.id
        ? { 
            ...p, 
            status: newStatus, 
            isPendingApproval: false, 
            needsRedo: true, 
            redoReason: reason, 
            subStage: backToStage,
            date: new Date().toISOString() // Update timestamp for sorting
          }
        : p
    ));
    
    toast.success(`Đã gửi yêu cầu sửa lại thành công tới ${selectedItem.assignedWorker || 'thợ phụ trách'}`);
    setShowRedoModal(false);
  };

  const handleDelaySubmit = () => {
    if (!newDeadline) {
      toast.error("Vui lòng chọn ngày giao mới!");
      return;
    }
    setProductions(prev => prev.map(p =>
      p.id === selectedItem.id
        ? { ...p, isDelayed: false, delayReason: null, expectedEndDate: newDeadline }
        : p
    ));
    setShowDelayModal(false);
    toast.success(`Đã gia hạn tiến độ thành công cho đơn ${selectedItem.orderCode}`);
  };




  const statusCounts = useMemo(() => {
    const validProductions = productions.filter(p => p.orderType !== "Hàng sẵn");
    const counts = { 
      "Tất cả": validProductions.length,
      "Đang đánh giấy ráp": validProductions.filter(p => p.status === "Đang đánh giấy ráp").length,
      "Đang sơn": validProductions.filter(p => p.status === "Đang sơn" && !p.isPendingApproval).length,
      "Chờ duyệt": validProductions.filter(p => p.isPendingApproval).length,
      "Hoàn thành": validProductions.filter(p => p.status === "Hoàn thành").length,
    };
    return counts;
  }, [productions]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo, orderTypeFilter]);

  const totalPages = Math.ceil(groupedItems.length / itemsPerPage);
  const paginatedGroups = groupedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý sản xuất - Chủ cửa hàng | TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <div>
            <h1
              className="text-[22px] font-bold flex items-center gap-2.5"
              style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}
            >
              <Hammer size={24} style={{ color: "#10B981" }} />
              Quản lý sản xuất
            </h1>
            <p
              className="text-[13px] mt-1 font-medium italic"
              style={{ color: "var(--text-placeholder)" }}
            >
              {groupedItems.length} đơn hàng đang sản xuất
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {STATUSES.map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive
                    ? (sc ? sc.bg : "#ECFDF5")
                    : "transparent",
                  color: isActive
                    ? (sc ? sc.text : "#059669")
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? (sc ? sc.border : "#A7F3D0")
                    : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: sc ? sc.text : "#10B981",
                    }}
                  />
                )}
                {s}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {statusCounts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search Header */}
          <div
            className="px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Tìm mã đơn hàng, thợ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                    style={{
                      borderColor: dateFrom
                        ? "var(--brand-primary)"
                        : "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                  style={{
                    borderColor: dateTo
                      ? "var(--brand-primary)"
                      : "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>

              {/* Order Type Filter */}
              <div className="flex items-center gap-2 ml-2">
                <Package size={14} style={{ color: "var(--text-placeholder)" }} />
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="h-9 px-3 pr-8 rounded-lg text-[13px] border focus:outline-none shadow-xs appearance-none cursor-pointer bg-white"
                  style={{
                    borderColor: orderTypeFilter !== "Tất cả" ? "var(--brand-primary)" : "var(--grid-border)",
                    color: "var(--text-main)",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                  }}
                >
                  {ORDER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full table-fixed text-left relative text-[13px]">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider w-[5%] text-center text-gray-400 shrink-0">STT</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider w-[15%] text-center text-gray-400">Mã đơn hàng</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider w-[30%] text-gray-400">Khách hàng</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider w-[15%] text-center text-gray-400">Loại hàng</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider w-[15%] text-center text-gray-400">Sản phẩm</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider w-[20%] text-center text-gray-400">Trạng thái tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedGroups.map((group, idx) => {
                  const isExpanded = expandedOrders.has(group.orderId);
                  const statusColors = {
                    "Sửa lại": { bg: "#FEF2F2", text: "#EF4444", border: "#FEE2E2" },
                    "Chờ duyệt": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
                    "Báo chậm": { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
                    "Đang sơn": { bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
                    "Đang đánh giấy ráp": { bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" },
                    "Hoàn thành": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
                  }[group.status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };

                  return (
                    <React.Fragment key={group.orderId}>
                      <tr 
                        className={`group hover:bg-slate-50 transition-all cursor-pointer ${isExpanded ? 'bg-emerald-50/20' : ''}`}
                        onClick={() => toggleOrder(group.orderId)}
                      >
                        <td className="px-6 py-5 text-[13px] font-medium text-gray-400 text-center">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <p className="text-[13px] font-black font-mono text-gray-900 tracking-tight">
                             {group.orderCode}
                          </p>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-[13px] text-gray-900 leading-tight">{group.customerName}</span>
                            {group.customerPhone && (
                              <span className="text-[11px] text-gray-400 font-medium mt-0.5">{group.customerPhone}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg uppercase tracking-tighter whitespace-nowrap shadow-xs">
                             {group.orderType}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black border border-gray-100 uppercase tracking-tighter flex items-center gap-1.5 w-fit mx-auto">
                            <Package size={12} className="opacity-50" /> {group.items.length} sản phẩm
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="flex flex-col items-center gap-1.5">
                             {/* Progress Info for multi-item orders */}
                             {group.totalCount > 1 && (
                               <span className="text-[10px] font-black text-gray-400 bg-gray-100/50 px-2 py-0.5 rounded-full border border-gray-100 uppercase tracking-tighter">
                                 {group.completedCount}/{group.totalCount} hoàn thành
                               </span>
                             )}
                             
                             <span
                               className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border"
                               style={{
                                 backgroundColor: statusColors.bg,
                                 color: statusColors.text,
                                 borderColor: statusColors.border
                               }}
                             >
                               <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: statusColors.text }} />
                               {group.status}
                             </span>
                           </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0 bg-white">
                            <div className="px-12 py-6">
                              <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden divide-y divide-gray-50 border-l-[6px] border-l-emerald-500">
                                <div className="px-6 py-3 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Chi tiết lệnh sản xuất</span>
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Đơn hàng: {group.orderCode}</span>
                                </div>
                                {group.items.map((item) => (
                                  <ProductionItemRow
                                    key={item.id}
                                    item={item}
                                    onInspect={(p) => { setSelectedItem(p); setShowInspectModal(true); }}
                                    onRedo={(p) => { setSelectedItem(p); setShowRedoModal(true); }}
                                    onDelay={(p) => { setSelectedItem(p); setNewDeadline(p.expectedEndDate || ""); setShowDelayModal(true); }}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {groupedItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div
                        className="flex flex-col items-center gap-2"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-main)" }}
                        >
                          <Hammer size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm
                            ? `Không tìm thấy lệnh sản xuất "${searchTerm}"`
                            : "Chưa có lệnh sản xuất nào"}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-[13px] font-medium cursor-pointer"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t shrink-0"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              <div
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Tổng số đơn hàng:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {groupedItems.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Items per page indicator */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Số bản ghi/trang
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to page 1 when changing items per page
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                    style={{
                      borderColor: "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {[15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range Info */}
                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, groupedItems.length)}
                  </span>{" "}
                  đơn hàng
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Redo Modal */}
        {showRedoModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-600">
                  <AlertTriangle size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Yêu cầu sửa lại sản phẩm</h3>
                </div>
                <button onClick={() => setShowRedoModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-white rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Sản phẩm đang xử lý</p>
                  <p className="text-[13px] font-bold text-gray-900">{selectedItem.productName}</p>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Nguyên nhân lỗi / Dặn dò thợ</label>
                  <textarea
                    id="redoReasonQuick"
                    className="w-full h-24 p-4 rounded-2xl border border-gray-200 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition resize-none"
                    placeholder="Ví dụ: Màu sơn chưa đều, còn xước ở cạnh bàn..."
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Quay lại công đoạn</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleQuickRedo(document.getElementById('redoReasonQuick').value, 'gia_cong_moc')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group"
                    >
                      <Hammer size={20} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Gia công Mộc</span>
                    </button>
                    <button
                      onClick={() => handleQuickRedo(document.getElementById('redoReasonQuick').value, 'son_hoan_thien')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group"
                    >
                      <Paintbrush size={20} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Sơn hoàn thiện</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowRedoModal(false)}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 hover:text-gray-600 transition"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Photo Inspection Modal */}
        {showInspectModal && selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-blue-50/30">
                <div className="flex items-center gap-3 text-blue-600">
                  <Camera size={22} />
                  <h3 className="text-[17px] font-bold uppercase tracking-tight">Nghiệm thu sản phẩm qua ảnh</h3>
                </div>
                <button
                  onClick={() => setShowInspectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo Preview */}
                  <div className="flex-1 aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                    <img
                      src={selectedItem.completionPhoto}
                      alt="Ảnh hoàn thiện"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details & Decision */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Đơn hàng</p>
                        <p className="text-[15px] font-bold text-gray-900">{selectedItem.orderCode}</p>
                        <p className="text-[13px] text-gray-600 mt-1">{selectedItem.productName}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <p className="text-[11px] text-emerald-600/60 font-bold uppercase mb-1">Thợ cả báo xong</p>
                        <p className="text-[14px] font-bold text-emerald-900">{selectedItem.assignedWorker}</p>
                        <p className="text-[12px] text-emerald-600 mt-0.5">Thời gian: {formatDateTime(new Date())}</p>
                      </div>

                      <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <p className="text-[12px] leading-relaxed">
                          Hãy kiểm tra kỹ các góc cạnh, màu sơn và quy cách so với yêu cầu khách hàng trước khi phê duyệt.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <button
                        onClick={() => handleApprove(selectedItem)}
                        className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                      >
                        <CheckCircle size={20} /> Duyệt & Hoàn thành
                      </button>
                      <button
                        onClick={() => {
                          setShowInspectModal(false);
                          setShowRedoModal(true);
                        }}
                        className="w-full h-14 rounded-2xl bg-white border-2 border-red-200 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95"
                      >
                        <RotateCcw size={20} /> Sai mẫu - Yêu cầu sửa lại
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delay Handling Modal */}
        {showDelayModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Gia hạn sản xuất</h3>
                </div>
                <button onClick={() => setShowDelayModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-white rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-[11px] text-red-400 font-bold uppercase mb-1">Lý do thợ cả báo chậm</p>
                  <p className="text-[13px] font-medium text-red-900 leading-relaxed italic border-l-2 border-red-300 pl-3 py-1">
                    "{selectedItem.delayReason}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <p className="text-[11px] text-gray-400 font-bold uppercase">Thông tin liên hệ</p>
                  <div className="text-[13px] font-bold text-gray-900">
                    Khách hàng: {selectedItem.customerName}
                  </div>
                  <div className="text-[13px] text-gray-600">
                    Sản phẩm: {selectedItem.productName}
                  </div>
                  <div className="mt-2 text-[12px] text-blue-600 font-medium">
                    Hãy liên hệ với khách hàng để thông báo trước khi gia hạn.
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Lùi ngày giao mới</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => setShowDelayModal(false)}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 hover:bg-gray-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelaySubmit}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-md"
                >
                  Xác nhận gia hạn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
