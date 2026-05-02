const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model Supplier - Nhà cung cấp
 * Created By: ThinhBui
 * Created Date: 30/04/2026
 */
const Supplier = sequelize.define(
    "Supplier",
    {
        pk_supplier_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        supplier_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        contact_person: {
            type: DataTypes.STRING(255),
        },
        phone_number: {
            type: DataTypes.STRING(20),
        },
        email: {
            type: DataTypes.STRING(255),
        },
        address: {
            type: DataTypes.STRING(255),
        },
        tax_code: {
            type: DataTypes.STRING(50),
        },
        note: {
            type: DataTypes.TEXT,
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
        },
        createdate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        modifiedate: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: "supplier",
        timestamps: false,
    }
);

module.exports = Supplier;