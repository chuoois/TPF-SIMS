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
      allowNull: false,
    },
    item_serial: {
      type: DataTypes.STRING(100),
    },
    item_status: {
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
