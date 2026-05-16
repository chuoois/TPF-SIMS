const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model SalaryRecord
 * 1 bản ghi lương = 1 nhân viên trong 1 kỳ lương.
 * Unique constraint: (fk_period_id, fk_employee_id) – mỗi NV chỉ có 1 bản ghi/kỳ.
 * total_salary được tính tại runtime: base_rate_snapshot × days_worked + SUM(adjustments)
 * Created By: hieunm
 * Created Date: 25/04/2026
 */
const SalaryRecord = sequelize.define(
  "SalaryRecord",
  {
    record_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_period_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fk_employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Snapshot lương ngày lúc tạo kỳ – tránh ảnh hưởng khi base_rate nhân viên thay đổi
    base_rate_snapshot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    days_worked: {
      type: DataTypes.DECIMAL(4, 1),
      defaultValue: 0,
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(5, 1),
      defaultValue: 0,
    },
    // PENDING = chưa thanh toán, PAID = đã thanh toán
    status: {
      type: DataTypes.ENUM("PENDING", "PAID"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paid_by: {
      type: DataTypes.INTEGER,
      allowNull: true, // FK → user_account_id
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    modifiedate: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "salary_record",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["fk_period_id", "fk_employee_id"],
        name: "unique_record_per_period",
      },
    ],
  }
);

module.exports = SalaryRecord;
