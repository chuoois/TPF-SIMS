const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model Order
 * Bảng thông tin đơn hàng
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const Order = sequelize.define(
  "Order",
  {
    pk_order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order_code: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    fulfillment_method: {
      type: DataTypes.STRING(100),
    },
    expected_fulfillment_date: {
      type: DataTypes.DATE,
    },
    note: {
      type: DataTypes.TEXT,
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    address: {
      type: DataTypes.STRING(255),
    },
    received_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    delivery_image: {
      type: DataTypes.JSON, // Mảng URL ảnh khi giao hàng thành công
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    order_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, //  0: "Đơn đã hủy", 1: "Chờ sản xuất", 2: "Chờ xử lý", 3: "Đang gia công", 4: "Chờ giao hàng", 5: "Đang giao hàng", 6: "Hoàn thành", 7: "Chờ duyệt hủy"
    },
    order_type: {
      type: DataTypes.TINYINT,
      defaultValue: 2, // 1: Đơn hàng mộc (Raw Order), 2: Đơn hàng sẵn (Stock Order), 3: Đơn hàng custom (Custom Order)
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Active, 0: Inactive (Soft delete)
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    modifiedate: {
      type: DataTypes.DATE,
    },
    createby: {
      type: DataTypes.INTEGER,
    },
    modifieby: {
      type: DataTypes.INTEGER,
    },
    deposit_resolution: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "refunded: Đã hoàn cọc, forfeited: Mất cọc"
    },
    cancel_reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  },
  {
    tableName: "order",
    timestamps: false,
    indexes: [
      {
        fields: ["order_status"],
        name: "idx_order_status",
      },
    ],
  }
);

module.exports = Order;
