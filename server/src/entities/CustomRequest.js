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
    },
    total_estimated_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    address: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Pending, 2: Quoted, 3: Ordered, 0: Cancelled
    },
    order_type: {
      type: DataTypes.TINYINT,
      defaultValue: 3, // 3: Đặt riêng (Custom Order)
    },
    note: {
      type: DataTypes.TEXT,
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    expected_fulfillment_date: {
      type: DataTypes.DATE,
    },
    fulfillment_method: {
      type: DataTypes.STRING(100),
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
    indexes: [
      {
        unique: true,
        fields: ["request_code"],
        name: "unique_request_code"
      }
    ]
  }
);

module.exports = CustomRequest;
