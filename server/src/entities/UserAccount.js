const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model UserAccount
 * Bảng tài khoản người dùng
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */
const UserAccount = sequelize.define(
  "UserAccount",
  {
    user_account_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Active, 0: Inactive
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_account",
    timestamps: false,
  }
);

module.exports = UserAccount;
