const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model UserRole
 * Bảng vai trò người dùng
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */
const UserRole = sequelize.define(
  "UserRole",
  {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
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
    tableName: "user_role",
    timestamps: false,
  }
);

module.exports = UserRole;
