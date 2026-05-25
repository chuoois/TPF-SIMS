const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model CustomerProfile
 * Bảng thông tin khách hàng
 * Created By: ThinhBui
 * Created Date: 17/04/2026
 */
const CustomerProfile = sequelize.define(
  "CustomerProfile",
  {
    pk_customer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_code: {
      type: DataTypes.STRING(50),
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.STRING(255),
    },
    gender: {
      type: DataTypes.TINYINT,
    },
    dob: {
      type: DataTypes.DATEONLY,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    note: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1, // 1: Active, 0: Inactive
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
    tableName: "customer_profile",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["customer_code"],
        name: "unique_customer_code",
      },
    ],
    hooks: {
      beforeValidate: (customer) => {
        if (customer.email === "") {
          customer.email = null;
        }
        if (customer.dob === "") {
          customer.dob = null;
        }
      },
    },
  }
);

module.exports = CustomerProfile;
