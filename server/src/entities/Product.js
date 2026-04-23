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
    unit: {
      type: DataTypes.STRING(50),
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    product_type: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Standard (Hàng mẫu/Sẵn), 2: Custom (Hàng đặt riêng)
    },
    warranty_months: {
      type: DataTypes.INTEGER,
    },
    size: {
      type: DataTypes.STRING(100),
    },
    product_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Active, 0: Inactive
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
