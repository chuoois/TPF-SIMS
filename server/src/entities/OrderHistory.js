const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model OrderHistory
 * Bảng lịch sử đơn hàng
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const OrderHistory = sequelize.define(
  "OrderHistory",
  {
    pk_order_history_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(255),
    },
    old_status: {
      type: DataTypes.TINYINT,
    },
    new_status: {
      type: DataTypes.TINYINT,
    },
    changed_by: {
      type: DataTypes.INTEGER,
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    tableName: "order_history",
    timestamps: false,
  }
);

module.exports = OrderHistory;
