const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model PayrollPeriod
 * Mỗi kỳ lương = 1 tháng. Là "folder" chứa toàn bộ bảng lương tháng đó.
 * status DRAFT = đang soạn thảo, có thể sửa
 * status LOCKED = đã chốt, KHÔNG CHO SỬA bất kỳ dữ liệu nào trong kỳ này
 * Created By: hieunm
 * Created Date: 25/04/2026
 */
const PayrollPeriod = sequelize.define(
  "PayrollPeriod",
  {
    period_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Format: "05/2026" – khớp với frontend
    period_month: {
      type: DataTypes.STRING(7),
      allowNull: false,
      unique: true, // Mỗi tháng chỉ có 1 kỳ lương
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "LOCKED"),
      defaultValue: "DRAFT",
      allowNull: false,
    },
    locked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    locked_by: {
      type: DataTypes.INTEGER,
      allowNull: true, // FK → user_account_id (người chốt)
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createby: {
      type: DataTypes.INTEGER,
    },
    modifiedate: {
      type: DataTypes.DATE,
    },
    modifieby: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "payroll_period",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["period_month"],
        name: "unique_period_month",
      },
    ],
  }
);

module.exports = PayrollPeriod;
