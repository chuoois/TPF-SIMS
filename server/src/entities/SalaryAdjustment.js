const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model SalaryAdjustment
 * Các khoản thưởng / phụ cấp / phạt thủ công gắn vào 1 SalaryRecord.
 * BONUS / ALLOWANCE: amount > 0 (cộng vào lương)
 * PENALTY: amount < 0 (trừ vào lương)
 * Created By: hieunm
 * Created Date: 25/04/2026
 */
const SalaryAdjustment = sequelize.define(
  "SalaryAdjustment",
  {
    adjustment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("BONUS", "ALLOWANCE", "PENALTY"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false, // "Thưởng KPI tháng 5", "Phụ cấp xăng xe", "Phạt đi muộn"
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Dương = cộng (BONUS/ALLOWANCE), Âm = trừ (PENALTY)
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createby: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "salary_adjustment",
    timestamps: false,
  }
);

module.exports = SalaryAdjustment;
