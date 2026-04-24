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

// Product 1:N ProductPricing
Product.hasMany(ProductPricing, { foreignKey: "fk_product_id", as: "pricings" });
ProductPricing.belongsTo(Product, { foreignKey: "fk_product_id", as: "product" });

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
};
