const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model CouponProduct
 * Bảng trung gian liên kết Coupon và Product (Many-to-Many)
 * Created By: ThinhBui
 * Created Date: 25/04/2026
 */
const CouponProduct = sequelize.define(
  "CouponProduct",
  {
    fk_coupon_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    fk_product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "coupon_product",
    timestamps: false,
  }
);

module.exports = CouponProduct;
