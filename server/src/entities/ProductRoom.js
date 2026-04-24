const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductRoom
 * Bảng thông tin khu vực/phòng sử dụng sản phẩm
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
const ProductRoom = sequelize.define(
  "ProductRoom",
  {
    pk_product_room_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    room_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
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
    tableName: "product_room",
    timestamps: false,
  }
);

module.exports = ProductRoom;
