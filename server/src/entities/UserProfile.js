const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model UserProfile
 * Bảng thông tin người dùng
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */
const UserProfile = sequelize.define(
  "UserProfile",
  {
    user_profile_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(150),
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.TINYINT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_profile",
    timestamps: false,
  }
);

module.exports = UserProfile;
