const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model Employee
 * Bảng nhân viên xưởng (thợ sơn, thợ giấy ráp, bán hàng, kế toán...)
 * Tách biệt hoàn toàn với UserAccount – nhân viên không bắt buộc có tài khoản login.
 * Created By: hieunm
 * Created Date: 25/04/2026
 */
const Employee = sequelize.define(
  "Employee",
  {
    employee_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true, // "NV001", "KT001"
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false, // "Nhân viên bán hàng", "Thợ sơn"...
    },
    role_type: {
      type: DataTypes.ENUM("SALES", "ACCOUNTANT", "SANDER", "PAINTER"),
      allowNull: false,
    },
    base_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Đơn giá / ngày (VNĐ)
    },
    is_active: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Đang làm việc, 0: Đã nghỉ
    },
    // Liên kết tùy chọn – nếu nhân viên có tài khoản login
    user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "employee",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["employee_code"],
        name: "unique_employee_code",
      },
    ],
  }
);

module.exports = Employee;
