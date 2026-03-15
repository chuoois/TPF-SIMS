/**
 * Component SalesCustomerManage
 * Quản lý khách hàng — CRUD với static data + Phân trang
 *
 * Created By: DNC
 * Created Date: 24/02/2026
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus,
  Pencil,
  NotebookPen,
  X,
  Search,
  Users,
  User,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ShoppingCart, Package, ChevronDown } from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import { INITIAL_ORDERS } from "../order-manage";
import { MOCK_ORDERS_DETAIL } from "../order-manage/detail";

// ===================== STATIC DATA =====================
const INITIAL_CUSTOMERS = [
  {
    id: "KH001",
    code: "KH-0001",
    name: "Nguyễn Văn Hoàng",
    phone: "0901234567",
    email: "hoang@gmail.com",
    gender: "Nam",
    dob: "1990-05-15",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    note: "Khách VIP, thích gỗ óc chó",
    createdAt: "2026-01-15",
  },
  {
    id: "KH002",
    code: "KH-0002",
    name: "Trần Thị Mai",
    phone: "0912345678",
    email: "mai.tran@gmail.com",
    gender: "Nữ",
    dob: "1985-08-22",
    address: "456 Lê Lợi, Q.3, TP.HCM",
    note: "",
    createdAt: "2026-01-20",
  },
  {
    id: "KH003",
    code: "KH-0003",
    name: "Lê Minh Tuấn",
    phone: "0923456789",
    email: "",
    gender: "Nam",
    dob: "",
    address: "789 Trần Hưng Đạo, Q.5, TP.HCM",
    note: "Cần giao trước 16h",
    createdAt: "2026-02-01",
  },
  {
    id: "KH004",
    code: "KH-0004",
    name: "Phạm Thị Lan",
    phone: "0934567890",
    email: "lan.pham@company.vn",
    gender: "Nữ",
    dob: "1992-12-03",
    address: "12 Pasteur, Q.1, TP.HCM",
    note: "",
    createdAt: "2026-02-10",
  },
  {
    id: "KH005",
    code: "KH-0005",
    name: "Võ Đức Anh",
    phone: "0945678901",
    email: "",
    gender: "Nam",
    dob: "1988-03-18",
    address: "",
    note: "Mua sỉ, cần chiết khấu",
    createdAt: "2026-02-15",
  },
  {
    id: "KH006",
    code: "KH-0006",
    name: "Đặng Thùy Linh",
    phone: "0956789012",
    email: "linh.dang@gmail.com",
    gender: "Nữ",
    dob: "",
    address: "34 Hai Bà Trưng, Q.1, TP.HCM",
    note: "",
    createdAt: "2026-02-20",
  },
  {
    id: "KH007",
    code: "KH-0007",
    name: "Bùi Tuấn Anh",
    phone: "0967890123",
    email: "tuananh.bui@gmail.com",
    gender: "Nam",
    dob: "1995-11-20",
    address: "55 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
    note: "",
    createdAt: "2026-02-22",
  },
  {
    id: "KH008",
    code: "KH-0008",
    name: "Hoàng Nguyệt Ánh",
    phone: "0978901234",
    email: "anh.hoang@yahoo.com",
    gender: "Nữ",
    dob: "1982-04-10",
    address: "89 Lê Duẩn, Q.1, TP.HCM",
    note: "Chỉ nhận hàng vào thứ 7",
    createdAt: "2026-02-25",
  },
  {
    id: "KH009",
    code: "KH-0009",
    name: "Đinh Quang Hiếu",
    phone: "0989012345",
    email: "quanghieu.dinh@outlook.com",
    gender: "Nam",
    dob: "1978-01-05",
    address: "23 Võ Văn Tần, Q.3, TP.HCM",
    note: "",
    createdAt: "2026-03-01",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH010",
    code: "KH-0010",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH011",
    code: "KH-0011",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH012",
    code: "KH-0012",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH013",
    code: "KH-0013",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH014",
    code: "KH-0014",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH015",
    code: "KH-0015",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
  {
    id: "KH016",
    code: "KH-0016",
    name: "Vũ Phương Thảo",
    phone: "0990123456",
    email: "thao.vu@gmail.com",
    gender: "Nữ",
    dob: "1998-09-30",
    address: "102 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    note: "Cần xuất hóa đơn đỏ",
    createdAt: "2026-03-02",
  },
];



const GENDER_OPTIONS = ["Nam", "Nữ", "Khác"];

// ===================== HELPERS =====================
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const inputBase =
  "w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent";
const inputIconBase =
  "w-full text-[13px] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent";
const inputStyle = {
  border: "1px solid var(--grid-border)",
  color: "var(--text-main)",
};
const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider mb-1.5 block";

// ===================== COMPONENT =====================
export default function SalesCustomerManage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    address: "",
    note: "",
  });
  const [noteText, setNoteText] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // Filtered customers
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const q = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [searchTerm, customers]);

  // Reset trang về 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handlers
  const handleOpenCreate = () => {
    setCurrentCustomer(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      gender: "",
      dob: "",
      address: "",
      note: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c) => {
    setCurrentCustomer(c);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      gender: c.gender || "",
      dob: c.dob || "",
      address: c.address || "",
      note: c.note || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenHistory = (c) => {
    setCurrentCustomer(c);
    const matched = INITIAL_ORDERS
      .filter(o => o.customerName === c.name || o.phone === c.phone)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setCustomerOrders(matched);
    setIsHistoryOpen(true);
  };

  const handleOpenNote = (c) => {
    setCurrentCustomer(c);
    setNoteText(c.note || "");
    setIsNoteOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) errors.phone = "Vui lòng nhập SĐT";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    if (currentCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === currentCustomer.id ? { ...c, ...form } : c)),
      );
      showToast("success", "Cập nhật hồ sơ thành công");
    } else {
      const newId = `KH${String(customers.length + 1).padStart(3, "0")}`;
      setCustomers((prev) => [
        ...prev,
        {
          id: newId,
          code: `KH-${String(customers.length + 1).padStart(4, "0")}`,
          ...form,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
      showToast("success", "Tạo hồ sơ khách hàng thành công");
    }
    setIsFormOpen(false);
    setCurrentCustomer(null);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === currentCustomer.id ? { ...c, note: noteText } : c,
      ),
    );
    showToast("success", "Ghi chú đã được cập nhật");
    setIsNoteOpen(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setCustomers((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
    showToast("success", "Xóa khách hàng thành công");
    setDeleteConfirm(null);
  };

  const updateForm = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: null }));
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý khách hàng - TPF-SIMS" />

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-medium text-white animate-in slide-in-from-top-2"
          style={{
            backgroundColor:
              toast.type === "success"
                ? "var(--status-success)"
                : "var(--status-error)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="mr-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100 cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-main)" }}
            >
              Khách hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} khách hàng
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="h-9 px-4 text-[13px] font-semibold text-white rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.97]"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={15} className="mr-1.5" /> Thêm khách hàng
          </Button>
        </div>

        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search */}
          <div
            className="px-4 py-3 border-b shrink-0"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="relative max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, mã KH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                style={{
                  border: "1px solid var(--grid-border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Container - Fixed Height Scroll */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  {[
                    "STT",
                    "Khách hàng",
                    "SĐT / Email",
                    "Địa chỉ",
                    "Ghi chú",
                    "Ngày tạo",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 6 ? "text-right" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    style={{ borderBottom: "1px solid var(--grid-border)" }}
                  >
                    <td
                      className="px-4 py-3 text-[12px] font-medium"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0"
                          style={{
                            backgroundColor: "var(--status-focus)",
                            color: "var(--brand-primary)",
                          }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: "var(--text-main)" }}
                          >
                            {c.name}
                          </p>
                          <p
                            className="text-[10px] font-mono tracking-wide"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            {c.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: "var(--text-main)" }}
                      >
                        {c.phone}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {c.email || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="text-[12px] max-w-[180px] truncate"
                        style={{ color: "var(--text-secondary)" }}
                        title={c.address}
                      >
                        {c.address || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      {c.note ? (
                        <p
                          className="text-[12px] italic line-clamp-2"
                          style={{ color: "var(--text-secondary)" }}
                          title={c.note}
                        >
                          {c.note}
                        </p>
                      ) : (
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-[12px]"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Sửa"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenHistory(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-blue-50 hover:text-blue-500"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Lịch sử mua hàng"
                        >
                          <ShoppingCart size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenNote(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-amber-50"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Ghi chú"
                        >
                          <NotebookPen size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-red-50 hover:text-red-500"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedCustomers.length === 0 && (
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
                          <Users size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm
                            ? `Không tìm thấy "${searchTerm}"`
                            : "Chưa có khách hàng nào"}
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
                Tổng số bản ghi:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {filtered.length}
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
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  bản ghi
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
      </div>

      {/* ═══ MODAL: CREATE / EDIT ═══ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsFormOpen(false)}
          />
          <div
            className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--status-focus)",
                    color: "var(--brand-primary)",
                  }}
                >
                  <UserPlus size={16} />
                </div>
                <h2
                  className="text-[15px] font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {currentCustomer ? "Cập nhật hồ sơ" : "Thêm khách hàng mới"}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                style={{ color: "var(--text-placeholder)" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {/* Name */}
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Họ và tên{" "}
                  <span style={{ color: "var(--status-error)" }}>*</span>
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Nhập họ tên"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className={inputIconBase}
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.name
                        ? "var(--status-error)"
                        : "var(--grid-border)",
                    }}
                    autoFocus
                  />
                </div>
                {formErrors.name && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--status-error)" }}
                  >
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Số điện thoại{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    <input
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      className={inputIconBase}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.phone
                          ? "var(--status-error)"
                          : "var(--grid-border)",
                      }}
                    />
                  </div>
                  {formErrors.phone && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--status-error)" }}
                    >
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className={inputIconBase}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Gender + DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Giới tính
                  </label>
                  <div className="flex gap-1.5">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateForm("gender", g)}
                        className="flex-1 text-[13px] rounded-lg py-2 transition font-medium cursor-pointer"
                        style={{
                          border: `1px solid ${form.gender === g ? "var(--brand-primary)" : "var(--grid-border)"}`,
                          backgroundColor:
                            form.gender === g
                              ? "var(--status-focus)"
                              : "transparent",
                          color:
                            form.gender === g
                              ? "var(--brand-primary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Ngày sinh
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => updateForm("dob", e.target.value)}
                      className={inputIconBase}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Số nhà, đường, quận/huyện"
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    className={inputIconBase}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Ghi chú
                </label>
                <textarea
                  placeholder="Ghi chú về khách hàng..."
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                  rows={2}
                  className="w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition resize-none bg-transparent"
                  style={inputStyle}
                />
              </div>

              {/* Actions */}
              <div
                className="flex justify-end gap-2.5 pt-3 border-t"
                style={{ borderColor: "var(--grid-border)" }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg cursor-pointer text-[13px]"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="rounded-lg text-[13px] font-bold text-white min-w-[120px] cursor-pointer"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  {currentCustomer ? "Cập nhật" : "Thêm khách hàng"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: NOTE ═══ */}
      {isNoteOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsNoteOpen(false)}
          />
          <div
            className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div>
                <h2
                  className="text-[15px] font-bold flex items-center gap-2"
                  style={{ color: "var(--text-main)" }}
                >
                  <NotebookPen
                    size={15}
                    style={{ color: "var(--status-pending)" }}
                  />{" "}
                  Ghi chú đặc biệt
                </h2>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  {currentCustomer.name} – {currentCustomer.code}
                </p>
              </div>
              <button
                onClick={() => setIsNoteOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                style={{ color: "var(--text-placeholder)" }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Nội dung ghi chú{" "}
                  <span style={{ color: "var(--status-error)" }}>*</span>
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  placeholder="VD: Giao trước 16h, sơn màu kem..."
                  className="w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition resize-none bg-transparent"
                  style={inputStyle}
                />
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FED7AA",
                }}
              >
                <p
                  className="text-[12px]"
                  style={{ color: "var(--status-pending)" }}
                >
                  💡 Ghi chú dành cho yêu cầu đặc biệt: ngày giao, màu sơn, vị
                  trí lắp đặt...
                </p>
              </div>
              <div
                className="flex justify-end gap-2.5 pt-3 border-t"
                style={{ borderColor: "var(--grid-border)" }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNoteOpen(false)}
                  className="rounded-lg cursor-pointer text-[13px]"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                  className="rounded-lg text-[13px] font-bold text-white cursor-pointer disabled:opacity-40"
                  style={{ backgroundColor: "var(--status-pending)" }}
                >
                  Lưu ghi chú
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE ═══ */}
      {/* ═══ MODAL: HISTORY ═══ */}
      {isHistoryOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div
            className="relative bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div>
                <h2
                  className="text-[15px] font-bold flex items-center gap-2"
                  style={{ color: "var(--text-main)" }}
                >
                  <ShoppingCart
                    size={16}
                    style={{ color: "var(--brand-primary)" }}
                  />{" "}
                  Lịch sử mua hàng
                </h2>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Khách hàng: <strong style={{ color: "var(--text-main)" }}>{currentCustomer.name}</strong> – {currentCustomer.code}
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                style={{ color: "var(--text-placeholder)" }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {customerOrders.length > 0 ? (
                <div className="space-y-3">
                  {customerOrders.map(order => {
                    const isExpanded = expandedOrderId === (order.id + order.code);
                    const detail = MOCK_ORDERS_DETAIL[order.id];
                    const products = detail?.products || [];
                    const fmtCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "—";

                    return (
                      <div key={order.id + order.code} className="border rounded-xl overflow-hidden transition-all" style={{ borderColor: isExpanded ? "var(--brand-primary)" : "var(--grid-border)" }}>
                        {/* Order header — clickable */}
                        <div
                          className="p-4 cursor-pointer transition-colors hover:bg-gray-50"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id + order.code)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[13px] font-mono" style={{ color: "var(--brand-primary)" }}>{order.code}</span>
                              <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium" style={{
                                backgroundColor: order.type === "Hàng sẵn" ? "#EFF6FF" : "#F5F3FF",
                                color: order.type === "Hàng sẵn" ? "#1D4ED8" : "#7C3AED"
                              }}>{order.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ 
                                backgroundColor: order.status === "Giao hàng thành công" ? "#dcfce7" : order.status === "Đã hủy" ? "#fee2e2" : order.status === "Chờ duyệt hủy" ? "#fef3c7" : "#EFF6FF",
                                color: order.status === "Giao hàng thành công" ? "#166534" : order.status === "Đã hủy" ? "#991b1b" : order.status === "Chờ duyệt hủy" ? "#92400e" : "#1D4ED8"
                              }}>
                                {order.status}
                              </span>
                              <ChevronDown size={14} className="transition-transform" style={{ color: "var(--text-placeholder)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-2 items-center text-[12px]" style={{ color: "var(--text-placeholder)" }}>
                              <Calendar size={13} />
                              <span>{new Date(order.date).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                            </div>
                            <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                              {new Intl.NumberFormat("vi-VN").format(order.total)}đ
                            </span>
                          </div>
                        </div>

                        {/* Expanded product detail */}
                        {isExpanded && (
                          <div style={{ borderTop: "1px solid var(--grid-border)", backgroundColor: "#FAFAFA" }}>
                            {products.length > 0 ? (
                              <>
                                {/* Table header */}
                                <div className="grid grid-cols-[1fr_40px_80px_90px] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)", borderBottom: "1px solid var(--grid-border)" }}>
                                  <span>Sản phẩm</span>
                                  <span className="text-center">SL</span>
                                  <span className="text-right">Đơn giá</span>
                                  <span className="text-right">Thành tiền</span>
                                </div>
                                {/* Rows */}
                                {products.map((p, i) => (
                                  <div key={i} className="grid grid-cols-[1fr_40px_80px_90px] gap-2 px-4 py-2.5 items-center" style={{ borderBottom: i < products.length - 1 ? "1px solid var(--grid-border)" : "none" }}>
                                    <div className="min-w-0">
                                      <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-main)" }}>{p.name}</p>
                                      {p.material && <p className="text-[10px] truncate" style={{ color: "var(--text-placeholder)" }}>{p.material}</p>}
                                    </div>
                                    <p className="text-[12px] text-center font-medium" style={{ color: "var(--text-secondary)" }}>{p.qty}</p>
                                    <p className="text-[11px] text-right font-medium" style={{ color: "var(--text-secondary)" }}>{p.price ? fmtCurrency(p.price) : "—"}</p>
                                    <p className="text-[12px] text-right font-bold" style={{ color: "var(--text-main)" }}>{p.price ? fmtCurrency(p.price * p.qty) : "—"}</p>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="px-4 py-4 text-center">
                                <p className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>Chưa có dữ liệu chi tiết sản phẩm</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                       <ShoppingCart size={20} style={{ color: "var(--text-placeholder)" }} />
                   </div>
                   <p className="text-[13px] font-medium" style={{ color: "var(--text-main)" }}>Chưa có đơn hàng nào</p>
                   <p className="text-[12px] mt-1" style={{ color: "var(--text-placeholder)" }}>Khách hàng này chưa thực hiện giao dịch nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
          >
            <div className="p-5 space-y-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                style={{
                  backgroundColor: "#FEE2E2",
                  color: "var(--status-error)",
                }}
              >
                <Trash2 size={22} />
              </div>
              <div className="text-center">
                <h3
                  className="text-[15px] font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  Xác nhận xóa
                </h3>
                <p
                  className="text-[13px] mt-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Bạn có chắc muốn xóa khách hàng{" "}
                  <strong style={{ color: "var(--text-main)" }}>
                    {deleteConfirm.name}
                  </strong>
                  ?
                </p>
                <p
                  className="text-[11px] mt-1"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg cursor-pointer text-[13px]"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 rounded-lg text-[13px] font-bold text-white cursor-pointer"
                  style={{ backgroundColor: "var(--status-error)" }}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
