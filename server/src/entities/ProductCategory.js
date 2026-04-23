const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductCategory
 * Bảng thông tin loại sản phẩm
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    pk_product_category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    status: {
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
    tableName: "product_category",
    timestamps: false,
  }
);

module.exports = ProductCategory;
