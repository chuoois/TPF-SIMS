const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductItem
 * Bảng thông tin chi tiết từng sản phẩm (serial)
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const ProductItem = sequelize.define(
  "ProductItem",
  {
    pk_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Tên sản phẩm (lưu trực tiếp để hiển thị khi product bị null)",
    },
    fk_order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Liên kết với chi tiết đơn hàng khi sản phẩm được giữ chỗ hoặc đã giao",
    },
    cost_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      comment: "Giá vốn nhập kho của riêng món hàng này",
    },
    batch_code: {
      type: DataTypes.STRING(100),
      comment: "Mã lô nhập hàng",
    },
    item_serial: {
      type: DataTypes.STRING(100),
    },
    item_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: "Trạng thái sản phẩm: 1-Sẵn sàng, 2-Chờ giao, 3-Lỗi",
    },
    note: {
      type: DataTypes.TEXT,
      comment: "Ghi chú chi tiết về tình trạng sản phẩm",
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
    tableName: "product_item",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["item_serial"],
        name: "unique_item_serial",
      },
    ],
  }
);

module.exports = ProductItem;
