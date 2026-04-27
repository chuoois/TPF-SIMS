/**
 * Component SalesCustomerManage
 * Quản lý khách hàng — CRUD với static data + Phân trang
 *
 * Created By: DNC
 * Created Date: 24/02/2026
 */

import { useState, useMemo, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  Plus,
  Pencil,
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
  ShoppingCart, 
  Package, 
  ChevronDown,
  Eye,
  Tag
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import { INITIAL_ORDERS, MOCK_ORDERS_DETAILED } from "../orders/mockData";

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
    id: "KH011",
    code: "KH-0011",
    name: "Lê Văn Minh",
    phone: "0909111222",
    email: "minh.le@gmail.com",
    gender: "Nam",
    dob: "1993-07-12",
    address: "15/4 Phan Xích Long, Q.Phú Nhuận, TP.HCM",
    note: "",
    createdAt: "2026-03-05",
  },
  {
    id: "KH012",
    code: "KH-0012",
    name: "Ngô Mỹ Hạnh",
    phone: "0918222333",
    email: "myhanh.ngo@gmail.com",
    gender: "Nữ",
    dob: "1987-11-25",
    address: "77 Cách Mạng Tháng 8, Q.1, TP.HCM",
    note: "Khách quen từ 2024",
    createdAt: "2026-03-06",
  },
  {
    id: "KH013",
    code: "KH-0013",
    name: "Lý Gia Kiệt",
    phone: "0933444555",
    email: "kietly@yahoo.com",
    gender: "Nam",
    dob: "2000-01-01",
    address: "88 Trần Não, TP. Thủ Đức",
    note: "",
    createdAt: "2026-03-08",
  },
  {
    id: "KH014",
    code: "KH-0014",
    name: "Trịnh Công Sơn",
    phone: "0988555666",
    email: "son.trinh@gmail.com",
    gender: "Nam",
    dob: "1980-04-30",
    address: "123 Cao Thắng, Q.3, TP.HCM",
    note: "Giao hàng sau giờ hành chính",
    createdAt: "2026-03-10",
  },
  {
    id: "KH015",
    code: "KH-0015",
    name: "Đào Kim Chi",
    phone: "0966777888",
    email: "kimchi.dao@gmail.com",
    gender: "Nữ",
    dob: "1994-10-10",
    address: "55 Nam Kỳ Khởi Nghĩa, Q.1, TP.HCM",
    note: "",
    createdAt: "2026-03-12",
  },
  {
    id: "KH016",
    code: "KH-0016",
    name: "Hồ Bảo Long",
    phone: "0944888999",
    email: "long.ho@outlook.com",
    gender: "Nam",
    dob: "1989-02-14",
    address: "99 Cộng Hòa, Q.Tân Bình, TP.HCM",
    note: "",
    createdAt: "2026-03-15",
  },
  {
    id: "KH017",
    code: "KH-0017",
    name: "Phan Tuyết Nhi",
    phone: "0901999000",
    email: "nhi.phan@gmail.com",
    gender: "Nữ",
    dob: "1997-12-25",
    address: "22 Nguyễn Trãi, Q.5, TP.HCM",
    note: "Cần tư vấn thêm về sofa",
    createdAt: "2026-03-18",
  },
  {
    id: "KH018",
    code: "KH-0018",
    name: "Đỗ Minh Khôi",
    phone: "0911000111",
    email: "",
    gender: "Nam",
    dob: "1991-06-30",
    address: "44 Thảo Điền, TP. Thủ Đức",
    note: "",
    createdAt: "2026-03-20",
  },
  {
    id: "KH019",
    code: "KH-0019",
    name: "Nguyễn Thảo Nguyên",
    phone: "0922111222",
    email: "nguyen.ng@gmail.com",
    gender: "Nữ",
    dob: "1996-03-08",
    address: "66 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    note: "",
    createdAt: "2026-03-22",
  },
  {
    id: "KH020",
    code: "KH-0020",
    name: "Dương Quốc Trung",
    phone: "0933222333",
    email: "trung.duong@gmail.com",
    gender: "Nam",
    dob: "1983-09-02",
    address: "77 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, TP.HCM",
    note: "Khách sỉ nội thất",
    createdAt: "2026-03-25",
  }
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
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [genderFilter, setGenderFilter] = useState("Tất cả");

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
  const [formErrors, setFormErrors] = useState({});


  // Filtered customers
  const filtered = useMemo(() => {
    let result = customers;
    
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.code.toLowerCase().includes(q),
      );
    }

    // Gender Filter
    if (genderFilter !== "Tất cả") {
      result = result.filter(c => c.gender === genderFilter);
    }

    return result;
  }, [searchTerm, customers, genderFilter]);

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
      toast.success("Cập nhật hồ sơ thành công");
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
      toast.success("Tạo hồ sơ khách hàng thành công");
    }
    setIsFormOpen(false);
    setCurrentCustomer(null);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setCustomers((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
    toast.success("Xóa khách hàng thành công");
    setDeleteConfirm(null);
  };

  const updateForm = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: null }));
  };

  // ===================== DATATABLE CONFIG =====================
  const columns = [
    {
      header: "STT",
      headerClassName: "w-[60px]",
      render: (_, idx) => (
        <span className="text-[12px] font-medium text-[var(--text-placeholder)]">
          {(currentPage - 1) * itemsPerPage + idx + 1}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      render: (c) => (
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
            <p className="text-[13px] font-semibold text-[var(--text-main)]">
              {c.name}
            </p>
            <p className="text-[10px] font-mono tracking-wide text-[var(--text-placeholder)]">
              {c.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "SĐT / Email",
      render: (c) => (
        <div>
          <p className="text-[13px] font-medium text-[var(--text-main)]">
            {c.phone}
          </p>
          <p className="text-[11px] text-[var(--text-placeholder)]">
            {c.email || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Địa chỉ",
      render: (c) => (
        <p
          className="text-[12px] max-w-[180px] truncate text-[var(--text-secondary)]"
          title={c.address}
        >
          {c.address || "—"}
        </p>
      ),
    },
    {
      header: "Ghi chú",
      render: (c) => (
        <div className="max-w-[180px]">
          {c.note ? (
            <p
              className="text-[12px] italic line-clamp-2 text-[var(--text-secondary)]"
              title={c.note}
            >
              {c.note}
            </p>
          ) : (
            <span className="text-[12px] text-[var(--text-placeholder)]">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Ngày tạo",
      render: (c) => (
        <span className="text-[12px] text-[var(--text-placeholder)]">
          {formatDate(c.createdAt)}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      icon: Eye,
      label: "Chi tiết & Lịch sử",
      onClick: (c) => handleOpenHistory(c),
    },
    {
      icon: Pencil,
      label: "Sửa thông tin",
      onClick: (c) => handleOpenEdit(c),
    },
    {
      icon: Trash2,
      label: "Xóa",
      onClick: (c) => setDeleteConfirm(c),
      className: "text-red-500 hover:bg-red-50 hover:border-red-200",
    },
  ];

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý khách hàng - TPF-SIMS" />


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

        {/* DataTable Wrapper */}
        <DataTable
          columns={columns}
          data={paginatedCustomers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm tên, SĐT, mã KH..."
          rowActions={rowActions}
          onRowClick={(c) => handleOpenEdit(c)}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          bulkActions={[
            {
              label: "Xóa hàng loạt",
              icon: Trash2,
              onClick: () => {
                setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
                setSelectedIds([]);
                toast.success(`Đã xóa ${selectedIds.length} khách hàng thành công`);
              },
              requireConfirm: true,
              confirmTitle: "Xác nhận xóa hàng loạt?",
              confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`,
            }
          ]}
          extraFilters={
            <div className="relative flex items-center">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="h-10 px-3 pr-9 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                style={{
                  border:
                    genderFilter !== "Tất cả"
                      ? "1px solid var(--brand-primary)"
                      : "1px solid var(--grid-border)",
                  backgroundColor:
                    genderFilter !== "Tất cả"
                      ? "var(--status-focus)"
                      : "#fff",
                  color:
                    genderFilter !== "Tất cả"
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                }}
              >
                <option value="Tất cả">Giới tính: Tất cả</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 pointer-events-none opacity-50"
                style={{
                  color:
                    genderFilter !== "Tất cả"
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                }}
                strokeWidth={2.5}
              />
            </div>
          }
          pagination={{
            total: filtered.length,
            currentPage,
            setCurrentPage,
            itemsPerPage,
            setItemsPerPage,
          }}
        />
      </div>

      {/* ═══ MODAL: CREATE / EDIT ═══ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsFormOpen(false)}
          />
          <div
            className="relative bg-white rounded-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95"
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

      {/* ═══ MODAL: DELETE ═══ */}
      {/* ═══ MODAL: HISTORY ═══ */}
      {isHistoryOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div
            className="relative bg-white rounded-lg w-full max-w-2xl overflow-hidden animate-in zoom-in-95"
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
                    const detail = MOCK_ORDERS_DETAILED[order.id];
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

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Xác nhận xóa khách hàng"
        message={`Bạn có chắc chắn muốn xóa khách hàng "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa khách hàng"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
