const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ManufacturingOrderItem
 * Bảng chi tiết sản phẩm trong phiếu nhập hàng / gia công
 * Created By: ThinhBui
 * Created Date: 13/05/2026
 */
const ManufacturingOrderItem = sequelize.define(
  "ManufacturingOrderItem",
  {
    pk_manufacturing_order_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_manufacturing_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fk_product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fk_custom_request_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.STRING(255),
    },
    item_material: {
      type: DataTypes.STRING(100),
    },
    item_size: {
      type: DataTypes.JSON, // { length, width, height } hoặc string
    },
    item_color: {
      type: DataTypes.STRING(100),
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    import_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    expected_date: {
      type: DataTypes.DATE,
    },
    item_is_bundle: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    item_bundle_items: {
      type: DataTypes.JSON,
    },
    note: {
      type: DataTypes.TEXT,
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
    tableName: "manufacturing_order_item",
    timestamps: false,
  }
);

module.exports = ManufacturingOrderItem;
