const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model CustomRequestItem
 * Bảng chi tiết sản phẩm trong phiếu yêu cầu (Detail)
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
const CustomRequestItem = sequelize.define(
  "CustomRequestItem",
  {
    pk_custom_request_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_custom_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.JSON, // { length, width, height }
    },
    item_color: {
      type: DataTypes.STRING(100),
    },
    item_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    customer_img: {
      type: DataTypes.JSON, // Mảng ảnh mẫu từ khách cho từng món
    },
    design_img: {
      type: DataTypes.JSON, // Mảng ảnh thiết kế từ chủ shop/kỹ thuật
    },
    item_note: {
      type: DataTypes.TEXT,
    },
    item_warranty: {
      type: DataTypes.INTEGER,
      comment: "Thời gian bảo hành (tháng)",
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
    tableName: "custom_request_item",
    timestamps: false,
  }
);

module.exports = CustomRequestItem;
