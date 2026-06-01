const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductPricing
 * Bảng quản lý giá sản phẩm (Giá mộc và Giá hoàn thiện)
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
const ProductPricing = sequelize.define(
  "ProductPricing",
  {
    pk_pricing_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fk_user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cost_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    profit_margin: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: "Biên lợi nhuận (%)",
    },
    operating_margin: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: "% Chi phí vận hành",
    },
    raw_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0, // Giá đã sơn hàng cần custom bao gồm hàng mộc + chi phí sơn hoàn thiện
    },
    final_price: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0, // Giá đã sơn (hoàn thiện) bao gồm hàng mộc chưa sơn và hàng sẵn
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Đang áp dụng, 0: Ngừng áp dụng
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
    tableName: "product_pricing",
    timestamps: false,
  }
);

module.exports = ProductPricing;
