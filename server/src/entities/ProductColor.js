const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductColor
 * Bảng thông tin màu sắc sản phẩm
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const ProductColor = sequelize.define(
  "ProductColor",
  {
    pk_product_color_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    color_name: {
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
    tableName: "product_color",
    timestamps: false,
  }
);

module.exports = ProductColor;
