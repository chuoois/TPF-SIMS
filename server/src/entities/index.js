const sequelize = require("../config/db");
const UserRole = require("./UserRole");
const UserAccount = require("./UserAccount");
const UserProfile = require("./UserProfile");
const RefreshToken = require("./RefreshToken");
const CustomerProfile = require("./CustomerProfile");
const SystemLog = require("./SystemLog");
const ProductMaterial = require("./ProductMaterial");
const ProductCategory = require("./ProductCategory");
const ProductColor = require("./ProductColor");
const Product = require("./Product.js");
const ProductItem = require("./ProductItem.js");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const OrderHistory = require("./OrderHistory");
const ProductPricing = require("./ProductPricing");
const ProductRoom = require("./ProductRoom");
const CustomRequest = require("./CustomRequest");
const CustomRequestItem = require("./CustomRequestItem");
const ProductCoupon = require("./ProductCoupon");
const CouponProduct = require("./CouponProduct");
const OrderItemProcessing = require("./OrderItemProcessing");
const Employee = require("./Employee");
const PayrollPeriod = require("./PayrollPeriod");
const SalaryRecord = require("./SalaryRecord");
const SalaryAdjustment = require("./SalaryAdjustment");
const Notification = require("./Notification");
const Supplier = require("./Supplier");
const ManufacturingOrder = require("./ManufacturingOrder");
const ManufacturingOrderItem = require("./ManufacturingOrderItem");
const ImportReceipt = require("./ImportReceipt");


/**
 * Định nghĩa quan hệ giữa các bảng
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */

// UserRole 1:N UserAccount
UserRole.hasMany(UserAccount, { foreignKey: "role_id", as: "accounts" });
UserAccount.belongsTo(UserRole, { foreignKey: "role_id", as: "role" });

// UserAccount 1:1 UserProfile
UserAccount.hasOne(UserProfile, {
  foreignKey: "user_account_id",
  as: "profile",
  onDelete: "CASCADE",
});
UserProfile.belongsTo(UserAccount, {
  foreignKey: "user_account_id",
  as: "account",
});

// UserAccount 1:N RefreshToken
UserAccount.hasMany(RefreshToken, {
  foreignKey: "user_account_id",
  as: "refreshTokens",
  onDelete: "CASCADE",
});
RefreshToken.belongsTo(UserAccount, {
  foreignKey: "user_account_id",
  as: "account",
});

// UserAccount 1:1 CustomerProfile
UserAccount.hasOne(CustomerProfile, {
  foreignKey: "fk_user_account_id",
  as: "customer",
  onDelete: "CASCADE",
});
CustomerProfile.belongsTo(UserAccount, {
  foreignKey: "fk_user_account_id",
  as: "account",
});

// UserAccount 1:N SystemLog
UserAccount.hasMany(SystemLog, {
  foreignKey: "user_account_id",
  as: "logs",
});
SystemLog.belongsTo(UserAccount, {
  foreignKey: "user_account_id",
  as: "account",
});

// ProductCategory 1:N Product
ProductCategory.hasMany(Product, { foreignKey: "fk_category_id", as: "products" });
Product.belongsTo(ProductCategory, { foreignKey: "fk_category_id", as: "category" });

// ProductColor 1:N Product
ProductColor.hasMany(Product, { foreignKey: "fk_color_id", as: "products" });
Product.belongsTo(ProductColor, { foreignKey: "fk_color_id", as: "color" });

// ProductMaterial 1:N Product
ProductMaterial.hasMany(Product, { foreignKey: "fk_material_id", as: "products" });
Product.belongsTo(ProductMaterial, { foreignKey: "fk_material_id", as: "material" });

// ProductRoom 1:N Product
ProductRoom.hasMany(Product, { foreignKey: "fk_room_id", as: "products" });
Product.belongsTo(ProductRoom, { foreignKey: "fk_room_id", as: "room" });

// Product 1:N ProductItem
Product.hasMany(ProductItem, { foreignKey: "fk_product_id", as: "items" });
ProductItem.belongsTo(Product, { foreignKey: "fk_product_id", as: "product" });

// CustomerProfile 1:N Order
CustomerProfile.hasMany(Order, { foreignKey: "fk_customer_id", as: "orders" });
Order.belongsTo(CustomerProfile, { foreignKey: "fk_customer_id", as: "customer" });

// UserAccount 1:N Order
UserAccount.hasMany(Order, { foreignKey: "fk_user_account_id", as: "orders" });
Order.belongsTo(UserAccount, { foreignKey: "fk_user_account_id", as: "account" });

// Order 1:N OrderItem
Order.hasMany(OrderItem, { foreignKey: "fk_order_id", as: "items", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "fk_order_id", as: "order" });

// Order 1:N OrderHistory
Order.hasMany(OrderHistory, { foreignKey: "fk_order_id", as: "histories", onDelete: "CASCADE" });
OrderHistory.belongsTo(Order, { foreignKey: "fk_order_id", as: "order" });

// Product 1:N OrderItem
Product.hasMany(OrderItem, { foreignKey: "fk_product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "fk_product_id", as: "product" });

// OrderItem 1:N ProductItem
OrderItem.hasMany(ProductItem, { foreignKey: "fk_order_item_id", as: "items" });
ProductItem.belongsTo(OrderItem, { foreignKey: "fk_order_item_id", as: "orderItem" });

// OrderItem 1:N OrderItemProcessing
OrderItem.hasMany(OrderItemProcessing, { foreignKey: "fk_order_item_id", as: "processing", onDelete: "CASCADE" });
OrderItemProcessing.belongsTo(OrderItem, { foreignKey: "fk_order_item_id", as: "orderItem" });

// Product 1:N ProductPricing
Product.hasMany(ProductPricing, { foreignKey: "fk_product_id", as: "pricings" });
ProductPricing.belongsTo(Product, { foreignKey: "fk_product_id", as: "product" });

// CustomerProfile 1:N CustomRequest
CustomerProfile.hasMany(CustomRequest, { foreignKey: "fk_customer_id", as: "customRequests" });
CustomRequest.belongsTo(CustomerProfile, { foreignKey: "fk_customer_id", as: "customer" });

// CustomRequest 1:1 Order (Optional)
CustomRequest.belongsTo(Order, { foreignKey: "fk_order_id", as: "order" });
Order.hasOne(CustomRequest, { foreignKey: "fk_order_id", as: "customRequest" });

// CustomRequest 1:N CustomRequestItem
CustomRequest.hasMany(CustomRequestItem, { foreignKey: "fk_custom_request_id", as: "items", onDelete: "CASCADE" });
CustomRequestItem.belongsTo(CustomRequest, { foreignKey: "fk_custom_request_id", as: "request" });

// CustomRequestItem 1:N Supplier
CustomRequestItem.belongsTo(Supplier, { foreignKey: "fk_supplier_id", as: "supplier" });
Supplier.hasMany(CustomRequestItem, { foreignKey: "fk_supplier_id", as: "customItems" });

// CustomRequestItem 1:1 OrderItem (Liên kết yêu cầu đặt riêng với chi tiết đơn hàng)
CustomRequestItem.hasOne(OrderItem, { foreignKey: "fk_custom_request_item_id", as: "orderItem" });
OrderItem.belongsTo(CustomRequestItem, { foreignKey: "fk_custom_request_item_id", as: "customRequestItem" });

// Product Many:Many ProductCoupon
Product.belongsToMany(ProductCoupon, {
  through: CouponProduct,
  foreignKey: "fk_product_id",
  otherKey: "fk_coupon_id",
  as: "coupons",
});
ProductCoupon.belongsToMany(Product, {
  through: CouponProduct,
  foreignKey: "fk_coupon_id",
  otherKey: "fk_product_id",
  as: "products",
});

// ── Payroll Associations ────────────────────────────────

// Employee (optional) → UserAccount
Employee.belongsTo(UserAccount, { foreignKey: "user_account_id", as: "account", constraints: false });
UserAccount.hasMany(Employee, { foreignKey: "user_account_id", as: "employees", constraints: false });

// PayrollPeriod 1:N SalaryRecord
PayrollPeriod.hasMany(SalaryRecord, { foreignKey: "fk_period_id", as: "records", onDelete: "CASCADE" });
SalaryRecord.belongsTo(PayrollPeriod, { foreignKey: "fk_period_id", as: "period" });

// Employee 1:N SalaryRecord
Employee.hasMany(SalaryRecord, { foreignKey: "fk_employee_id", as: "salaryRecords" });
SalaryRecord.belongsTo(Employee, { foreignKey: "fk_employee_id", as: "employee" });

// UserAccount 1:N OrderItemProcessing
UserAccount.hasMany(OrderItemProcessing, { foreignKey: "fk_user_account_id", as: "processingTasks" });
OrderItemProcessing.belongsTo(UserAccount, { foreignKey: "fk_user_account_id", as: "worker" });

// SalaryRecord 1:N SalaryAdjustment
SalaryRecord.hasMany(SalaryAdjustment, { foreignKey: "fk_record_id", as: "adjustments", onDelete: "CASCADE" });
SalaryAdjustment.belongsTo(SalaryRecord, { foreignKey: "fk_record_id", as: "record" });

// UserAccount 1:N Notification
UserAccount.hasMany(Notification, { foreignKey: "fk_user_id", as: "notifications", onDelete: "CASCADE" });
Notification.belongsTo(UserAccount, { foreignKey: "fk_user_id", as: "recipient" });

// ── Manufacturing Order Associations ────────────────────

// Supplier 1:N ManufacturingOrder
Supplier.hasMany(ManufacturingOrder, { foreignKey: "fk_supplier_id", as: "manufacturingOrders" });
ManufacturingOrder.belongsTo(Supplier, { foreignKey: "fk_supplier_id", as: "supplier" });

// ManufacturingOrder 1:N ManufacturingOrderItem
ManufacturingOrder.hasMany(ManufacturingOrderItem, { foreignKey: "fk_manufacturing_order_id", as: "items", onDelete: "CASCADE" });
ManufacturingOrderItem.belongsTo(ManufacturingOrder, { foreignKey: "fk_manufacturing_order_id", as: "order" });

// Product 1:N ManufacturingOrderItem
Product.hasMany(ManufacturingOrderItem, { foreignKey: "fk_product_id", as: "manufacturingItems" });
ManufacturingOrderItem.belongsTo(Product, { foreignKey: "fk_product_id", as: "product" });

// CustomRequestItem 1:1 ManufacturingOrderItem (Một món đặt riêng thường chỉ nằm trong 1 phiếu nhập)
CustomRequestItem.hasOne(ManufacturingOrderItem, { foreignKey: "fk_custom_request_item_id", as: "manufacturingDetail" });
ManufacturingOrderItem.belongsTo(CustomRequestItem, { foreignKey: "fk_custom_request_item_id", as: "customRequestItem" });

// ── ImportReceipt Associations ───────────────────────────

// ManufacturingOrder 1:N ImportReceipt
ManufacturingOrder.hasMany(ImportReceipt, { foreignKey: "fk_manufacturing_order_id", as: "importReceipts" });
ImportReceipt.belongsTo(ManufacturingOrder, { foreignKey: "fk_manufacturing_order_id", as: "manufacturingOrder" });


module.exports = {
  sequelize,
  UserRole,
  UserAccount,
  UserProfile,
  RefreshToken,
  CustomerProfile,
  SystemLog,
  ProductMaterial,
  ProductCategory,
  ProductColor,
  Product,
  ProductItem,
  Order,
  OrderItem,
  OrderHistory,
  ProductPricing,
  ProductRoom,
  CustomRequest,
  CustomRequestItem,
  ProductCoupon,
  CouponProduct,
  // Payroll
  Employee,
  PayrollPeriod,
  SalaryRecord,
  SalaryAdjustment,
  Notification,
  Supplier,
  OrderItemProcessing,
  ManufacturingOrder,
  ManufacturingOrderItem,
  ImportReceipt,
};