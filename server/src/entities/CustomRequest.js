const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model CustomRequest
 * Bảng thông tin chung của phiếu yêu cầu đặt hàng riêng (Header)
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
const CustomRequest = sequelize.define(
  "CustomRequest",
  {
    pk_custom_request_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    request_code: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    total_estimated_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Pending, 2: Quoted, 3: Ordered, 0: Cancelled
    },
    note: {
      type: DataTypes.TEXT,
    },
    fk_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "custom_request",
    timestamps: false,
  }
);

module.exports = CustomRequest;
