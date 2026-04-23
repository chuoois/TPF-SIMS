const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model OrderItem
 * Bảng chi tiết sản phẩm trong đơn hàng
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const OrderItem = sequelize.define(
  "OrderItem",
  {
    pk_order_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_img: {
      type: DataTypes.JSON, // Lưu mảng nhiều ảnh từ khách hàng
    },
    item_img: {
      type: DataTypes.TEXT, // Clone ảnh từ Product gốc
    },
    item_name: {
      type: DataTypes.STRING(255),
    },
    item_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    item_material: {
      type: DataTypes.STRING(100),
    },
    item_size: {
      type: DataTypes.STRING(100),
    },
    item_color: {
      type: DataTypes.STRING(100),
    },
    item_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    item_note: {
      type: DataTypes.TEXT,
    },
    is_finished: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 0: Mộc (Raw), 1: Sơn (Finished)
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
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
  },
  {
    tableName: "order_item",
    timestamps: false,
  }
);

module.exports = OrderItem;
