const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model Notification
 * Bảng lưu trữ thông báo hệ thống
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
const Notification = sequelize.define(
  "Notification",
  {
    pk_notification_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID người nhận, null nếu là thông báo hệ thống cho tất cả",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("INFO", "SUCCESS", "WARNING", "ERROR"),
      defaultValue: "INFO",
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Đường dẫn chuyển hướng khi click vào thông báo",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createby: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "notification",
    timestamps: false,
  }
);

module.exports = Notification;
