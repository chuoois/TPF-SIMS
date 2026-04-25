const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductCoupon
 * Bảng định nghĩa mã giảm giá (Chỉ giảm theo %)
 * Created By: ThinhBui
 * Created Date: 25/04/2026
 */
const ProductCoupon = sequelize.define(
  "ProductCoupon",
  {
    pk_coupon_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    coupon_name: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
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
    tableName: "product_coupon",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["coupon_code"],
        name: "unique_coupon_code",
      },
    ],
  }
);

module.exports = ProductCoupon;
