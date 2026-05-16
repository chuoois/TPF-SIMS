const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model OrderItemProcessing
 * Danh sách sản phẩm trong đơn hàng cần gia công
 * Created By: ThinhBui
 */
const OrderItemProcessing = sequelize.define(
  "OrderItemProcessing",
  {
    pk_processing_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Sản phẩm thuộc item nào trong đơn hàng
    fk_order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID sản phẩm trong đơn hàng",
    },

    // Thợ phụ trách gia công
    fk_user_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID tài khoản thợ gia công",
    },

    processing_status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment:
        "1: Chờ gia công, 2: Đang gia công, 3: Gửi Nghiệm Thu, 4: Hoàn Thành, 0: Hủy",
    },
    cancel_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ghi chú khi hủy",
    },

    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Số lượng cần gia công",
    },

    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Ngày bắt đầu gia công",
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Ngày hoàn thành",
    },

    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ghi chú gia công",
    },

    finished_img: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "JSON array chứa các URL ảnh hoàn thiện từ Cloudinary",
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
    tableName: "order_item_processing",
    timestamps: false,
  }
);

module.exports = OrderItemProcessing;