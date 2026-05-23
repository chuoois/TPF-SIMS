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
    design_img: {
      type: DataTypes.JSON, // Lưu mảng nhiều ảnh thiết kế từ chủ shop/kỹ thuật
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
      type: DataTypes.JSON,
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
    item_is_gift: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 1: Quà tặng, 0: Hàng bán bình thường
    },
    is_finished: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 0: Mộc (Raw), 1: Sơn (Finished)
    },
    item_warranty: {
      type: DataTypes.INTEGER,
      comment: "Thời gian bảo hành (tháng)",
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    import_status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "Trạng thái về kho: 0-Chưa về kho, 1-Đã về kho",
    },
    fk_custom_request_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Liên kết với chi tiết yêu cầu đặt riêng (CustomRequestItem)",
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
