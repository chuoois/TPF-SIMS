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
    fk_product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.STRING(255),
    },
    item_img: {
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
      type: DataTypes.JSON, // { length, width, height } hoặc string tùy nhu cầu
    },
    item_color: {
      type: DataTypes.STRING(100),
    },
    item_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    item_cost_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    customer_img: {
      type: DataTypes.JSON, // Mảng ảnh mẫu từ khách cho từng món
    },
    design_img: {
      type: DataTypes.JSON, // Mảng ảnh thiết kế từ chủ shop/kỹ thuật
    },
    is_finished: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 0: Mộc, 1: Sơn
    },
    item_note: {
      type: DataTypes.TEXT,
    },
    item_is_bundle: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "1: Là bộ sản phẩm, 0: SP đơn lẻ",
    },
    item_bundle_items: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Danh sách sản phẩm con trong bộ, null nếu là SP đơn lẻ"
    },
    item_warranty: {
      type: DataTypes.INTEGER,
      comment: "Thời gian bảo hành (tháng)",
    },
    expected_supplier_date: {
      type: DataTypes.DATE,
      comment: "Ngày xưởng dự kiến giao hàng",
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
