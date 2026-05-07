const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductTask
 * Bảng giao việc / gia công sản phẩm (dành cho thợ)
 * Created By: ThinhBui
 */
const ProductTask = sequelize.define(
  "ProductTask",
  {
    pk_task_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fk_user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID của tài khoản thợ được giao việc",
    },
    task_name: {
      type: DataTypes.STRING(255),
      comment: "Tên công đoạn (vd: Sơn, Chà nhám, Đóng gói)",
    },
    task_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Chờ xử lý, 2: Đang làm, 3: Hoàn thành, 0: Hủy
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
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
    tableName: "product_task",
    timestamps: false,
  }
);

module.exports = ProductTask;
