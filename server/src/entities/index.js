const sequelize = require("../config/db");
const UserRole = require("./UserRole");
const UserAccount = require("./UserAccount");
const UserProfile = require("./UserProfile");
const RefreshToken = require("./RefreshToken");
const CustomerProfile = require("./CustomerProfile");

/**
 * Định nghĩa quan hệ giữa các bảng
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */

// UserRole 1:N UserAccount
UserRole.hasMany(UserAccount, { foreignKey: "role_id", as: "accounts" });
UserAccount.belongsTo(UserRole, { foreignKey: "role_id", as: "role" });

// UserAccount 1:1 UserProfile
UserAccount.hasOne(UserProfile, {
  foreignKey: "user_account_id",
  as: "profile",
  onDelete: "CASCADE",
});
UserProfile.belongsTo(UserAccount, {
  foreignKey: "user_account_id",
  as: "account",
});

// UserAccount 1:N RefreshToken
UserAccount.hasMany(RefreshToken, {
  foreignKey: "user_account_id",
  as: "refreshTokens",
  onDelete: "CASCADE",
});
RefreshToken.belongsTo(UserAccount, {
  foreignKey: "user_account_id",
  as: "account",
});

// UserAccount 1:1 CustomerProfile
UserAccount.hasOne(CustomerProfile, {
  foreignKey: "fk_user_account_id",
  as: "customer",
  onDelete: "CASCADE",
});
CustomerProfile.belongsTo(UserAccount, {
  foreignKey: "fk_user_account_id",
  as: "account",
});

module.exports = {
  sequelize,
  UserRole,
  UserAccount,
  UserProfile,
  RefreshToken,
  CustomerProfile,
};