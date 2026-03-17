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
  DollarSign,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

// ===================== MOCK DATA =====================
const MOCK_ORDERS = {
  // ========== NHÓM 1: HÀNG SẴN (6 trạng thái) ==========
  "DH-S01": {
    code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    date: "2026-03-12T08:30:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nhà",
    customer: { name: "Nguyễn Văn Hùng", phone: "0912345678", address: "45 Đường Giải Phóng, Hà Đông, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: null, deposit: 12500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    processingFee: 200000, discount: 100000,
    shippingNotes: "Giao trong giờ hành chính. Nhà có thang máy, báo trước 30p.",
    products: [{ 
      name: "Ghế sofa đơn nỉ", 
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=300",
      material: "Gỗ sồi", size: "80×85 cm", finish: "Chân gỗ tự nhiên", qty: 2, price: 6250000, warranty: "12 tháng", note: "Mẫu trơn hiện đại" 
    }],
    timeline: [
      { time: "12/03/2026 08:30", label: "Tiếp nhận đơn", desc: "Đơn hàng mới từ Showroom", active: true }
    ],
  },
  "DH-S02": {
    code: "DH-SAN-002", type: "Hàng sẵn", status: "Chuẩn bị giao hàng",
    date: "2026-03-11T14:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy ngay",
    customer: { name: "Lê Thị Lan", phone: "0345678901", address: "Vinhomes Ocean Park, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 3500000, deposit: 3500000, depositMethod: "Tiền mặt", paymentStatus: "full",
    shippingNotes: "Khách lấy ngay tại cửa hàng.",
    products: [{ 
      name: "Bàn trà kim loại", 
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=300",
      material: "Sắt nghệ thuật", size: "70×70 cm", finish: "Sơn tĩnh điện", qty: 1, price: 3500000, note: "Chân X" 
    }],
    timeline: [
      { time: "11/03/2026 14:20", label: "Tạo đơn", desc: "Thanh toán đủ", active: false },
      { time: "11/03/2026 15:00", label: "Chuẩn bị giao hàng", desc: "Đã sẵn sàng", active: true }
    ],
  },
  "DH-S03": {
    code: "DH-SAN-003", type: "Hàng sẵn", status: "Đang giao hàng",
    date: "2026-03-10T09:15:00", deliveryDate: "2026-03-11", fulfillmentType: "Lấy luôn",
    customer: { name: "Trần Minh Quang", phone: "0909123456", address: "12 Lý Thường Kiệt, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 45000000, depositMethod: "Chuyển khoản", paymentStatus: "full",
    shippingNotes: "Sập nặng, cần ít nhất 4 người khiêng. Tầng 1.",
    products: [{ 
      name: "Sập thờ gỗ", 
      image: "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=300",
      material: "Gỗ gụ mật", size: "197×107 cm", finish: "Vecni", qty: 1, price: 45000000, note: "Mai điểu" 
    }],
    timeline: [{ time: "11/03/2026 08:00", label: "Đang giao hàng", desc: "Shipper đi giao", active: true }],
  },
  "DH-S04": {
    code: "DH-SAN-004", type: "Hàng sẵn", status: "Hoàn thành",
    date: "2026-03-09T16:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Giao nhà",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400",
    customer: { name: "Phạm Thành Nam", phone: "0987654321", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8900000, deposit: 8900000, paymentStatus: "full",
    products: [{ name: "Kệ tivi", material: "Gỗ MDF", size: "180x40", finish: "Melamine", qty: 1, price: 8900000, note: "Trơn" }],
    timeline: [{ time: "10/03/2026 14:00", label: "Hoàn thành", desc: "Giao xong", active: true }],
  },
  "DH-S05": {
    code: "DH-SAN-005", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    cancelReason: "Khách đổi ý",
    date: "2026-03-11T10:00:00", deliveryDate: "2026-03-13",
    customer: { name: "Đinh Công Vinh", phone: "0944556677", address: "Khu đô thị Celadon, Tân Phú, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 2100000, deposit: 0, depositMethod: "Tiền mặt", paymentStatus: "none",
    shippingNotes: "Khách hủy hàng thô chưa sản xuất.",
    products: [{ name: "Ghế", material: "Gỗ tần bì", size: "45x50", finish: "Sơn", qty: 2, price: 1050000, note: "Trơn" }],
    timeline: [{ time: "11/03/2026 11:00", label: "Chờ duyệt hủy", desc: "Sale gửi yc hủy", active: true }],
  },
  "DH-S06": {
    code: "DH-SAN-006", type: "Hàng sẵn", status: "Đơn đã hủy",
    date: "2026-03-08T10:00:00", deliveryDate: "2026-03-09",
    customer: { name: "Võ Thị Bảy", phone: "0966778899", address: "123 Cách Mạng Tháng 8, Quận 3, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 1500000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "none",
    shippingNotes: "Hủy do sai thông tin.",
    products: [{ name: "Đôn", material: "Lim", size: "30x30", finish: "PU", qty: 1, price: 1500000, note: "Trơn" }],
    timeline: [{ time: "08/03/2026 10:30", label: "Đơn đã hủy", desc: "Hủy do khách báo sai đỏ", active: true }],
  },

  // ========== NHÓM 2: HÀNG THÔ (8 trạng thái) ==========
  "DH-T01": {
    code: "DH-THO-001", type: "Hàng mộc", status: "Chờ xử lý",
    date: "2026-03-12T10:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 56000000, deposit: 15000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    processingFee: 1500000, discount: 500000,
    shippingNotes: "Giao nhà phố, đường rộng xe tải vào được.",
    products: [
      { 
        name: "Sập thờ", 
        image: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300",
        material: "Gỗ mít", size: "220", finish: "Mộc", qty: 1, price: 56000000, note: "Khách yêu cầu làm mộc kỹ như ảnh mẫu. Hoa văn: Tứ linh" 
      }
    ],
    sampleImages: [
      "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800",
      "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800"
    ],
    timeline: [{ time: "12/03/2026 10:00", label: "Tạo đơn", desc: "Nhận mộc", active: true }],
  },
  "DH-T02": {
    code: "DH-THO-002", type: "Hàng mộc", status: "Đang gia công",
    date: "2026-03-11T15:30:00", deliveryDate: "2026-03-15",
    customer: { name: "Đặng Tuấn Kiệt", phone: "0931234567", address: "Căn hộ Vinhomes Central Park, Bình Thạnh, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8200000, deposit: 2000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    shippingNotes: "Giao sau 17h, liên hệ quản lý tòa nhà để lên thang máy chuyên dụng.",
    products: [{ name: "Trường kỷ", material: "Gỗ lim", size: "2m", finish: "Mộc", qty: 1, price: 8200000, note: "Trơn" }],
    timeline: [{ time: "11/03/2026 16:00", label: "Đang sản xuất", desc: "Chờ chia việc", active: true }],
  },
  "DH-T03": {
    code: "DH-THO-003", type: "Hàng mộc", status: "Đang sản xuất",
    date: "2026-03-10T08:00:00", deliveryDate: "2026-03-14",
    customer: { name: "Vũ Hải Đăng", phone: "0922334455", address: "99 Xuân Thủy, Cầu Giấy, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 12500000, deposit: 4000000, depositMethod: "Tiền mặt", paymentStatus: "partial",
    shippingNotes: "Nhà trong ngõ nhỏ, xe tải không vào được, cần thợ chở xe máy từ đầu ngõ.",
    products: [{ name: "Bàn ghế", material: "Gụ", size: "Chuẩn", finish: "Mộc", qty: 1, price: 12500000, note: "Chạm" }],
    sampleImages: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"],
    timeline: [{ time: "10/03/2026 09:00", label: "Đang sản xuất", desc: "Đang sơn", active: true }],
  },
  "DH-T04": {
    code: "DH-THO-004", type: "Hàng mộc", status: "Chuẩn bị giao hàng",
    date: "2026-03-09T11:20:00", deliveryDate: "2026-03-12",
    customer: { name: "Bùi Tiến Dũng", phone: "0911223344", address: "Khu đô thị Ciputra, Tây Hồ, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 28000000, deposit: 10000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    shippingNotes: "Khi giao nhớ mang theo phiếu bảo hành đóng dấu đỏ.",
    products: [{ name: "Tủ", material: "Hương", size: "120", finish: "PU", qty: 1, price: 28000000, note: "Trơn" }],
    sampleImages: ["https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800"],
    timeline: [{ time: "11/03/2026 09:00", label: "Chuẩn bị giao hàng", desc: "Xong mộc", active: true }],
  },
  "DH-T05": {
    code: "DH-THO-005", type: "Hàng mộc", status: "Đang giao hàng",
    date: "2026-03-08T14:45:00", deliveryDate: "2026-03-10",
    customer: { name: "Đinh Công Thành", phone: "0988776655", address: "Số 88 Duy Tân, Cầu Giấy, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15400000, deposit: 5000000, depositMethod: "Tiền mặt", paymentStatus: "partial",
    shippingNotes: "Giao lắp tầng 3, cầu thang hơi hẹp, cần thợ tay nghề cao để khiêng đồ.",
    products: [{ name: "Salon gỗ xà cừ", material: "Gỗ xà cừ đỏ", size: "Chuẩn 6 món", finish: "Sơn PU bóng", qty: 1, price: 15400000, warranty: "12 tháng", note: "Mẫu trơn hiện đại" }],
    timeline: [
      { time: "08/03/2026 14:45", label: "Tạo đơn", desc: "Hàng mộc nhập từ kho", active: false },
      { time: "09/03/2026 10:00", label: "Đang giao hàng", desc: "Đã bốc xếp lên xe tải số 29C-12345", active: true }
    ],
  },
  "DH-T06": {
    code: "DH-THO-006", type: "Hàng mộc", status: "Hoàn thành",
    date: "2026-03-07T09:00:00", deliveryDate: "2026-03-09",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b",
    customer: { name: "Trần Anh Tú", phone: "0900112233", address: "15 Lê Duẩn, Ba Đình, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 32000000, deposit: 32000000, depositMethod: "Chuyển khoản", paymentStatus: "full",
    shippingNotes: "Giao lắp xong xuôi, khách đã ký biên bản bàn giao.",
    products: [{ name: "Kệ TV", material: "Sồi", size: "Chuẩn", finish: "PU", qty: 1, price: 32000000, note: "Trơn" }],
    sampleImages: [
      "https://images.unsplash.com/photo-1577145745727-42b77daeb623?q=80&w=800"
    ],
    timeline: [{ time: "07/03/2026 09:00", label: "Hoàn thành", desc: "Đã giao", active: true }],
  },
  "DH-T07": {
    code: "DH-THO-007", type: "Hàng mộc", status: "Chờ duyệt hủy",
    cancelReason: "Khách báo mua nhầm loại gỗ, muốn đổi sang gỗ gõ đỏ",
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-15",
    customer: { name: "Lý Quí Chung", phone: "0933445566", address: "Căn hộ Landmark 81, Bình Thạnh, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 18000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Kệ sách gỗ hương", material: "Gỗ hương", size: "200x35x180cm", finish: "Để mộc", qty: 1, price: 18000000, warranty: "12 tháng", note: "Mẫu trơn hiện đại" }],
    timeline: [
      { time: "11/03/2026 09:00", label: "Kiểm tra mộc", active: false },
      { time: "11/03/2026 10:00", label: "Chờ duyệt hủy", desc: "Chủ cửa hàng xem xét yêu cầu hoàn cọc", active: true }
    ],
  },
  "DH-T08": {
    code: "DH-THO-008", type: "Hàng mộc", status: "Đơn đã hủy",
    date: "2026-03-05T09:00:00", deliveryDate: "2026-03-08",
    customer: { name: "Nguyễn Kim Ngân", phone: "0977889900", address: "Chung cư Seasons Avenue, Mỗ Lao, Hà Đông, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 9000000, deposit: 0, depositMethod: "Tiền mặt", paymentStatus: "none",
    shippingNotes: "Khách báo hủy đơn do không tìm được shipper vận chuyển.",
    products: [{ name: "Đôn gỗ trang trí", material: "Gỗ gõ đỏ", size: "35x35x45cm", finish: "Để mộc", qty: 1, price: 9000000, warranty: "12 tháng", note: "Chân vuông" }],
    timeline: [
      { time: "05/03/2026 09:00", label: "Tạo đơn", active: false },
      { time: "05/03/2026 10:00", label: "Đơn đã hủy", desc: "Khách hủy do không tìm được shipper", active: true }
    ],
  },

  // ========== NHÓM 3: HÀNG ĐẶT ==========
  "DH-D01": {
    code: "DH-DAT-001", type: "Hàng đặt", status: "Đang gia công",
    date: "2026-03-12T11:15:00", deliveryDate: "2026-03-30",
    customer: { name: "Nguyễn Thị Hồng", phone: "0912123123", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 75000000, deposit: 25000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    processingFee: 0, discount: 1000000,
    shippingNotes: "Lắp đặt phòng thờ tầng 5, có thang máy nhưng cần bê bộ phận rời.",
    products: [{ 
      name: "Tủ thờ", 
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300",
      material: "Hương đá", size: "160", finish: "PU", qty: 1, price: 75000000, note: "Hoa văn: Chạm" 
    }],
    sampleImages: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"],
    timeline: [
      { time: "12/03/2026 11:15", label: "Tạo đơn", desc: "Cọc 25tr", active: false },
      { time: "12/03/2026 16:30", label: "Đang gia công", desc: "Đã bàn giao gia công", active: true }
    ],
  },
  "DH-D02": {
    code: "DH-DAT-002", type: "Hàng đặt", status: "Đang gia công",
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-25",
    customer: { name: "Lê Văn Tám", phone: "0321654987", address: "688 Lê Trọng Tấn, Bình Tân, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 120000000, deposit: 40000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    shippingNotes: "Bộ Salon rất nặng, cần đi xe cẩu và ít nhất 6 người hỗ trợ lắp đặt.",
    products: [{ name: "Bộ Salon", material: "Hương", size: "To", finish: "PU", qty: 1, price: 120000000, note: "Trơn" }],
    timeline: [
      { time: "11/03/2026 09:30", label: "Đã nhập kho", desc: "Chuẩn bị", active: false },
      { time: "11/03/2026 14:00", label: "Đang gia công", desc: "Đã bàn giao gia công", active: true }
    ],
  },
  "DH-D03": {
    code: "DH-DAT-003", type: "Hàng đặt", status: "Đang gia công",
    date: "2026-03-10T10:15:00", deliveryDate: "2026-03-28",
    customer: { name: "Phan Trị", phone: "0944123789", address: "158 Nguyễn Văn Cừ, Long Biên, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 10000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    shippingNotes: "Giao lắp tầng 2 phòng khách, cầu thang rộng dễ vận chuyển.",
    products: [{ 
      name: "Tủ rượu gỗ sồi", material: "Sồi Nga", size: "120x200x40cm", finish: "Sơn màu óc chó", qty: 1, price: 45000000,
      note: "Yêu cầu sơn màu óc chó đậm giống ảnh mẫu khách gửi. Mẫu trơn hiện đại."
    }],
    sampleImages: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
      "https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800"
    ],
    timeline: [
      { time: "10/03/2026 10:15", label: "Tạo đơn", desc: "Khách đặt màu óc chó", active: false },
      { time: "11/03/2026 09:00", label: "Đang gia công", desc: "Đã bàn giao xưởng", active: true }
    ],
  },
  "DH-D04": {
    code: "DH-DAT-004", type: "Hàng đặt", status: "Chuẩn bị giao hàng",
    date: "2026-03-09T14:20:00", deliveryDate: "2026-03-22",
    customer: { name: "Hoàng Minh Sơn", phone: "0988776655", address: "Diamond Island, Quận 2, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 95000000, deposit: 30000000, paymentStatus: "partial",
    products: [{ name: "Bàn ăn gỗ nguyên chấn", material: "Gỗ Me tây", size: "220x90x10cm", finish: "Sơn PU mờ 50", qty: 1, price: 95000000, warranty: "24 tháng", note: "Cạnh tự nhiên (Live Edge), Trơn" }],
    timeline: [
      { time: "09/03/2026 14:20", label: "Tạo đơn", desc: "Khách chọn tấm gỗ mã MT-09", active: false },
      { time: "14/03/2026 16:00", label: "Xong sản xuất", desc: "Đã nhập kho chờ xe giao", active: true }
    ],
  },
  "DH-D05": {
    code: "DH-DAT-005", type: "Hàng đặt", status: "Đang giao hàng",
    date: "2026-03-08T11:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Phạm Thu Thủy", phone: "0909112233", address: "Khu đô thị Sala, Quận 2, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 34000000, deposit: 10000000, paymentStatus: "partial",
    products: [{ name: "Giường ngủ 1.8m", material: "Gỗ xoan đào", size: "180x200cm", finish: "Sơn bóng 100", qty: 1, price: 34000000, warranty: "12 tháng", note: "Trơn phối màu" }],
    timeline: [
      { time: "08/03/2026 11:00", label: "Tạo đơn", desc: "Đã nhập kho mộc", active: false },
      { time: "18/03/2026 14:00", label: "Đang giao hàng", desc: "Shipper đang trên đường tới địa chỉ khách", active: true }
    ],
  },
  "DH-D06": {
    code: "DH-DAT-006", type: "Hàng đặt", status: "Hoàn thành",
    date: "2026-03-05T08:30:00", deliveryDate: "2026-03-15",
    deliveryImage: "https://images.unsplash.com/photo-1599690924032-4e55e5108bb6",
    customer: { name: "Thân Văn Kỵ", phone: "0977123987", address: "Khu biệt thự Chateau, Phú Mỹ Hưng, Quận 7, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 210000000, deposit: 210000000, depositMethod: "Chuyển khoản", paymentStatus: "full",
    shippingNotes: "Hàng cao cấp, bọc lót kỹ. Giao sân vườn tầng trệt.",
    products: [{ name: "Sofa", material: "Đỏ", size: "To", finish: "PU", qty: 1, price: 210000000, note: "Chạm" }],
    sampleImages: [
      "https://images.unsplash.com/photo-1599690924032-4e55e5108bb6?q=80&w=800"
    ],
    timeline: [{ time: "15/03", label: "Hoàn thành", desc: "Đã giao", active: true }],
  },
  "DH-D07": {
    code: "DH-DAT-007", type: "Hàng đặt", status: "Chờ duyệt hủy",
    cancelReason: "Khách đổi ý sang mua tại cửa hàng gần nhà hơn",
    date: "2026-03-11T13:45:00", deliveryDate: "2026-03-26",
    customer: { name: "Nguyễn Văn Triệu", phone: "0911223344", address: "15 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "none",
    shippingNotes: "Đơn bị hủy do khách muốn đổi mẫu tại cửa hàng.",
    products: [{ name: "Hệ tủ bếp gỗ công nghiệp", material: "Gỗ MDF phủ Melamine", size: "Dài 3.2m", finish: "Phủ Melamine mờ", qty: 1, price: 85000000, warranty: "12 tháng", note: "Trơn một màu" }],
    timeline: [
      { time: "11/03/2026 13:45", label: "Tiếp nhận tư vấn", active: false },
      { time: "11/03/2026 15:00", label: "Chờ duyệt hủy", desc: "Yêu cầu hủy do chưa vào cọc", active: true }
    ],
  },
  "DH-D08": {
    code: "DH-DAT-008", type: "Hàng đặt", status: "Đơn đã hủy",
    date: "2026-03-01T10:00:00", deliveryDate: "2026-03-10",
    customer: { name: "Chu Văn An", phone: "0933441122", address: "123 Đường 3/2, Ninh Kiều, Cần Thơ" },
    salesPerson: "Bình Nguyễn", total: 42000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "none",
    shippingNotes: "Khách hủy do thay đổi thiết kế nội thất toàn diện.",
    products: [{ name: "Bàn phấn trang điểm", material: "Gỗ MDF chống ẩm", size: "100x45x75cm", finish: "Sơn trắng 2K", qty: 1, price: 42000000, warranty: "12 tháng", note: "Tân cổ điển" }],
    timeline: [
      { time: "01/03/2026 10:00", label: "Tạo đơn", active: false },
      { time: "01/03/2026 15:30", label: "Đơn đã hủy", desc: "Hủy sớm do khách thay đổi thiết kế nội thất", active: true }
    ],
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
    "Đang sản xuất":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber
    "Đang gia công":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber
    "Chuẩn bị giao hàng":   { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }, // Purple
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
      </div>

      {o.notes && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--grid-border)" }}>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ghi chú</p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{o.notes}</p>
        </div>
      )}
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

const MediaGallery = ({ images }) => (
  <div
    className="rounded-2xl overflow-hidden mt-4"
    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    <div
      className="px-5 py-3 flex items-center justify-between"
      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
    >
      <div className="flex items-center gap-2">
        <Camera size={14} className="text-emerald-600" />
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
          Ảnh mẫu / Yêu cầu từ khách
        </span>
      </div>
      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
        {images?.length || 0} Ảnh
      </span>
    </div>
    <div className="p-5">
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
             <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-lg transition cursor-pointer">
                <img src={img} alt="Sample" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
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


// --- KIỂU HIỂN THỊ ĐƠN HÀNG THÔNG THƯỜNG ---
// Chuyên dụng để theo dõi đơn (Đã chốt giá, Đang sản xuất, Giao hàng...)
const StandardOrderView = ({ o, productTotal, displayTotal, hasPricing, remaining, deliveryImage, onDeliveryImageChange }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* ── BANNER ── */}
      {o.status === "Chuẩn bị giao hàng" && (
        <div
          className="flex flex-col md:flex-row items-stretch md:items-start gap-4 p-5 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <div className="shrink-0 relative group cursor-pointer w-full md:w-40 h-32 md:h-auto object-cover rounded-xl overflow-hidden border-2 border-green-200">
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
                  <div className="relative">
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 overflow-hidden"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} style={{ color: "var(--text-secondary)" }} />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{p.name}</p>
                        {p.note && (
                          <p className="text-[12px] italic mt-0.5" style={{ color: "var(--status-error)" }}>
                            * {p.note}
                          </p>
                        )}
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
          {o.type === "Đặt theo mẫu" && (o.status === "Đang sản xuất" || o.status === "Đang gia công") && (
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
                      Đang sản xuất (Đánh ráp)
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

          {/* ── CARD: Ảnh mẫu khách gửi — Không hiện với Hàng Sẵn ── */}
          {o.type !== "Hàng sẵn" && o.sampleImages && o.sampleImages.length > 0 && (
            <MediaGallery images={o.sampleImages} />
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
                    <span className="font-bold" style={{ color: "var(--text-main)" }}>Tổng thanh toán</span>
                    <span className="font-bold text-[15px]" style={{ color: "var(--brand-primary)" }}>{fmtCurrency(displayTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Đặt cọc</span>
                  <span className="font-bold" style={{ color: "#15803D" }}>{fmtCurrency(o.deposit || 0)}</span>
                </div>

                <div className="pt-2 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Còn lại</span>
                    <div className="text-right">
                      <p className="text-[16px] font-black" style={{ color: remaining > 0 ? "#DC2626" : "#15803D" }}>
                        {fmtCurrency(remaining)}
                      </p>
                      {o.paymentStatus === "partial" && (
                        <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">Đặt cọc một phần</p>
                      )}
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
              {o.shippingNotes && (
                <div className="flex items-start gap-2.5 pt-2" style={{ borderTop: "1px solid var(--grid-border)" }}>
                  <Truck size={13} className="mt-0.5 shrink-0" style={{ color: "var(--brand-primary)" }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--brand-primary)" }}>Ghi chú giao hàng & lắp đặt</p>
                    <p className="text-[12px] font-medium mt-0.5 text-gray-700 leading-relaxed italic">
                      "{o.shippingNotes}"
                    </p>
                  </div>
                </div>
              )}
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

  // Effect to sync state when modal opens
  useEffect(() => {
    if (showCompleteModal) {
      const calculatedTotal = o.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
      const displayTotal = o.total != null ? o.total : calculatedTotal;
      const rem = displayTotal - (o.deposit || 0);
      setFinalPayment(rem > 0 ? rem : 0);
    }
  }, [showCompleteModal, o.total, o.deposit, o.products]);

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
          paymentMethod
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
                    {o.status === "Đã nhập kho" && o.type === "Hàng đặt" ? "Đã duyệt mộc" : o.status}
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


              {/* Nút Bàn giao Xưởng (Hàng mộc) */}
              {o.status === "Chờ xử lý" && o.type === "Hàng mộc" && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#4F46E5", color: "#fff" }}
                   onClick={() => {
                      if(window.confirm("Bàn giao đơn hàng này sang Xưởng sản xuất?")) {
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { ...order, status: "Đang sản xuất" } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        toast.success("Đã bàn giao Xưởng thành công!");
                        navigate("/owner/production/LSX001");
                      }
                   }}
                 >
                   <Hammer size={14} />
                   Bàn giao gia công
                 </button>
              )}

              {/* Hàng đặt workflow - Tới bước Đã nhập kho thì Owner mới bắt đầu thao tác */}
              
              {o.status === "Đã nhập kho" && o.type === "Hàng đặt" && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#4F46E5", color: "#fff" }}
                   onClick={() => {
                      if(window.confirm("Xác nhận bàn giao gia công?")) {
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { ...order, status: "Đang gia công" } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        toast.success("Đã bàn giao gia công thành công!");
                        navigate(0);
                      }
                   }}
                 >
                   <Hammer size={14} />
                   Bàn giao gia công
                 </button>
              )}
              
              {/* Nút Chuyển từ Chờ xử lý -> Chuẩn bị giao hàng (Dành cho Hàng Sẵn - Nhảy cóc) - ĐÃ GỠ THEO YÊU CẦU: Sales tự xử lý */}




              {/* Chủ duyệt hủy đơn mà Sales yêu cầu */}
              {o.status === "Chờ duyệt hủy" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#DC2626", color: "#fff" }}
                  onClick={() => {
                    if(window.confirm("Bạn xác nhận duyệt phê chuẩn hủy đơn hàng này?")) {
                      const updated = savedOrders.map(order => 
                        (order.code === o.code || order.id === id) ? { ...order, status: "Đơn đã hủy" } : order
                      );
                      localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                      toast.success("Đã duyệt hủy đơn hàng thành công!");
                      navigate("/owner/orders");
                    }
                  }}
                >
                  <XCircle size={14} />
                  Duyệt hủy đơn
                </button>
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

              {o.status === "Chuẩn bị giao hàng" && (
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
    </>
  );
}
