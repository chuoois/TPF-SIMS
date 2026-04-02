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
  Hammer,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Camera,
  Paintbrush,
  ClipboardList,
  Clock,
  Layers,
  Settings,
  Activity,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import { MOCK_PRODUCTIONS, STAGES, STATUS_ICONS } from "./mockData";

const STATUSES = ["Tất cả", "Đang đánh giấy ráp", "Đang sơn", "Chờ duyệt", "Hoàn thành"];
const ORDER_TYPES = ["Tất cả", "Hàng mộc", "Hàng khách đặt"];

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

  if (diffDays < 0) return { color: "var(--status-error)", text: formatDate(dateString), urgent: true };
  if (diffDays <= 3) return { color: "var(--status-pending)", text: formatDate(dateString), urgent: true };
  return { color: "var(--text-main)", text: formatDate(dateString), urgent: false };
};

const getStatusColor = (status, subStage = null, isPendingApproval = false, needsRedo = false) => {
  const displayStatus = isPendingApproval ? "Chờ duyệt" : status;

  const primaryBadge = {
    // "Đang đánh giấy ráp" -> Grey (Like "Đơn đã hủy")
    "Đang đánh giấy ráp": { label: "Đang đánh giấy ráp", bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB", icon: Layers },
    // "Đang sơn" -> Blue (Like "Khảo sát")
    "Đang sơn": { label: "Đang sơn", bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD", icon: Settings },
    // "Chờ duyệt" -> Amber (Like "Đang xử lý")
    "Chờ duyệt": { label: "Chờ duyệt", bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", icon: Clock },
    // "Hoàn thành" -> Green (Like "Đã tạo đơn")
    "Hoàn thành": { label: "Hoàn thành", bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", icon: CheckCircle2 },
  }[displayStatus] || { label: displayStatus, bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB", icon: Package };

  let detailBadge = null;
  if (needsRedo) {
    detailBadge = { label: "Sửa lại", bg: "#FEE2E2", text: "#E5484D", border: "#FECACA", icon: AlertTriangle };
  }

  return { primaryBadge, detailBadge };
};

const ProductionItemRow = ({ item, onInspect, onRedo, onDelay }) => {
  const sc = getStatusColor(item.status, item.subStage, item.isPendingApproval, item.needsRedo);
  const ds = getDeadlineStyle(item.expectedEndDate);

  const steps = ["Mộc", "Sơn", "Duyệt", "Xong"];
  let currentStep = 0;
  if (item.status === "Hoàn thành") currentStep = 3;
  else if (item.isPendingApproval) currentStep = 2;
  else if (item.status === "Đang sơn") currentStep = 1;

  return (
    <div className="flex flex-col gap-3 py-4 px-6 border-b border-border last:border-0 hover:bg-muted/50 transition-all rounded-xl group/item">
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-border bg-muted relative">
          <img
            src={item.productImage}
            alt={item.productName}
            className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-500"
          />
          {item.needsRedo && (
            <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center border border-destructive/20 rounded-xl">
              <RotateCcw size={16} className="text-destructive drop-shadow-sm animate-spin-slow" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-[14px] font-bold text-foreground truncate uppercase tracking-tight">
              {item.productName}
            </h4>
            {item.needsRedo && (
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-tighter">Cần sửa lại</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium italic">Tiến độ:</span>
              <div className="flex items-center gap-1">
                {steps.map((s, idx) => (
                  <React.Fragment key={s}>
                    <span className={`font-bold ${idx <= currentStep ? (idx === 3 ? "text-primary" : "text-palette-blue") : "text-muted-foreground/30"}`}
                      style={{ color: idx <= currentStep ? (idx === 3 ? "var(--status-success)" : "var(--palette-blue)") : undefined }}>
                      {s}
                    </span>
                    {idx < steps.length - 1 && <span className="text-border">/</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium italic">Thợ:</span>
              <span className="font-bold text-foreground/80">{item.assignedWorker?.replace("Thợ cả: ", "") || "Chưa giao"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium italic">Hạn:</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-muted text-[10px]" style={{ color: ds.color }}>{ds.text}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-6">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: sc.primaryBadge.bg,
                  color: sc.primaryBadge.text,
                  border: `1px solid ${sc.primaryBadge.border}`,
                }}
              >
                {sc.primaryBadge.label}
              </span>
            </div>
            {item.isDelayed && (
              <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-yellow-50 text-status-pending border border-yellow-200 italic"
                style={{ color: "var(--status-pending)" }}>
                <AlertTriangle size={10} /> Chậm trễ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 transition-all">
            <Link
              to={`/owner/production/${item.id}`}
              className="h-9 px-4 rounded-xl border border-border flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition bg-background text-[12px] font-bold"
            >
              <Eye size={16} />
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>

      <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            backgroundColor: currentStep === 3 ? "var(--status-success)" : "var(--palette-blue)"
          }}
        />
      </div>
    </div>
  );
};

export default function OwnerProduction() {
  const [productions, setProductions] = useState(() => {
    try {
      const saved = localStorage.getItem("tpf_simulated_productions");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error loading productions from localStorage", e);
    }
    return Object.values(MOCK_PRODUCTIONS);
  });

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo, orderTypeFilter]);

  const filtered = useMemo(() => {
    let result = productions.filter(p => p.orderType !== "Hàng sẵn");
    if (statusFilter !== "Tất cả") {
      if (statusFilter === "Chờ duyệt") result = result.filter(p => p.isPendingApproval);
      else if (statusFilter === "Đang sơn") result = result.filter(p => p.status === "Đang sơn" && !p.isPendingApproval);
      else result = result.filter((p) => p.status === statusFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).setHours(0, 0, 0, 0);
      result = result.filter((p) => new Date(p.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23, 59, 59, 999);
      result = result.filter((p) => new Date(p.date) <= to);
    }
    if (orderTypeFilter !== "Tất cả") result = result.filter((p) => p.orderType === orderTypeFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => p.orderCode?.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productions, searchTerm, statusFilter, dateFrom, dateTo, orderTypeFilter]);

  const groupedItems = useMemo(() => {
    const groups = {};
    filtered.forEach(p => {
      const gid = p.orderId || p.orderCode;
      if (!groups[gid]) {
        groups[gid] = {
          orderId: gid, orderCode: p.orderCode, customerName: p.customerName,
          customerPhone: p.customerPhone, orderType: p.orderType, items: [],
          date: p.date, status: "Hoàn thành"
        };
      }
      groups[gid].items.push(p);
    });

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
        if (g.items.some(i => i.status === "Đang đánh giấy ráp")) g.status = "Đang đánh giấy ráp";
        else g.status = "Đang sơn";
      }
      return g;
    });
  }, [filtered]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return groupedItems.slice(start, start + itemsPerPage);
  }, [groupedItems, currentPage, itemsPerPage]);

  const tableData = useMemo(() => paginatedGroups.map(g => ({ ...g, id: g.orderId })), [paginatedGroups]);

  const columns = [
    {
      header: "STT",
      headerClassName: "text-center w-[60px]",
      className: "text-center font-medium",
      style: { color: "var(--text-secondary)" },
      render: (_, i) => (currentPage - 1) * itemsPerPage + i + 1,
    },
    {
      header: "Mã lệnh",
      className: "font-bold font-mono",
      style: { color: "var(--text-main)" },
      render: (row) => row.orderCode
    },
    {
      header: "Khách hàng",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] border transition shrink-0 bg-muted text-muted-foreground border-border group-hover:bg-white"
          >
            {row.customerName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: "var(--text-main)" }}>
              {row.customerName}
            </p>
            <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {row.customerPhone}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Loại hàng",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) => (
        <span className="text-[11px] font-bold text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-lg uppercase tracking-tighter whitespace-nowrap shadow-xs">
          {row.orderType}
        </span>
      ),
    },
    {
      header: "Sản phẩm",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) => (
        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-black border border-border uppercase tracking-tighter flex items-center gap-1.5 w-fit mx-auto">
          <Package size={12} className="opacity-50" /> {row.items.length} sp
        </span>
      ),
    },
    {
      header: "Trạng thái",
      headerClassName: "text-right pr-6",
      className: "text-right",
      render: (row) => {
        const sc = getStatusColor(row.status, row.subStage, row.isPendingApproval, row.needsRedo).primaryBadge;
        const Icon = sc.icon || Package;

        return (
          <div className="flex justify-end pr-2">
            <div className="flex items-center gap-2">
              {row.totalCount > 1 && row.status !== "Hoàn thành" && (
                <span className="text-[10px] font-black text-muted-foreground mr-1 uppercase tracking-tighter opacity-60 whitespace-nowrap">
                  {row.completedCount}/{row.totalCount}
                </span>
              )}
              <span
                className="inline-flex items-center justify-center w-[165px] px-2 py-1 text-[9.5px] font-black uppercase tracking-tighter rounded-md border gap-1.5 whitespace-nowrap"
                style={{
                  backgroundColor: sc.bg,
                  color: sc.text,
                  borderColor: sc.border,
                }}
              >
                <Icon size={12} className="shrink-0" />
                {sc.label}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const handleApprove = (item) => {
    setProductions(prev => prev.map(p => p.id === item.id ? { ...p, status: "Hoàn thành", isPendingApproval: false } : p));
    setShowInspectModal(false);
    toast.success(`Đã nghiệm thu xong ${item.productName}`);
  };

  const handleQuickRedo = (reason, backToStage) => {
    if (!selectedItem) return;
    const newStatus = backToStage === 'gia_cong_moc' ? "Đang đánh giấy ráp" : "Đang sơn";
    setProductions(prev => prev.map(p =>
      p.id === selectedItem.id
        ? { ...p, status: newStatus, isPendingApproval: false, needsRedo: true, redoReason: reason, subStage: backToStage, date: new Date().toISOString() }
        : p
    ));
    toast.success(`Đã gửi yêu cầu sửa lại thành công`);
    setShowRedoModal(false);
  };

  const handleDelaySubmit = () => {
    if (!newDeadline) return toast.error("Vui lòng chọn ngày giao mới!");
    setProductions(prev => prev.map(p => p.id === selectedItem.id ? { ...p, isDelayed: false, delayReason: null, expectedEndDate: newDeadline } : p));
    setShowDelayModal(false);
    toast.success(`Đã gia hạn tiến độ thành công`);
  };

  const statusCounts = useMemo(() => {
    const valid = productions.filter(p => p.orderType !== "Hàng sẵn");
    return {
      "Tất cả": valid.length,
      "Đang đánh giấy ráp": valid.filter(p => p.status === "Đang đánh giấy ráp").length,
      "Đang sơn": valid.filter(p => p.status === "Đang sơn" && !p.isPendingApproval).length,
      "Chờ duyệt": valid.filter(p => p.isPendingApproval).length,
      "Hoàn thành": valid.filter(p => p.status === "Hoàn thành").length,
    };
  }, [productions]);

  const hasActiveFilters = statusFilter !== "Tất cả" || searchTerm !== "" || dateFrom !== "" || dateTo !== "" || orderTypeFilter !== "Tất cả";
  const clearAllFilters = () => {
    setStatusFilter("Tất cả"); setSearchTerm(""); setDateFrom(""); setDateTo(""); setOrderTypeFilter("Tất cả");
  };

  return (
    <>
      <PageHelmet title="Quản lý sản xuất - Chủ cửa hàng | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Hammer size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý sản xuất
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {groupedItems.length} đơn hàng đang sản xuất ({statusFilter.toLowerCase()})
            </p>
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {STATUSES.map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s).primaryBadge : null;
            const Icon = STATUS_ICONS[s];
            return (
              <button
                key={s} onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive ? (sc ? sc.bg : "white") : "transparent",
                  color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)",
                  borderColor: isActive ? (sc ? sc.border : "var(--grid-border)") : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(31, 23, 23, 0.05)" : "none",
                }}
              >
                {Icon && <Icon size={14} />}
                {s}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">{statusCounts[s] || 0}</span>
              </button>
            );
          })}
        </div>

        <DataTable
          columns={columns} data={tableData} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm mã đơn hàng, khách hàng..." dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo} hasActiveFilters={hasActiveFilters} clearAllFilters={clearAllFilters}
          pagination={{ total: groupedItems.length, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }}
          expandedIds={Array.from(expandedOrders)} onToggleExpand={toggleOrder}
          renderDetail={(group) => {
            const progress = Math.round((group.completedCount / group.totalCount) * 100);
            return (
              <div className="px-12 py-8 bg-muted relative overflow-hidden">
                <div className="absolute top-0 left-[2.5rem] bottom-0 w-px bg-border" />

                <div className="relative bg-background border border-border rounded-2xl flex flex-col overflow-hidden">
                  <div className="px-8 py-5 bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl border ${progress === 100 ? "bg-accent text-primary border-primary/20" : "bg-muted text-palette-blue border-border"}`}>
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-[14px] font-bold text-foreground uppercase tracking-tight">Chi tiết lệnh sản xuất</h5>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${progress === 100 ? "bg-primary text-white" : "bg-palette-blue text-white"}`}
                            style={{ backgroundColor: progress === 100 ? "var(--status-success)" : "var(--palette-blue)" }}>
                            {progress}% Hoàn thành
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground font-medium">Mã đơn: <span className="text-foreground font-bold">{group.orderCode}</span> • Tổng số {group.totalCount} sản phẩm</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
                      <div className="flex justify-between w-full text-[10px] font-black text-muted-foreground uppercase">
                        <span>Tiến độ tổng</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: progress === 100 ? "var(--status-success)" : "var(--palette-blue)"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-border/20">
                    {group.items.map((item) => (
                      <ProductionItemRow
                        key={item.id} item={item}
                        onInspect={(p) => { setSelectedItem(p); setShowInspectModal(true); }}
                        onRedo={(p) => { setSelectedItem(p); setShowRedoModal(true); }}
                        onDelay={(p) => { setSelectedItem(p); setNewDeadline(p.expectedEndDate || ""); setShowDelayModal(true); }}
                      />
                    ))}
                  </div>

                  <div className="px-8 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground italic tracking-tight">* Tiến độ được thợ xưởng cập nhật trực tiếp.</span>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--status-success)" }} /> Hoàn thành: {group.completedCount}</span>
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--palette-blue)" }} /> Đang sản xuất: {group.totalCount - group.completedCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
          extraFilters={
            <div className="flex items-center gap-2">
              <select
                value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)}
                className="h-10 px-3 pr-8 rounded-lg text-[13px] border border-gray-200 outline-none cursor-pointer bg-white font-medium"
              >
                {ORDER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          }
        />

        {showRedoModal && selectedItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowRedoModal(false)} />
            <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-600">
                  <AlertTriangle size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Yêu cầu sửa lại sản phẩm</h3>
                </div>
                <button onClick={() => setShowRedoModal(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sản phẩm đang xử lý</p>
                  <p className="text-[13px] font-bold text-gray-900">{selectedItem.productName}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 ml-1">Nguyên nhân lỗi / Dặn dò thợ</label>
                  <textarea id="redoReasonQuick" className="w-full h-24 p-4 rounded-lg border border-gray-200 text-[13px] outline-none transition resize-none" placeholder="Ví dụ: Màu sơn chưa đều, còn xước ở cạnh bàn..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleQuickRedo(document.getElementById('redoReasonQuick').value, 'gia_cong_moc')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group">
                    <Hammer size={20} className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Gia công Mộc</span>
                  </button>
                  <button onClick={() => handleQuickRedo(document.getElementById('redoReasonQuick').value, 'son_hoan_thien')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group">
                    <Paintbrush size={20} className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Sơn hoàn thiện</span>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end gap-3"><button onClick={() => setShowRedoModal(false)} className="px-5 py-2 rounded-lg text-[13px] font-bold text-gray-500 hover:bg-gray-100 transition-all">Hủy bỏ</button></div>
            </div>
          </div>
        )}

        {showInspectModal && selectedItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" onClick={() => setShowInspectModal(false)} />
            <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between px-8 py-5 border-b bg-blue-50/30">
                <div className="flex items-center gap-3 text-blue-600"><Camera size={22} /><h3 className="text-[17px] font-bold uppercase tracking-tight">Nghiệm thu sản phẩm qua ảnh</h3></div>
                <button onClick={() => setShowInspectModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 aspect-square rounded-lg overflow-hidden border bg-gray-50"><img src={selectedItem.completionPhoto} alt="Ảnh hoàn thiện" className="w-full h-full object-cover" /></div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Đơn hàng</p>
                        <p className="text-[15px] font-bold text-gray-900">{selectedItem.orderCode}</p>
                        <p className="text-[13px] text-gray-600 mt-1">{selectedItem.productName}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                        <p className="text-[10px] text-emerald-600/60 font-bold uppercase mb-1">Thợ cả báo xong</p>
                        <p className="text-[14px] font-bold text-emerald-900">{selectedItem.assignedWorker}</p>
                        <p className="text-[12px] text-emerald-600 mt-0.5">{formatDateTime(new Date())}</p>
                      </div>
                      <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" /><p className="text-[12px] leading-relaxed font-medium">Hãy kiểm tra kỹ các góc cạnh, màu sơn và quy cách so với yêu cầu khách hàng trước khi phê duyệt.</p>
                      </div>
                    </div>
                    <div className="space-y-3 mt-8">
                      <button onClick={() => handleApprove(selectedItem)} className="w-full h-12 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg">Duyệt & Hoàn thành</button>
                      <button onClick={() => { setShowInspectModal(false); setShowRedoModal(true); }} className="w-full h-12 rounded-lg bg-white border border-red-200 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all">Sai mẫu - Sửa lại</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDelayModal && selectedItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowDelayModal(false)} />
            <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-red-50/50">
                <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={18} /><h3 className="text-[15px] font-bold uppercase tracking-tight">Gia hạn sản xuất</h3></div>
                <button onClick={() => setShowDelayModal(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="p-4 rounded-lg bg-red-50 border border-red-100"><p className="text-[10px] text-red-400 font-bold uppercase mb-1">Lý do báo chậm</p><p className="text-[13px] font-medium text-red-900 italic border-l-2 border-red-300 pl-3 py-1">"{selectedItem.delayReason}"</p></div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 block">Đơn hàng: {selectedItem.orderCode}</p>
                  <div className="text-[13px] text-gray-600 font-medium">Sản phẩm: {selectedItem.productName}</div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2 ml-1">Lùi ngày giao mới</label>
                  <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="w-full h-11 px-4 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-red-300 transition" />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                <button onClick={() => setShowDelayModal(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-500 hover:bg-gray-100 transition-all">Hủy bỏ</button>
                <button onClick={handleDelaySubmit} className="px-6 py-2.5 rounded-lg text-[13px] font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-sm">Duyệt gia hạn</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
