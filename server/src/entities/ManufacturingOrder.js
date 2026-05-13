const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ManufacturingOrder
 * Bảng thông tin chung của phiếu nhập hàng / gia công gửi xưởng
 * Created By: ThinhBui
 * Created Date: 13/05/2026
 */
const ManufacturingOrder = sequelize.define(
  "ManufacturingOrder",
  {
    pk_manufacturing_order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fk_supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Mới tạo, 2: Đã gửi xưởng, 3: Đang gia công, 4: Đã hoàn thành, 0: Đã hủy
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    expected_delivery_date: {
      type: DataTypes.DATE,
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
    tableName: "manufacturing_order",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["order_code"],
        name: "unique_order_code"
      }
    ]
  }
);

module.exports = ManufacturingOrder;
