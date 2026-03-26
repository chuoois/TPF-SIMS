import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Package,
  User,
  FileText,
  Truck,
  Clock,
  CreditCard,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Hammer,
  Camera,
  Eye,
  UserPlus,
  Info,
  Wallet,
  Image,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

// ===================== MOCK DATA =====================
const MOCK_ORDERS = {
  // ========== NHÓM 1: HÀNG SẴN (6 trạng thái) ==========
  "DH-S01": {
    code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    date: "2026-03-12T08:30:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nhà",
    customer: { name: "Nguyễn Văn Hùng", phone: "0912345678", address: "45 Đường Giải Phóng, Hà Đông, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 18500000, deposit: 2000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách hàng thân thiết, cần bọc lót kỹ phần chân gỗ.",
    products: [{ name: "Bàn ăn gỗ Sồi Nga 6 ghế", image: "https://images.unsplash.com/photo-1577145745727-427773530be9?q=80&w=800", material: "Gỗ sồi tự nhiên", size: "160x80 cm", finish: "Sơn Lau", qty: 1, price: 18500000, note: "Màu tự nhiên" }],
    timeline: [
      { time: "12/03/2026 08:30", label: "Tiếp nhận đơn", desc: "Đơn hàng mới từ Showroom Giải Phóng", active: true },
      { time: "12/03/2026 09:15", label: "Đang kiểm kho", desc: "Kho xác nhận còn hàng sẵn sàng bàn giao", active: false }
    ],
  },
  "DH-S02": {
    code: "DH-SAN-002", type: "Hàng sẵn", status: "Chờ giao hàng",
    date: "2026-03-11T14:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy ngay",
    customer: { name: "Lê Thị Lan", phone: "0345678901", address: "Vinhomes Ocean Park, Gia Lâm, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 5200000, deposit: 5200000, depositMethod: "Tiền mặt", paymentStatus: "full",
    notes: "Khách tự vận chuyển bằng xe cá nhân.",
    products: [{ name: "Kệ giày thông minh 3 tầng", image: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=800", material: "Gỗ MDF lõi xanh", size: "80×110 cm", finish: "Phủ Melamine", qty: 1, price: 5200000, note: "Màu trắng hiện đại" }],
    timeline: [
      { time: "11/03/2026 14:20", label: "Tiếp nhận đơn", desc: "Khách thanh toán 100% tại quầy", active: true },
      { time: "11/03/2026 15:30", label: "Xác nhận kho", desc: "Đã xuất kho chuẩn bị bàn giao", active: true },
      { time: "11/03/2026 16:00", label: "Chờ giao hàng", desc: "Chờ khách mang xe tới nhận", active: true }
    ],
  },
  "DH-S03": {
    code: "DH-SAN-003", type: "Hàng sẵn", status: "Đang giao hàng",
    date: "2026-03-10T09:15:00", deliveryDate: "2026-03-11", fulfillmentType: "Giao hàng",
    customer: { name: "Trần Minh Quang", phone: "0909123456", address: "Chung cư Goldmark City, 136 Hồ Tùng Mậu, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 12800000, deposit: 5000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Giao vào giờ hành chính, gọi trước 30p.",
    products: [{ name: "Kệ Tivi gỗ Xoan Đào", image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800", material: "Gỗ Xoan Đào", size: "220 cm", finish: "Sơn PU bóng", qty: 1, price: 12800000, note: "Hoa văn chạm nhẹ" }],
    timeline: [
      { time: "10/03/2026 10:00", label: "Tiếp nhận đơn", active: true },
      { time: "11/03/2026 08:00", label: "Đang giao hàng", desc: "Tài xế: Nguyễn Văn Nam (0988.xxx.123) đang vận chuyển", active: true }
    ],
  },
  "DH-S04": {
    code: "DH-SAN-004", type: "Hàng sẵn", status: "Hoàn thành",
    date: "2026-03-09T16:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Giao nhà",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=800",
    customer: { name: "Phạm Thành Nam", phone: "0987654321", address: "Biệt thự BT2, Linh Đàm, Hoàng Mai, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 45000000, paymentStatus: "full",
    products: [{ name: "Bộ Sofa da bò Ý cao cấp", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800", material: "Da thật / Khung gỗ sồi", size: "Góc L 3m2", finish: "Da bò Mill", qty: 1, price: 45000000, note: "Màu nâu cafe" }],
    timeline: [
      { time: "09/03/2026 17:00", label: "Tiếp nhận đơn", active: true },
      { time: "10/03/2026 14:00", label: "Hoàn thành", desc: "Khách đã nhận hàng và ký biên bản bàn giao", active: true }
    ],
  },
  "DH-S05": {
    code: "DH-SAN-005", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    date: "2026-03-13T10:00:00", deliveryDate: "2026-03-15",
    cancelReason: "Khách đổi ý muốn chuyển sang mẫu khác lớn hơn",
    customer: { name: "Hoàng Văn Thái", phone: "0912000111", address: "Số 2 Lê Lợi, Hải Phòng" },
    deposit: 1000000, paymentStatus: "partial", depositResolution: "pending",
    products: [{ name: "Tab đầu giường Gỗ Sồi", image: "https://images.unsplash.com/photo-1505693314120-0d4438678010?q=80&w=800", material: "Gỗ Sồi", size: "45x45 cm", finish: "Sơn PU", qty: 2, price: 2100000, note: "Combo 2 cái" }],
    timeline: [
      { time: "13/03/2026 10:00", label: "Tiếp nhận đơn", active: true },
      { time: "13/03/2026 11:00", label: "Yêu cầu hủy đơn", desc: "Sales gửi yêu cầu hủy chờ Owner duyệt", active: true }
    ],
  },
  "DH-S06": {
    code: "DH-SAN-006", type: "Hàng sẵn", status: "Đơn đã hủy",
    date: "2026-03-08T10:00:00", deliveryDate: "2026-03-09",
    customer: { name: "Võ Thị Bảy", phone: "0966778899", address: "Thảo Điền, Quận 2, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 1500000, deposit: 1500000, paymentStatus: "full", depositResolution: "refunded",
    products: [{ name: "Đôn gỗ trang trí", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800", material: "Gỗ Lim", size: "30x30", finish: "PU", qty: 1, price: 1500000, note: "Mẫu trơn" }],
    timeline: [
      { time: "08/03/2026 10:00", label: "Tiếp nhận đơn", active: true },
      { time: "08/03/2026 10:30", label: "Đơn đã hủy", desc: "Khách báo sai địa chỉ. Đã hoàn cọc 100%.", active: true }
    ],
  },
  "DH-S07": {
    code: "DH-SAN-007", type: "Hàng sẵn", status: "Chờ giao hàng",
    date: "2026-03-14T09:00:00", deliveryDate: "2026-03-16", fulfillmentType: "Giao hàng",
    customer: { name: "Trịnh Thăng Bình", phone: "0945123789", address: "Vinhomes Riverside, Long Biên, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15200000, deposit: 5000000, paymentStatus: "partial",
    products: [{ name: "Tủ đầu giường gỗ Gõ Đỏ", image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800", material: "Gỗ Gõ Đỏ", size: "50x45x60 cm", finish: "Sơn bóng cao cấp", qty: 2, price: 7600000, note: "Mẫu cổ điển" }],
    timeline: [
      { time: "14/03/2026 09:00", label: "Tiếp nhận đơn", active: true },
      { time: "14/03/2026 14:00", label: "Chờ giao hàng", desc: "Đã đóng gói, chờ xe tải điều phối", active: true }
    ],
  },
  "DH-S08": {
    code: "DH-SAN-008", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    date: "2026-03-15T08:30:00", deliveryDate: "2026-03-17", cancelReason: "Khách tìm được mẫu khác phù hợp hơn với không gian",
    customer: { name: "Nguyễn Cao Kỳ Duyên", phone: "0933998877", address: "Quận 1, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 6800000, deposit: 2000000, paymentStatus: "partial",
    products: [{ name: "Kệ trang trí khung sắt mạ vàng", image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=800", material: "Sắt mạ / Kính cường lực", size: "120x35x180 cm", finish: "Mạ PVD", qty: 1, price: 6800000, note: "Dáng thanh lịch" }],
    timeline: [
      { time: "15/03/2026 08:30", label: "Tiếp nhận đơn", active: true },
      { time: "15/03/2026 10:00", label: "Yêu cầu hủy đơn", desc: "Yêu cầu từ khách hàng qua điện thoại", active: true }
    ],
  },

  // ========== NHÓM 2: HÀNG MỘC (7 trạng thái) ==========
  "DH-T01": {
    code: "DH-THO-001", type: "Hàng mộc", status: "Chờ xử lý",
    date: "2026-03-12T10:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "Đà Nẵng" },
    products: [{ name: "Sập thờ Tứ Linh", material: "Gỗ mít", size: "197×107×108 (Lỗ Ban)", finish: "Mộc", qty: 1, price: 56000000, note: "Chân 18 phân, Dạ 5 phân,\nĐục Tứ Linh chạm tay kỹ" }],
    sampleImages: ["https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800"],
    timeline: [{ time: "12/03/2026 10:00", label: "Tạo đơn", desc: "Nhận mộc", active: true }],
  },
  "DH-T02": {
    code: "DH-THO-002", type: "Hàng mộc", status: "Đang gia công",
    date: "2026-03-11T15:30:00", deliveryDate: "2026-03-15",
    customer: { name: "Đặng Tuấn Kiệt", phone: "0931234567", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8200000, deposit: 2000000, paymentStatus: "partial",
    products: [{ name: "Trường kỷ gỗ lim", material: "Gỗ lim", size: "200cm", finish: "Mộc", qty: 1, price: 8200000, note: "Chân 14, Gỗ dày 3 phân,\nMẫu trơn đánh lỳ" }],
    sampleImages: ["https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800"],
    timeline: [{ time: "11/03/2026 16:00", label: "Đang gia công", desc: "Đang đóng mộng", active: true }],
  },
  "DH-T03": {
    code: "DH-THO-003", type: "Hàng mộc", status: "Chờ giao hàng",
    date: "2026-03-10T08:00:00", deliveryDate: "2026-03-14",
    customer: { name: "Vũ Hải Đăng", phone: "0922334455", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 12500000, deposit: 5000000, paymentStatus: "partial",
    products: [{ name: "Bàn ghế ăn", material: "Gụ", size: "Chuẩn", finish: "Mộc", qty: 1, price: 12500000, note: "Chân 16, Dạ 4 phân,\nPhôi gỗ dày, đục chạm tay" }],
    sampleImages: ["https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800"],
    timeline: [{ time: "13/03/2026 09:00", label: "Chờ giao hàng", desc: "Xong mộc", active: true }],
  },
  "DH-T04": {
    code: "DH-THO-004", type: "Hàng mộc", status: "Đang giao hàng",
    date: "2026-03-09T11:20:00", deliveryDate: "2026-03-12",
    customer: { name: "Bùi Tiến Dũng", phone: "0911223344", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 28000000, deposit: 10000000, paymentStatus: "partial",
    products: [{ name: "Tủ quần áo", material: "Hương", size: "120", finish: "PU", qty: 1, price: 28000000, note: "Trơn" }],
    sampleImages: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800"],
    timeline: [{ time: "11/03/2026 09:00", label: "Đang giao hàng", active: true }],
  },
  "DH-T05": {
    code: "DH-THO-005", type: "Hàng mộc", status: "Hoàn thành",
    date: "2026-03-08T14:45:00", deliveryDate: "2026-03-10",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b",
    customer: { name: "Đinh Công Thành", phone: "0988776655", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15400000, deposit: 15400000, paymentStatus: "full",
    products: [{ name: "Salon gỗ xà cừ", material: "Gỗ xà cừ đỏ", size: "Chuẩn 6 món", finish: "Sơn PU bóng", qty: 1, price: 15400000, note: "Mẫu trơn" }],
    sampleImages: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800"],
    timeline: [{ time: "10/03/2026 14:00", label: "Hoàn thành", active: true }],
  },
  "DH-T06": {
    code: "DH-THO-006", type: "Hàng mộc", status: "Chờ duyệt hủy",
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-15",
    cancelReason: "Mua nhầm hàng",
    customer: { name: "Lý Quí Chung", phone: "0933445566", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 18000000, deposit: 2000000, paymentStatus: "partial",
    products: [{ name: "Kệ sách gỗ hương", material: "Gỗ hương", size: "200x35", finish: "Để mộc", qty: 1, price: 18000000, note: "Mẫu trơn" }],
    sampleImages: ["https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800"],
    timeline: [{ time: "11/03/2026 10:00", label: "Chờ duyệt hủy", active: true }],
  },
  "DH-T07": {
    code: "DH-THO-007", type: "Hàng mộc", status: "Đơn đã hủy",
    date: "2026-03-05T09:00:00", deliveryDate: "2026-03-08",
    customer: { name: "Nguyễn Kim Ngân", phone: "0977889900", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 9000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Đôn gỗ trang trí", material: "Gỗ gõ đỏ", size: "35x35", finish: "Để mộc", qty: 1, price: 9000000, note: "Chân vuông" }],
    sampleImages: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"],
    timeline: [{ time: "05/03/2026 10:00", label: "Đơn đã hủy", active: true }],
  },

  // ========== NHÓM 3: HÀNG KHÁCH ĐẶT (8 trạng thái) ==========
  "DH-D01": {
    code: "DH-DAT-001", type: "Hàng khách đặt", status: "Chờ sản xuất",
    date: "2026-03-12T11:15:00", deliveryDate: "2026-03-30",
    customer: { name: "Nguyễn Thị Hồng", phone: "0912123123", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 75000000, deposit: 25000000, paymentStatus: "partial",
    products: [{ name: "Tủ thờ Hương Đá", material: "Hương đá", size: "197×107×108 (Lỗ Ban)", finish: "PU", qty: 1, price: 75000000, note: "Chân 18 phân, Dạ 5 phân,\nHoa văn đục ngũ phúc" }],
    sampleImages: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800"],
    timeline: [{ time: "12/03/2026 11:15", label: "Tạo đơn", desc: "Đang lên thiết kế", active: true }],
  },
  "DH-D02": {
    code: "DH-DAT-002", type: "Hàng khách đặt", status: "Đã nhập kho",
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-25",
    customer: { name: "Lê Văn Tám", phone: "0321654987", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 120000000, deposit: 40000000, paymentStatus: "partial",
    products: [{ name: "Bộ Salon Hương", material: "Hương", size: "To", finish: "PU", qty: 1, price: 120000000, note: "Đóng mộng thủ công,\nChân 20, Dạ 6 phân,\nĐục chạm kỹ 2 mặt" }],
    sampleImages: ["https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800"],
    timeline: [{ time: "14/03/2026 09:30", label: "Đã nhập kho", desc: "Mộc đã về kho", active: true }],
  },
  "DH-D03": {
    code: "DH-DAT-003", type: "Hàng khách đặt", status: "Đang gia công",
    date: "2026-03-10T10:15:00", deliveryDate: "2026-03-28",
    customer: { name: "Phan Văn Trị", phone: "0944123123", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 15000000, paymentStatus: "partial",
    products: [{ name: "Tủ rượu gỗ sồi", material: "Sồi Nga", size: "12x200", finish: "Sơn óc chó", qty: 1, price: 45000000, note: "Gỗ sồi Nga dày 2 phân,\nChân 12, Đóng mộng mẹ con,\nSơn màu óc chó đậm" }],
    sampleImages: ["https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1617806118233-ef203e91122b?q=80&w=800"],
    timeline: [{ time: "12/03/2026 14:00", label: "Đang gia công", desc: "Đang sơn hoàn thiện", active: true }],
  },
  "DH-D04": {
    code: "DH-DAT-004", type: "Hàng khách đặt", status: "Chờ giao hàng",
    date: "2026-03-09T14:20:00", deliveryDate: "2026-03-22",
    customer: { name: "Hoàng Thanh Sơn", phone: "0988123123", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 95000000, deposit: 30000000, paymentStatus: "partial",
    products: [{ name: "Kệ TV gỗ sồi", material: "Sồi", size: "240cm", finish: "Tự nhiên", qty: 1, price: 95000000, note: "Mẫu trơn" }],
    sampleImages: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800"],
    timeline: [{ time: "14/03/2026 10:00", label: "Chờ giao hàng", active: true }],
  },
  "DH-D05": {
    code: "DH-DAT-005", type: "Hàng khách đặt", status: "Đang giao hàng",
    date: "2026-03-08T11:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Lưu Bích Thuỷ", phone: "0909123123", address: "Hải Phòng" },
    salesPerson: "Bình Nguyễn", total: 34000000, deposit: 10000000, paymentStatus: "partial",
    products: [{ name: "Bàn phấn tân cổ điển", material: "Gỗ MDF", size: "100x45", finish: "Sơn trắng", qty: 1, price: 34000000, note: "Pha lê" }],
    sampleImages: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"],
    timeline: [{ time: "14/03/2026 11:00", label: "Đang giao hàng", active: true }],
  },
  "DH-D06": {
    code: "DH-DAT-006", type: "Hàng khách đặt", status: "Hoàn thành",
    date: "2026-03-05T08:30:00", deliveryDate: "2026-03-15",
    deliveryImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400",
    customer: { name: "Trương Vô Kỵ", phone: "0977123123", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 210000000, deposit: 210000000, paymentStatus: "full",
    products: [{ name: "Bộ bàn ghế rồng", material: "Hương Lào", size: "Đặc biệt", finish: "PU", qty: 1, price: 210000000, note: "Khảm trai" }],
    sampleImages: ["https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800"],
    timeline: [{ time: "15/03/2026 14:00", label: "Hoàn thành", active: true }],
  },
  "DH-D07": {
    code: "DH-DAT-007", type: "Hàng khách đặt", status: "Chờ duyệt hủy",
    date: "2026-03-11T13:45:00", deliveryDate: "2026-03-26",
    cancelReason: "Khách đổi kích thước nhà",
    customer: { name: "Triệu Mẫn", phone: "0911123123", address: "Hàn Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 20000000, paymentStatus: "partial",
    products: [{ name: "Giường ngủ Indochine", material: "Sồi", size: "180x200", finish: "Đen", qty: 1, price: 85000000, note: "Nệm da" }],
    sampleImages: ["https://images.unsplash.com/photo-1617806118233-ef203e91122b?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800"],
    timeline: [{ time: "14/03/2026 14:00", label: "Chờ duyệt hủy", active: true }],
  },
  "DH-D08": {
    code: "DH-DAT-008", type: "Hàng khách đặt", status: "Đơn đã hủy",
    date: "2026-03-01T10:00:00", deliveryDate: "2026-03-10",
    customer: { name: "Chu Chỉ Nhược", phone: "0933123123", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 42000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Bàn trà đôi", material: "Cẩm lai", size: "70-50", finish: "Mộc", qty: 1, price: 42000000, note: "Tân cổ điển" }],
    sampleImages: ["https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800"],
    designSketches: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"],
    timeline: [{ time: "05/03/2026 10:00", label: "Đơn đã hủy", active: true }],
  },
};

// ===================== HELPERS =====================
const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "—";

const formatNumberInput = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumberInput = (value) => {
  if (!value) return "";
  return value.replace(/\./g, "").replace(/[^\d]/g, "");
};

const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "Chưa xác định");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const statusStyle = (status) => {
  const m = {
    "Chờ xử lý":       { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Blue
    "Đang xử lý":      { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, // Orange
    "Chờ sản xuất":    { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" }, // Amber/Dark
    "Đã nhập kho":     { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }, // Green
    "Đang gia công":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber
    "Chờ giao hàng":   { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }, // Purple
    "Đang giao hàng":  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Deep Blue
    "Hoàn thành":      { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }, // Green
    "Chờ duyệt hủy":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber/Yellow
    "Đơn đã hủy":          { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }, // Red
  };
  return m[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
};

// ===================== SUB-COMPONENTS =====================


const Badge = ({ children, style }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
    style={style}
  >
    {children}
  </span>
);

const CustomerInfoCard = ({ o }) => (
  <div
    className="rounded-2xl overflow-hidden mb-4"
    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    <div
      className="px-5 py-4 flex items-center gap-4"
      style={{ borderBottom: "1px solid var(--grid-border)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
        style={{ backgroundColor: "var(--bg-main)", color: "var(--brand-primary)", border: "1px solid var(--grid-border)" }}
      >
        {o.customer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ color: "var(--text-main)" }}>{o.customer.name}</p>
        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <Phone size={11} style={{ color: "var(--text-placeholder)" }} />
            {o.customer.phone}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <MapPin size={11} style={{ color: "var(--text-placeholder)" }} />
            {o.customer.address}
          </span>
        </div>
      </div>
    </div>

    <div className="px-5 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Mã đơn</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.code}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Loại đơn</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.type}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Nhân viên</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.salesPerson}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày tạo</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDateTime(o.date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày giao</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(o.deliveryDate)}</p>
        </div>
        <div className="md:col-span-1">
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ghi chú</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.notes || "—"}</p>
        </div>
      </div>

    </div>
  </div>
);

const HistoryCard = ({ o }) => (
  <div
    className="rounded-2xl overflow-hidden mt-4"
    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    <div
      className="px-5 py-3 flex items-center gap-2"
      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
    >
      <Clock size={14} style={{ color: "var(--brand-primary)" }} />
      <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Lịch sử giao dịch</span>
    </div>
    <div className="px-5 py-4">
      {o.timeline.map((t, i) => {
        const isLast = i === o.timeline.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: t.active ? "var(--brand-primary)" : "var(--grid-border)" }}
              />
              {!isLast && (
                <div className="w-px flex-1 my-1" style={{ backgroundColor: "var(--grid-border)" }} />
              )}
            </div>
            <div className="pb-3.5 min-w-0">
              <p
                className="text-[12px] font-bold"
                style={{ color: t.active ? "var(--brand-primary)" : "var(--text-main)" }}
              >
                {t.label}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-placeholder)" }}>{t.time}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{t.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const MediaGallery = ({ title, icon: Icon, images, onPreview, colorClass = "emerald" }) => {
  if (!images || images.length === 0) return null;
  
  const colors = {
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50", icon: "text-emerald-600" },
    indigo: { text: "text-indigo-600", bg: "bg-indigo-50", icon: "text-indigo-600" },
  };
  const c = colors[colorClass] || colors.emerald;

  return (
    <div
      className="rounded-2xl overflow-hidden mt-4"
      style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={c.icon} />}
          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
            {title}
          </span>
        </div>
        <span className={`text-[11px] font-bold ${c.text} ${c.bg} px-2.5 py-1 rounded-lg`}>
          {images.length} Ảnh
        </span>
      </div>
      <div className="p-5">
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
               <div 
                 key={idx} 
                 className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-lg transition cursor-pointer"
                 onClick={() => onPreview(img)}
               >
                  <img src={img} alt="Gallery" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="w-8 h-8 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md">
                        <Eye size={16} />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};



// --- KIỂU HIỂN THỊ ĐƠN HÀNG THÔNG THƯỜNG ---
// Chuyên dụng để theo dõi đơn (Đã chốt giá, Đang gia công, Giao hàng...)
const StandardOrderView = ({ o, productTotal, displayTotal, hasPricing, remaining, deliveryImage, onDeliveryImageChange, onPreview }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* ── BANNER ── */}
      {o.status === "Chờ giao hàng" && (
        <div
          className="flex flex-col md:flex-row items-stretch md:items-start gap-4 p-5 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
      <div 
        className="shrink-0 relative group cursor-pointer w-full md:w-40 h-32 md:h-auto object-cover rounded-xl overflow-hidden border-2 border-green-200"
        onClick={() => o.finishedImage && onPreview(o.finishedImage)}
      >
            {o.finishedImage ? (
              <img src={o.finishedImage} alt="Sản phẩm hoàn thiện" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-300">
                <Camera size={24} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Eye size={20} className="text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#166534" }} />
              <div>
                <p className="text-[14px] font-bold" style={{ color: "#14532D" }}>Sản phẩm đã sẵn sàng giao!</p>
                <p className="text-[13px] mt-0.5" style={{ color: "#15803D" }}>
                  Hàng hóa đã được hoàn thiện và đóng gói. Vui lòng sắp xếp lịch trình và phương tiện để giao hàng cho khách.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {o.status === "Đang giao hàng" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
        >
          <Truck size={18} className="shrink-0 mt-0.5" style={{ color: "#1D4ED8" }} />
          <div className="flex-1">
            <p className="text-[13px] font-bold" style={{ color: "#1E40AF" }}>Đơn hàng đang được giao</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#1D4ED8" }}>
              Vui lòng chụp ảnh giao hàng để xác nhận hoàn tất. Bắt buộc có ảnh mới được chuyển trạng thái.
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {!deliveryImage ? (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer transition hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: "#1D4ED8", color: "#fff" }}
                >
                  <Camera size={14} />
                  Tải ảnh giao hàng
                  <input type="file" accept="image/*" className="hidden" onChange={onDeliveryImageChange} />
                </label>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative cursor-pointer" onClick={() => onPreview(deliveryImage)}>
                    <img src={deliveryImage} alt="Ảnh giao hàng" className="w-20 h-20 rounded-xl object-cover border-2 border-blue-300 shadow-sm" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-green-700">Đã tải ảnh lên</p>
                    <label className="text-[11px] text-blue-600 cursor-pointer hover:underline font-semibold">
                      Đổi ảnh khác
                      <input type="file" accept="image/*" className="hidden" onChange={onDeliveryImageChange} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {o.status === "Chờ duyệt hủy" && o.cancelReason && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}
        >
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#D97706" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#92400E" }}>Yêu cầu hủy đơn hàng</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#A16207" }}>Lý do: {o.cancelReason}</p>
          </div>
        </div>
      )}

      {o.status === "Hoàn thành" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#166534" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#14532D" }}>Đơn hàng đã hoàn tất</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#166534" }}>
              Khách hàng đã nhận đủ sản phẩm và thanh toán hoàn tất.
            </p>
          </div>
        </div>
      )}
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COL */}
        <div className="lg:col-span-2 space-y-4">
          <CustomerInfoCard o={o} />

           {/* ── CARD: Sản phẩm chi tiết ── */}
           <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <Package size={14} style={{ color: "var(--brand-primary)" }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                Sản phẩm đặt mua ({o.products.length})
              </span>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
              {o.products.map((p, i) => (
                <div key={i} className="px-5 py-4 flex flex-col md:flex-row items-start gap-4">
                  {/* Tên SP + Chi tiết Kỹ thuật */}
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 overflow-hidden cursor-pointer hover:ring-2 ring-indigo-400 transition"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                        onClick={() => p.image && onPreview(p.image)}
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} style={{ color: "var(--text-secondary)" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{p.name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 bg-[#F9F9F9] p-3 rounded-xl border border-dashed border-gray-200">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Loại gỗ</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.material}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Kích thước</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.size}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Màu sắc</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.finish}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Bảo hành</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.warranty || "12 tháng"}</p>
                      </div>
                    </div>

                    {/* ── GHI CHÚ KỸ THUẬT ── */}
                    {p.note && o.type !== "Hàng sẵn" && (
                      <div className="mt-2 p-3 rounded-xl border-2 border-amber-300 bg-amber-50/60">
                        <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider flex items-center gap-1.5 mb-1.5">
                          <FileText size={12} /> Ghi chú kỹ thuật (Sales)
                        </p>
                        <ul className="space-y-1">
                          {p.note.split(/[,;\n]/).map((item, idx) => item.trim() && (
                            <li key={idx} className="text-[13px] font-bold text-amber-900 flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">•</span> {item.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {p.note && o.type === "Hàng sẵn" && (
                      <div className="mt-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Ghi chú</p>
                        <p className="text-[12px] font-medium text-gray-700">{p.note}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Số lượng & Giá */}
                  <div className="text-right shrink-0 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                    <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">SL:</span>{" "}
                      <span className="text-[14px] font-bold text-gray-800">{p.qty}</span>
                    </div>
                    <div className="mt-2 text-right">
                       <p className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>
                         {p.price ? fmtCurrency(p.price * p.qty) : "—"}
                       </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasPricing && (
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
              >
                <span className="text-[12px] font-bold uppercase" style={{ color: "var(--text-placeholder)" }}>Tổng đơn hàng</span>
                <div className="text-right">
                  <span className="text-[16px] font-bold" style={{ color: "var(--brand-primary)" }}>{fmtCurrency(displayTotal)}</span>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="text-[11px] text-gray-400">Đã cọc ({o.depositMethod || "Tiền mặt"}):</span>
                    <span className="text-[11px] font-bold text-gray-700">{fmtCurrency(o.deposit)}</span>
                  </div>
                  {displayTotal - o.deposit > 0 && (
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      <span className="text-[11px] text-red-400 font-bold uppercase">Còn lại:</span>
                      <span className="text-[13px] font-bold text-red-600">{fmtCurrency(displayTotal - o.deposit)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── CARD: Danh sách Lệnh Sản Xuất Liên Kết ── */}
          {o.type === "Đặt theo mẫu" && (o.status === "Đang gia công" || o.status === "Đang gia công") && (
            <div
              className="rounded-2xl overflow-hidden mt-4"
              style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
              >
                <div className="flex items-center gap-2">
                  <Hammer size={14} style={{ color: "var(--brand-primary)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                    Lệnh sản xuất liên kết
                  </span>
                </div>
              </div>
              
              <div className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                {/* Giả lập Lệnh Sản Xuất linked với DH008 */}
                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <span className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_0_4px_#F5F3FF]" />
                     <div>
                       <p className="text-[13px] font-bold text-gray-800">LSX-2603-0003</p>
                       <p className="text-[12px] text-gray-500 mt-0.5">Bộ bàn ghế phòng khách (x1) • Thợ: Nguyễn Văn Đức</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700">
                      Đang gia công (Đánh ráp)
                    </span>
                    <Link to="/owner/production/LSX003" className="text-[12px] font-bold text-blue-600 hover:underline">Xem chi tiết</Link>
                  </div>
                </div>

                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_0_4px_#F0FDF4]" />
                     <div>
                       <p className="text-[13px] font-bold text-gray-800">LSX-2603-0004</p>
                       <p className="text-[12px] text-gray-500 mt-0.5">Kệ tivi nguyên khối (x1) • Thợ: Trần Minh Tâm</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-100 text-green-700">
                      Hoàn thành
                    </span>
                    <Link to="/owner/production/LSX004" className="text-[12px] font-bold text-blue-600 hover:underline">Xem chi tiết</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CARD: Ảnh mẫu / Ảnh sản phẩm ── */}
          {o.type === "Hàng sẵn" ? (
            <MediaGallery 
              title="Ảnh sản phẩm" 
              icon={Image} 
              images={o.products.map(p => p.image).filter(Boolean)} 
              onPreview={onPreview} 
              colorClass="emerald"
            />
          ) : (
            <MediaGallery 
              title="Ảnh mẫu / Yêu cầu từ khách" 
              icon={Camera} 
              images={o.sampleImages} 
              onPreview={onPreview} 
              colorClass="emerald"
            />
          )}

          {/* ── CARD: Bản thiết kế từ Chủ cửa hàng (Chỉ Hàng khách đặt) ── */}
          {o.type === "Hàng khách đặt" && (
            <MediaGallery 
              title="Bản thiết kế từ Chủ" 
              icon={FileText} 
              images={o.designSketches} 
              onPreview={onPreview} 
              colorClass="indigo"
            />
          )}
        </div>

        {/* RIGHT COL */}
        <div className="space-y-4">
          {hasPricing && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
              >
                <CreditCard size={14} style={{ color: "var(--brand-primary)" }} />
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Thanh toán</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Tiền hàng</span>
                  <span className="font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(productTotal)}</span>
                </div>
                
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Phí gia công</span>
                  <span className="font-bold text-amber-600">
                    {o.processingFee > 0 ? `+${fmtCurrency(o.processingFee)}` : "0 ₫"}
                  </span>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Giảm giá</span>
                  <span className="font-bold text-emerald-600">
                    {o.discount > 0 ? `-${fmtCurrency(o.discount)}` : "0 ₫"}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed" style={{ borderColor: "var(--grid-border)" }}>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-bold" style={{ color: "var(--text-main)" }}>
                      {o.status === "Đơn đã hủy" ? "Tổng tiền gốc" : "Tổng thanh toán"}
                    </span>
                    <span className={`font-bold text-[15px] ${o.status === "Đơn đã hủy" ? 'text-slate-400 line-through' : 'text-[var(--brand-primary)]'}`}>
                      {fmtCurrency(displayTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Đặt cọc</span>
                  <div className="text-right">
                    <span className="font-bold" style={{ color: "#15803D" }}>{fmtCurrency(o.deposit || 0)}</span>
                    {o.status === "Đơn đã hủy" && o.depositResolution && (
                      <p className={`text-[10px] font-bold mt-0.5 ${o.depositResolution === 'refunded' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {o.depositResolution === 'refunded' ? "(Đã hoàn cọc)" : "(Khách mất cọc)"}
                      </p>
                    )}
                  </div>
                </div>

                {o.status === "Đơn đã hủy" && o.depositResolution === 'forfeited' && (
                  <div className="flex justify-between items-center py-2 mt-2 border-t border-dashed border-amber-200 bg-amber-50/20 px-2 rounded-lg">
                    <span className="text-amber-800 font-bold text-[12px]">Doanh thu bồi thường</span>
                    <span className="text-amber-800 font-black text-[14px]">{fmtCurrency(o.deposit)}</span>
                  </div>
                )}

                <div className="pt-2 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                      {o.status === "Đơn đã hủy" ? "Phải thu còn lại" : "Còn lại"}
                    </span>
                    <div className="text-right">
                      <p className={`text-[16px] font-black ${o.status === "Đơn đã hủy" ? 'text-slate-400' : (remaining > 0 ? "#DC2626" : "#15803D")}`}>
                        {fmtCurrency(o.status === "Đơn đã hủy" ? 0 : remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {o.paymentStatus === "full" && (
                    <Badge style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                      <CreditCard size={11} /> Đã thanh toán đủ
                    </Badge>
                  )}
                  {o.paymentStatus === "pending" && (
                    <Badge style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      <CreditCard size={11} /> Chưa thanh toán
                    </Badge>
                  )}
                  {o.status === "Chờ xác nhận" && (
                    <Badge style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                      <Clock size={11} /> Đang đợi vào tiền cọc
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <Truck size={14} style={{ color: "var(--brand-primary)" }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Giao hàng</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Địa chỉ giao</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.customer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày giao dự kiến</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(o.deliveryDate)}</p>
                </div>
              </div>
              {o.deliveryImage && (
                <div className="flex items-start gap-2.5 pt-2" style={{ borderTop: "1px solid var(--grid-border)" }}>
                  <Camera size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ảnh giao hàng</p>
                    <img src={o.deliveryImage} alt="Ảnh giao hàng" className="w-28 h-28 rounded-xl object-cover mt-1 border border-gray-200 shadow-sm" />
                  </div>
                </div>
              )}
              {deliveryImage && !o.deliveryImage && (
                <div className="flex items-start gap-2.5 pt-2" style={{ borderTop: "1px solid var(--grid-border)" }}>
                  <Camera size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ảnh giao hàng (đã tải lên)</p>
                    <img src={deliveryImage} alt="Ảnh giao hàng" className="w-28 h-28 rounded-xl object-cover mt-1 border-2 border-green-300 shadow-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <HistoryCard o={o} />
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN EXPORT =====================
export default function OwnerOrderDetail() {
  const { id } = useParams();

  // Fake data fallback logic based on ID
  const idFallbackMap = {
     // Hàng sẵn
     "DH011": "DH-S01", "DH999": "DH-S01", "DH016": "DH-S03", "DH005": "DH-S05", "DH025": "DH-S06",
     
     // Hàng mộc
     "DH002": "DH-T02", "DH017": "DH-T01", "DH019": "DH-T02", "DH022": "DH-T03", "DH023": "DH-T04", "DH026": "DH-T05", "DH029": "DH-T06", "DH031": "DH-T07", "DH032": "DH-T08",
     
     // Hàng đặt
     "DH001": "DH-D01", "DH015": "DH-D02", "DH008": "DH-D03", "DH012": "DH-D03", "DH013": "DH-D04", "DH036": "DH-D05", "DH033": "DH-D06", "DH006": "DH-D07", "DH021": "DH-D08", "DH018": "DH-D06"
  };
  
  // Catch all existing missing to DH-D01
  const fallbackRef = idFallbackMap[id] || "DH-D01"; 

  const o = MOCK_ORDERS[id] || { 
    ...MOCK_ORDERS[fallbackRef], 
    code: `DH-2603-${id?.replace(/\D/g, '') || "9999"}`,
  };

  const ss = statusStyle(o.status);
  const [deliveryImage, setDeliveryImage] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finalPayment, setFinalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản");
  const [previewImage, setPreviewImage] = useState(null);

  // ── Handover Checklist Modal ──
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverType, setHandoverType] = useState(null); // "moc" | "dat"
  const [handoverChecks, setHandoverChecks] = useState({ dimension: false, material: false, techNotes: false });
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverDeadline, setHandoverDeadline] = useState("");

  // ── Painter Cost ──
  const [painterCost, setPainterCost] = useState(0);

  // Effect to sync state when modal opens
  useEffect(() => {
    if (showCompleteModal) {
      const calculatedTotal = o.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
      const displayTotal = o.total != null ? o.total : calculatedTotal;
      const rem = displayTotal - (o.deposit || 0);
      setFinalPayment(rem > 0 ? rem : 0);
    }
  }, [showCompleteModal, o.total, o.deposit, o.products]);

  // Khởi tạo Deadline mặc định khi mở Modal Bàn giao
  useEffect(() => {
    if (showHandoverModal && o.deliveryDate) {
      const delivery = new Date(o.deliveryDate);
      // Giảm 2 ngày so với ngày giao khách
      delivery.setDate(delivery.getDate() - 2);
      const isoDate = delivery.toISOString().split('T')[0];
      setHandoverDeadline(isoDate);
      setHandoverNotes(""); // Reset ghi chú khi mở mới
    }
  }, [showHandoverModal, o.deliveryDate]);

  const handleFinishOrder = () => {
    if (!deliveryImage) {
      toast.error("Vui lòng tải ảnh giao hàng trước!");
      setShowCompleteModal(false);
      return;
    }

    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    let needsAdd = true;
    const updated = saved.map(order => {
      if (order.code === o.code || order.id === id) {
        needsAdd = false;
        return { 
          ...order, 
          status: "Hoàn thành", 
          deliveryImage,
          finalPayment,
          paymentMethod,
          painter_cost: painterCost
        };
      }
      return order;
    });
    
    if (needsAdd) {
       updated.push({ 
         ...o, 
         status: "Hoàn thành", 
         deliveryImage,
         finalPayment,
         paymentMethod,
         id 
       });
    }

    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
    toast.success("Cập nhật đơn hàng: Hoàn thành!");
    setShowCompleteModal(false);
    navigate("/owner/orders");
  };

  const handleDeliveryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDeliveryImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const productTotal = o.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
  const displayTotal = productTotal + (o.processingFee || 0) - (o.discount || 0);
  const hasPricing = displayTotal > 0 || o.total != null;
  const remaining = hasPricing ? displayTotal - (o.deposit || 0) : null;

  const navigate = useNavigate();
  const savedOrders = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");

  return (
    <>
      <PageHelmet title={`${o.code} | Chi tiết đơn hàng`} />

      <div className="flex flex-col h-full -m-6" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* ╔══════════ STICKY HEADER ══════════╗ */}
        <div
          className="shrink-0 px-6 py-4"
          style={{
            backgroundColor: "var(--background)",
            borderBottom: "1px solid var(--grid-border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Left: Back + Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:opacity-70 cursor-pointer"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}
              >
                <ArrowLeft size={15} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>{o.code}</h1>
                  <Badge style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.text }} />
                    {o.status === "Đã nhập kho" && o.type === "Hàng khách đặt" ? "Đã duyệt mộc" : o.status}
                  </Badge>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: "var(--bg-main)", color: "var(--text-placeholder)", border: "1px solid var(--grid-border)" }}
                  >
                    {o.type}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                  Tạo bởi {o.salesPerson} • {fmtDateTime(o.date)}
                </p>
              </div>
            </div>

            {/* Right: Action buttons (Top level actions) */}
            <div className="flex items-center gap-2">


              {/* Nút Bàn giao Xưởng (Hàng mộc) → Mở Modal Đối soát */}
              {o.status === "Chờ xử lý" && o.type === "Hàng mộc" && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#4F46E5", color: "#fff" }}
                   onClick={() => {
                     setHandoverType("moc");
                     setHandoverChecks({ dimension: false, material: false, techNotes: false });
                     setShowHandoverModal(true);
                   }}
                 >
                   <Hammer size={14} />
                   Bàn giao gia công
                 </button>
              )}

              {/* Hàng đặt workflow - Tới bước Đã nhập kho thì Owner mới bắt đầu thao tác */}
              
              {o.status === "Đã nhập kho" && o.type === "Hàng khách đặt" && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#4F46E5", color: "#fff" }}
                   onClick={() => {
                     setHandoverType("dat");
                     setHandoverChecks({ dimension: false, material: false, techNotes: false });
                     setShowHandoverModal(true);
                   }}
                 >
                   <Hammer size={14} />
                   Bàn giao gia công
                 </button>
              )}
              
              {/* Nút Chuyển từ Chờ xử lý -> Chuẩn bị giao hàng (Dành cho Hàng Sẵn - Nhảy cóc) - ĐÃ GỠ THEO YÊU CẦU: Sales tự xử lý */}




              {/* Chủ duyệt hủy đơn mà Sales yêu cầu */}
              {o.status === "Chờ duyệt hủy" && (
                <div className="flex items-center gap-2">
                  {/* Option Hoàn cọc chỉ dành cho Hàng sẵn */}
                  {o.type === "Hàng sẵn" && (
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: "#DC2626", color: "#fff" }}
                      onClick={() => {
                        if(window.confirm("Duyệt hủy đơn và HOÀN TRẢ TIỀN CỌC cho khách hàng?")) {
                          const updated = savedOrders.map(order => 
                            (order.code === o.code || order.id === id) ? { 
                              ...order, 
                              status: "Đơn đã hủy", 
                              depositResolution: "refunded",
                              timeline: [
                                ...(order.timeline || []),
                                { 
                                  time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).replace(',', ' —'), 
                                  label: "Duyệt hủy đơn", 
                                  desc: "Chủ cửa hàng đã duyệt. Đã hoàn trả tiền cọc.",
                                  active: true 
                                }
                              ]
                            } : order
                          );
                          localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                          toast.success("Đã duyệt hủy và đánh dấu Hoàn cọc!");
                          navigate("/owner/orders");
                        }
                      }}
                    >
                      <XCircle size={14} />
                      Duyệt hủy & Hoàn cọc
                    </button>
                  )}

                  {/* Option Thu cọc dành cho tất cả nhưng là duy nhất cho Hàng mộc/đặt */}
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "#92400E", color: "#fff" }}
                    onClick={() => {
                      const msg = o.type === "Hàng sẵn" 
                        ? "Duyệt hủy đơn và THU HỒI TIỀN CỌC (Bồi thường)?" 
                        : "Xác nhận hủy đơn: Khách MẤT CỌC do xưởng đã triển khai sản xuất?";
                      if(window.confirm(msg)) {
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { 
                            ...order, 
                            status: "Đơn đã hủy", 
                            depositResolution: "forfeited",
                            timeline: [
                              ...(order.timeline || []),
                              { 
                                time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).replace(',', ' —'), 
                                label: "Duyệt hủy đơn", 
                                desc: "Chủ cửa hàng đã duyệt. Thu hồi tiền cọc bồi thường.",
                                active: true 
                              }
                            ]
                          } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        toast.success("Đã duyệt hủy và đánh dấu Thu cọc!");
                        navigate("/owner/orders");
                      }
                    }}
                  >
                    <Ban size={14} />
                    {o.type === "Hàng sẵn" ? "Duyệt hủy & Thu cọc" : "Duyệt hủy (Thu cọc bồi thường)"}
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-70 cursor-pointer border border-slate-200 bg-white text-slate-600"
                    onClick={() => {
                      if(window.confirm("Từ chối yêu cầu hủy và khôi phục trạng thái đơn hàng?")) {
                        const restoreStatus = o.type === "Hàng khách đặt" ? "Đang gia công" : (o.type === "Hàng mộc" ? "Đang sản xuất" : "Chuẩn bị giao hàng");
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { 
                            ...order, 
                            status: restoreStatus,
                            timeline: [
                              ...(order.timeline || []),
                              { 
                                time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).replace(',', ' —'), 
                                label: "Từ chối hủy đơn", 
                                desc: `Chủ cửa hàng từ chối yêu cầu hủy. Khôi phục trạng thái: ${restoreStatus}`,
                                active: true 
                              }
                            ]
                          } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        toast.success(`Đã từ chối yêu cầu hủy. Đơn hàng quay lại trạng thái: ${restoreStatus}`);
                        navigate(0);
                      }
                    }}
                  >
                    Từ chối
                  </button>
                </div>
              )}

              {/* Chỉ cho phép Hủy trực tiếp ở trạng thái đầu */}
              {(o.status === "Chờ xử lý" || o.status === "Chờ sản xuất") && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#DC2626", color: "#fff" }}
                  onClick={() => {
                    if(window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
                      const updated = savedOrders.map(order => 
                        (order.code === o.code || order.id === id) ? { ...order, status: "Đơn đã hủy" } : order
                      );
                      localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                      toast.success("Đơn đã hủy đơn hàng!");
                      navigate("/owner/orders");
                    }
                  }}
                >
                  <XCircle size={14} />
                  Hủy đơn hàng
                </button>
              )}

              {o.status === "Chờ giao hàng" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                  style={{ backgroundColor: "#7C3AED", color: "#fff" }}
                  onClick={() => {
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { ...order, status: "Đang giao hàng" } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        toast.success("Đã cập nhật trạng thái: Đang giao hàng");
                        navigate(0);
                  }}
                >
                  <Truck size={14} />
                  Bắt đầu xếp xe giao hàng
                </button>
              )}

              {o.status === "Đang giao hàng" && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                  style={{ backgroundColor: "#15803D", color: "#fff" }}
                >
                  <CheckCircle size={14} />
                  Xác nhận hoàn thành
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ╔══════════ SCROLLABLE CONTENT ══════════╗ */}
        <StandardOrderView
          o={o}
          productTotal={productTotal}
          displayTotal={displayTotal}
          hasPricing={hasPricing}
          remaining={remaining}
          deliveryImage={deliveryImage}
          onDeliveryImageChange={handleDeliveryImageChange}
          onPreview={setPreviewImage}
        />
      </div>

      {/* MODAL HOÀN TẤT ĐƠN & THANH TOÁN */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={24} /> HOÀN TẤT ĐƠN HÀNG
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Info */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-500 font-medium">Tiền hàng</span>
                    <span className="font-bold text-slate-800">{fmtCurrency(productTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-500 font-medium">Phí gia công</span>
                    <span className="font-bold text-amber-600">
                      {o.processingFee > 0 ? `+${fmtCurrency(o.processingFee)}` : "0 ₫"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-500 font-medium">Giảm giá</span>
                    <span className="font-bold text-emerald-600">
                      {o.discount > 0 ? `-${fmtCurrency(o.discount)}` : "0 ₫"}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                    <span className="text-[14px] font-black text-slate-900 uppercase">Tổng thanh toán</span>
                    <span className="text-[18px] font-black text-indigo-600">{fmtCurrency(displayTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Đã đặt cọc</p>
                    <p className="text-lg font-black text-emerald-700">{fmtCurrency(o.deposit || 0)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">Số tiền còn lại</p>
                    <p className="text-lg font-black text-red-700">{fmtCurrency(displayTotal - (o.deposit || 0))}</p>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">🎨 Tiền công thợ sơn (tính vào giá vốn)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formatNumberInput(painterCost)}
                      onChange={(e) => {
                        const val = parseNumberInput(e.target.value);
                        setPainterCost(val === "" ? 0 : Number(val));
                      }}
                      className="w-full h-12 pl-10 pr-4 rounded-2xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 shadow-sm"
                      placeholder="0"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 font-bold">₫</div>
                  </div>
                  <p className="text-[11px] text-amber-600 mt-1 ml-1 italic">Số tiền này sẽ được cộng vào COGS của đơn hàng trên báo cáo lợi nhuận.</p>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">Số tiền thực tế thu tại chỗ</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formatNumberInput(finalPayment)}
                      onChange={(e) => {
                        const val = parseNumberInput(e.target.value);
                        setFinalPayment(val === "" ? 0 : Number(val));
                      }}
                      className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 shadow-sm"
                      placeholder="0"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</div>
                  </div>
                </div>

                <div>
                   <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">Hình thức thanh toán cuối</label>
                   <div className="grid grid-cols-2 gap-3">
                      {["Chuyển khoản", "Tiền mặt"].map(m => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`h-12 rounded-2xl border font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                            paymentMethod === m ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {m === "Chuyển khoản" ? <CreditCard size={16} /> : <Wallet size={16} />}
                          {m}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">Ảnh giao hàng (Thực tế tại nhà khách)</label>
                   <div className="relative group">
                     <label className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                        deliveryImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                     }`}>
                        {deliveryImage ? (
                          <div className="flex items-center gap-4 px-4">
                            <img src={deliveryImage} className="w-20 h-20 rounded-xl object-cover border border-emerald-200 shadow-md" alt="Delivery" />
                            <div className="flex flex-col">
                              <span className="text-emerald-700 font-bold text-[13px]">Ảnh đã tải lên</span>
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeliveryImage(null); }} 
                                className="text-[11px] text-slate-400 font-bold hover:text-red-500 transition-colors uppercase tracking-wider text-left mt-1"
                              >
                                Thay đổi ảnh
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                              <Camera size={20} className="text-slate-400" />
                            </div>
                            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Nhấp để chụp hoặc tải ảnh</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleDeliveryImageChange}
                        />
                     </label>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={handleFinishOrder}
                className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-black text-[14px] hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                XÁC NHẬN HOÀN TẤT & LƯU LẠI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AssignWorkerModal đã được gỡ bỏ khỏi đây để tránh chồng chéo logic với Quản lý Sản xuất */}

      {/* ======================== MODAL ĐỐI SOÁT BÀN GIAO ======================== */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Hammer className="text-indigo-600" size={24} /> ĐỐI SOÁT TRƯỚC KHI BÀN GIAO
              </h3>
              <button onClick={() => setShowHandoverModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Thông tin sản phẩm */}
              <div className="space-y-3">
                {o.products.map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <p className="text-[14px] font-bold text-slate-800">{p.name}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Chất liệu</p>
                        <p className="text-[13px] font-semibold text-slate-700">{p.material}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kích thước</p>
                        <p className="text-[13px] font-semibold text-slate-700">{p.size}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hoàn thiện</p>
                        <p className="text-[13px] font-semibold text-slate-700">{p.finish}</p>
                      </div>
                    </div>

                    {/* Ghi chú kỹ thuật nổi bật */}
                    {p.note && (
                      <div className="p-3 rounded-xl border-2 border-amber-300 bg-amber-50">
                        <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider flex items-center gap-1.5 mb-1">
                          <FileText size={12} /> GHI CHÚ KỸ THUẬT TỪ SALES
                        </p>
                        <ul className="space-y-1">
                          {p.note.split(/[,;\n]/).map((item, idx) => item.trim() && (
                            <li key={idx} className="text-[13px] font-bold text-amber-900 flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">•</span> {item.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hạn hoàn thành & Ghi chú cho thợ (NEW) */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-500" /> Hạn hoàn thành xong
                    </label>
                    <input
                      type="date"
                      value={handoverDeadline}
                      onChange={(e) => setHandoverDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-[14px] font-bold text-slate-700 bg-white"
                    />
                    <p className="text-[10px] text-indigo-500 font-medium italic">
                      Gợi ý: Trước ngày giao khách {o.deliveryDate ? "2 ngày" : "... "} 
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1.5">
                        <Truck size={14} /> Ngày giao khách
                      </p>
                      <p className="text-[14px] font-black text-amber-800 mt-0.5">{fmtDate(o.deliveryDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-500" /> Ghi chú dặn thợ
                  </label>
                  <textarea
                    placeholder="Nhập các yêu cầu cụ thể cho đội thợ gia công..."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-[13px] font-medium text-slate-700 min-h-[100px] bg-white"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => {
                  const newStatus = handoverType === "moc" ? "Đang sản xuất" : "Đang gia công";
                  const desc = handoverType === "moc" 
                    ? `Owner bàn giao xưởng. Deadline: ${new Date(handoverDeadline).toLocaleDateString('vi-VN')}. Ghi chú: ${handoverNotes || "Không"}`
                    : `Đã duyệt mộc & chuyển gia công. Deadline: ${new Date(handoverDeadline).toLocaleDateString('vi-VN')}`;
                  
                  const updated = savedOrders.map(order => 
                    (order.code === o.code || order.id === id) ? { 
                      ...order, 
                      status: newStatus,
                      worker_deadline: handoverDeadline,
                      handover_notes: handoverNotes,
                      handover_checklist: { 
                        approved_at: new Date().toISOString(),
                        notes: handoverNotes,
                        deadline: handoverDeadline
                      },
                      timeline: [
                        ...(order.timeline || []),
                        { 
                          time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).replace(',', ' —'), 
                          label: "Bàn giao gia công", 
                          desc,
                          active: true 
                        }
                      ]
                    } : order
                  );
                  localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                  toast.success("Đã bàn giao xưởng thành công!");
                  setShowHandoverModal(false);
                  if (handoverType === "moc") navigate("/owner/production/LSX001");
                  else navigate(0);
                }}
                className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-black text-[14px] transition-all shadow-lg shadow-indigo-200 active:scale-95 hover:bg-indigo-700"
              >
                ✅ XÁC NHẬN BÀN GIAO XƯỞNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM ẢNH PHÓNG TO */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[210]"
            >
              <XCircle size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
