const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Model ProductionTask
 * Bảng nhiệm vụ gia công cho thợ (Xưởng gỗ)
 * Theo dõi tiến độ từ mộc -> hoàn thiện (đánh giấy ráp, sơn, nghiệm thu)
 * 
 * Created By: ThinhBui
 * Created Date: 05/05/2026
 */
const ProductionTask = sequelize.define(
  "ProductionTask",
  {
    pk_production_task_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fk_order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID món hàng trong đơn hàng",
    },
    fk_worker_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID thợ được giao nhiệm vụ",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Chờ tiếp nhận",
      comment: "Trạng thái: Chờ tiếp nhận, Đang thực hiện, Đang đánh giấy ráp, Đang sơn, Chờ nghiệm thu, Hoàn thành, Cần làm lại",
    },
    is_pending_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Đang chờ chủ xưởng/KCS nghiệm thu",
    },
    note: {
      type: DataTypes.TEXT,
      comment: "Ghi chú/Yêu cầu đặc biệt",
    },
    finished_image: {
      type: DataTypes.TEXT,
      comment: "Ảnh kết quả sau khi gia công/sơn",
    },
    issue_report: {
      type: DataTypes.JSON,
      comment: "Báo cáo sự cố (nếu có): { reason, reported_at, detail }",
    },
    deadline: {
      type: DataTypes.DATE,
      comment: "Hạn chót hoàn thành nhiệm vụ",
    },
    start_date: {
      type: DataTypes.DATE,
    },
    completion_date: {
      type: DataTypes.DATE,
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
    tableName: "production_task",
    timestamps: false,
  }
);

module.exports = ProductionTask;
