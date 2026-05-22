const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model Product
 * Bảng thông tin sản phẩm
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const Product = sequelize.define(
  "Product",
  {
    pk_product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_color_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_material_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_room_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(100),
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    product_img: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_bundle: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "1: Là bộ sản phẩm, 0: SP đơn lẻ",
    },
    bundle_items: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Danh sách sản phẩm con trong bộ, null nếu là SP đơn lẻ"
      /*
        Cấu trúc JSON:
        [
          {
            "name": "Bàn ăn Osaka",
            "quantity": 1,
            "size": { "note": "Tay 30", "unit": "cm", "width": 240, "height": 240, "length": 120 },
            "color": "Walnut",
            "material": "Gỗ sồi"
          },
          {
            "name": "Ghế ăn Osaka",
            "quantity": 4,
            "size":{"note": "Tay 30", "unit": "cm", "width": 240, "height": 240, "length": 120}
            "color": "Walnut",
            "material": "Gỗ sồi"
          }
        ]
      */
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_gift: {
      type: DataTypes.TINYINT,
      defaultValue: 0, // 1: Quà tặng, 0: Hàng bán bình thường
    },
    product_type: {
      type: DataTypes.STRING(20),
      defaultValue: "CUSTOM",
      comment: "Loại SP: FINISHED, RAW, CUSTOM",
    },
    warranty_months: {
      type: DataTypes.INTEGER,
    },
    size: {
      type: DataTypes.JSON,
    },
    product_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Active, 0: Inactive
    },
    min_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Số lượng tồn kho tối thiểu để cảnh báo",
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
    tableName: "product",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["sku"],
        name: "unique_sku",
      },
    ],
  }
);

module.exports = Product;
