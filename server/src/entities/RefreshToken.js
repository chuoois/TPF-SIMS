const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model RefreshToken
 * Bảng lưu trữ token làm mới
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */
const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    refresh_token_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "refresh_token",
    timestamps: false,
  }
);

module.exports = RefreshToken;
