import { Clock, Play, CheckCircle2, AlertCircle } from "lucide-react";

export const STATUS_CONFIG = {
  WAITING: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700", icon: Clock },
  SANDING: { label: "Đang xử lý (Giấy giáp)", color: "bg-blue-100 text-blue-700", icon: Play },
  PAINTING: { label: "Đang xử lý (Sơn)", color: "bg-indigo-100 text-indigo-700", icon: Play },
  OWNER_PENDING: { label: "Chờ chủ duyệt", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  QC_PENDING: { label: "Chờ duyệt QC", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  REWORK: { label: "Làm lại", color: "bg-red-100 text-red-700 font-bold", icon: AlertCircle },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

let WAREHOUSE_STATUS = {
  isOverloaded: false,
  updatedAt: null,
};

export const getWarehouseStatus = () => WAREHOUSE_STATUS;

export const updateWarehouseStatus = (isOverloaded) => {
  WAREHOUSE_STATUS = {
    isOverloaded,
    updatedAt: new Date().toLocaleString("vi-VN"),
  };
  return WAREHOUSE_STATUS;
};

export let MOCK_ORDERS = [
  {
    id: "ORD-2023-001",
    customerName: "Nguyễn Văn A",
    orderDate: "25/10/2023",
    status: "PROCESSING",
    isCustomOrder: true,
    items: [
      {
        id: "ITEM-101",
        productName: "Bàn ăn gỗ sồi tân cổ điển",
        picture: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=200&auto=format&fit=crop",
        size: "120x80x75 cm",
        type: "Gỗ sồi Nga",
        color: "Màu tự nhiên",
        quantity: 1,
        note: "Bo tròn các góc bàn bán kính 2cm, sơn lót kỹ mặt dưới",
        status: "WAITING",
        startedAt: "26/10/2023",
        deliveryDate: "30/10/2023",
        deadline: "26/10/2023",
        urgency: "NORMAL",
      },
      {
        id: "ITEM-102",
        productName: "Ghế đôn gỗ sồi",
        picture: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=200&auto=format&fit=crop",
        size: "45x45x90 cm",
        type: "Gỗ sồi Nga",
        color: "Màu tự nhiên",
        quantity: 4,
        note: "Trang bị đệm mút D40, bọc nỉ màu xám lông chuột",
        status: "COMPLETED",
        startedAt: "24/10/2023 08:00",
        deliveryDate: "28/10/2023",
        deadline: "26/10/2023",
        urgency: "NORMAL",
      },
    ],
  },
  {
    id: "ORD-2023-002",
    customerName: "Trần Thị Cẩm Tú",
    orderDate: "26/10/2023",
    status: "PROCESSING",
    isCustomOrder: false,
    items: [
      {
        id: "ITEM-201",
        productName: "Tủ quần áo MDF 4 cánh",
        picture: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=200&auto=format&fit=crop",
        size: "200x60x220 cm",
        type: "Gỗ MDF chống ẩm",
        color: "Trắng vân gỗ",
        quantity: 1,
        note: "Hậu tủ phay rãnh lùa, chạy chỉ âm viền ngoài 5mm, dùng bản lề giảm chấn",
        status: "SANDING",
        startedAt: "25/10/2023 10:15",
        deliveryDate: "30/10/2023",
        deadline: "28/10/2023",
        urgency: "WARNING",
      },
    ],
  },
  {
    id: "ORD-2023-003",
    customerName: "Lê Minh Tuấn",
    orderDate: "27/10/2023",
    status: "WAITING",
    isCustomOrder: true,
    items: [
      {
        id: "ITEM-301",
        productName: "Giường ngủ bọc da",
        picture: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=200&auto=format&fit=crop",
        size: "180x200 cm",
        type: "Gỗ xoan đào",
        color: "Nâu cánh gián",
        quantity: 1,
        note: "Đầu giường bọc da microfiber, may rút múi kim cương",
        status: "WAITING",
        startedAt: "06/11/2023",
        deliveryDate: "05/11/2023",
        deadline: "06/11/2023",
        urgency: "NORMAL",
      },
      {
        id: "ITEM-302",
        productName: "Táp đầu giường",
        picture: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=200&auto=format&fit=crop",
        size: "45x40x50 cm",
        type: "Gỗ xoan đào",
        color: "Nâu cánh gián",
        quantity: 2,
        note: "Các ngăn kéo dùng ray trượt bi giảm chấn Hafele âm",
        status: "WAITING",
        startedAt: null,
        deadline: null,
        urgency: "NORMAL",
      },
    ],
  },
  {
    id: "ORD-2023-004",
    customerName: "Phạm Hà Giang",
    orderDate: "20/10/2023",
    status: "COMPLETED",
    isCustomOrder: true,
    items: [
      {
        id: "ITEM-401",
        productName: "Tủ rượu gỗ hương",
        picture: "https://images.unsplash.com/photo-1595428774223-ef52624120ec?q=80&w=200&auto=format&fit=crop",
        size: "80x40x200 cm",
        type: "Gỗ hương",
        color: "Nâu cánh gián",
        quantity: 1,
        note: "Lắp Kính cường lực 8li, gắn đèn LED hắt sáng bên trong",
        status: "COMPLETED",
        startedAt: "22/10/2023 08:00",
        deadline: "24/10/2023",
        urgency: "NORMAL",
        finishedImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400&auto=format&fit=crop"
      }
    ],
  },
];

export const getOrders = () => {
  return [...MOCK_ORDERS];
};

export const getItemById = (id) => {
  for (const order of MOCK_ORDERS) {
    const item = order.items.find((i) => i.id === id);
    if (item) {
      return { 
        ...item, 
        image: item.picture, // Alias for TaskDetail.jsx
        customerImages: item.customerImages || [item.picture, "https://images.unsplash.com/photo-1595428774223-ef52624120ec?auto=format&fit=crop&q=80&w=400"],
        orderId: order.id, 
        orderCode: order.id, 
        customerName: order.customerName, 
        isCustomOrder: order.isCustomOrder 
      };
    }
  }
  return null;
};

// Map old getTaskById method into getItemById logic directly
export const getTaskById = getItemById;

export const updateMockTaskStatus = (itemId, newStatus, finishedImage = null) => {
  MOCK_ORDERS = MOCK_ORDERS.map((order) => {
    let orderChanged = false;
    const newItems = order.items.map((item) => {
      if (item.id === itemId) {
        orderChanged = true;
        
        const updates = { ...item, status: newStatus };
        if (newStatus === "SANDING" && !item.startedAt) {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          updates.startedAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        }
        if (finishedImage) {
          updates.finishedImage = finishedImage;
        }
        return updates;
      }
      return item;
    });

    if (orderChanged) {
      const allCompleted = newItems.every(i => i.status === 'COMPLETED');
      return { ...order, items: newItems, status: allCompleted ? 'COMPLETED' : 'PROCESSING' };
    }
    return order;
  });
};

export const updateTaskFinishedImage = (itemId, finishedImage) => {
  MOCK_ORDERS = MOCK_ORDERS.map((order) => {
    let orderChanged = false;
    const newItems = order.items.map((item) => {
      if (item.id === itemId) {
        orderChanged = true;
        return { ...item, finishedImage };
      }
      return item;
    });
    return orderChanged ? { ...order, items: newItems } : order;
  });
};

export const updateTaskDeadline = (itemId, deadline, urgency) => {
  MOCK_ORDERS = MOCK_ORDERS.map((order) => {
    let orderChanged = false;
    const newItems = order.items.map((item) => {
      if (item.id === itemId) {
        orderChanged = true;
        return { ...item, deadline, urgency };
      }
      return item;
    });
    return orderChanged ? { ...order, items: newItems } : order;
  });
};

export const reportTaskIssue = (itemId, issueData) => {
  MOCK_ORDERS = MOCK_ORDERS.map((order) => {
    let orderChanged = false;
    const newItems = order.items.map((item) => {
      if (item.id === itemId) {
        orderChanged = true;
        return {
          ...item,
          issue: {
            ...issueData,
            reportedAt: new Date().toLocaleString("vi-VN"),
          },
        };
      }
      return item;
    });
    return orderChanged ? { ...order, items: newItems } : order;
  });
};

export const clearTaskIssue = (itemId) => {
  MOCK_ORDERS = MOCK_ORDERS.map((order) => {
    let orderChanged = false;
    const newItems = order.items.map((item) => {
      if (item.id === itemId) {
        orderChanged = true;
        const { issue, ...rest } = item;
        return rest;
      }
      return item;
    });
    return orderChanged ? { ...order, items: newItems } : order;
  });
};

