import { Clock, Play, CheckCircle2, AlertCircle } from "lucide-react";

export const STATUS_CONFIG = {
  WAITING: { label: "Tiếp nhận", color: "bg-gray-100 text-gray-700", icon: Clock },
  INSPECTION: { label: "Nghiệm thu", color: "bg-blue-100 text-blue-700", icon: Play },
  OWNER_PENDING: { label: "Chờ chủ duyệt", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
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
        picture: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=200",
        size: "120x80x75 cm",
        type: "Gỗ sồi Nga",
        color: "Màu tự nhiên",
        quantity: 1,
        status: "WAITING",
        deadline: "26/10/2023",
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
        picture: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=200",
        size: "200x60x220 cm",
        type: "Gỗ MDF chống ẩm",
        color: "Trắng vân gỗ",
        quantity: 1,
        status: "INSPECTION",
        deadline: "28/10/2023",
      },
    ],
  },
];

export const getOrders = () => [...MOCK_ORDERS];

export const getItemById = (id) => {
  for (const order of MOCK_ORDERS) {
    const item = order.items.find((i) => i.id === id);
    if (item) {
      return { 
        ...item, 
        image: item.picture, 
        orderId: order.id, 
        customerName: order.customerName, 
        isCustomOrder: order.isCustomOrder 
      };
    }
  }
  return null;
};

export const getTaskById = getItemById;

export const updateMockTaskStatus = (itemId, newStatus, finishedImage = null) => {
  MOCK_ORDERS = MOCK_ORDERS.map(order => ({
    ...order,
    items: order.items.map(item => item.id === itemId ? { ...item, status: newStatus, finishedImage: finishedImage || item.finishedImage } : item)
  }));
};

export const updateTaskFinishedImage = (itemId, finishedImage) => {
  MOCK_ORDERS = MOCK_ORDERS.map(order => ({
    ...order,
    items: order.items.map(item => item.id === itemId ? { ...item, finishedImage } : item)
  }));
};

export const updateTaskDeadline = (itemId, deadline, urgency) => {
  MOCK_ORDERS = MOCK_ORDERS.map(order => ({
    ...order,
    items: order.items.map(item => item.id === itemId ? { ...item, deadline, urgency } : item)
  }));
};

export const reportTaskIssue = (itemId, issueData) => {
  MOCK_ORDERS = MOCK_ORDERS.map(order => ({
    ...order,
    items: order.items.map(item => item.id === itemId ? { ...item, issue: { ...issueData, reportedAt: new Date().toLocaleString("vi-VN") } } : item)
  }));
};

export const clearTaskIssue = (itemId) => {
  MOCK_ORDERS = MOCK_ORDERS.map(order => ({
    ...order,
    items: order.items.map(item => {
      if (item.id === itemId) {
        const { issue, ...rest } = item;
        return rest;
      }
      return item;
    })
  }));
};
