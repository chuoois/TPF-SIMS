const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ImportReceipt - Phiếu Nhập Kho
 * Lưu thông tin tổng quát của mỗi lần nhập hàng vào kho
 * Created By: HieuNM
 * Created Date: 15/05/2026
 */
const ImportReceipt = sequelize.define(
  "ImportReceipt",
  {
    pk_receipt_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    receipt_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Mã phiếu nhập: NK-YYYYMMDD-XXX",
    },
    import_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Ngày nhập hàng",
    },
    supplier_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Tên xưởng / nhà cung cấp (text tự do)",
    },
    fk_manufacturing_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Liên kết với lệnh sản xuất gốc (nếu có)",
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      comment: "Tổng giá trị phiếu nhập",
    },
    total_qty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Tổng số lượng đơn vị nhập",
    },
    invoice_img: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "URL ảnh chứng từ / hóa đơn (Cloudinary URL)",
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ghi chú phiếu nhập",
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
    tableName: "import_receipt",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["receipt_code"],
        name: "unique_receipt_code",
      },
    ],
  }
);

module.exports = ImportReceipt;
