const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model SystemLog
 * Bảng lưu nhật ký hệ thống
 * Created By: ThinhBui
 * Created Date: 17/04/2026
 */
const SystemLog = sequelize.define(
  "SystemLog",
  {
    system_log_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING(50),
      defaultValue: "INFO",
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "system_log",
    timestamps: false,
  }
);

module.exports = SystemLog;
