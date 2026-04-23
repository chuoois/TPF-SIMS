const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductMaterial
 * Bảng thông tin chất liệu sản phẩm
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const ProductMaterial = sequelize.define(
  "ProductMaterial",
  {
    pk_product_material_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    material_name: {
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
    tableName: "product_material",
    timestamps: false,
  }
);

module.exports = ProductMaterial;
