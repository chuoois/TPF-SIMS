const { Op } = require("sequelize");
const {
  sequelize,
  Order,
  OrderItem,
  OrderItemProcessing,
  CustomerProfile,
  Product,
  UserAccount,
  UserRole
} = require("../entities");
const { sendNotification } = require("../sockets/socketManager");

/**
 * Worker Controller - Quản lý các công việc của thợ gia công
 */
class WorkerController {
  /**
   * Lấy danh sách các đơn hàng đang chờ hoặc đang gia công (dành cho Worker Dashboard)
   */
  async getPendingTasks(req, res) {
    try {
      // Find all orders that have processing tasks
      const orders = await Order.findAll({
        where: {
          status: 1, // Active order
          order_status: 3, // 3: Đang gia công (Processing)
          order_type: {
            [Op.in]: [1, 3] // 1: Đơn hàng mộc (RAW), 3: Đơn hàng custom (CUSTOM)
          }
        },
        include: [
          {
            model: CustomerProfile,
            as: 'customer',
            attributes: ['full_name']
          },
          {
            model: OrderItem,
            as: 'items',
            required: true,
            where: { status: 1 },
            include: [
              {
                model: OrderItemProcessing,
                as: 'processing',
                required: true,
                where: {
                  processing_status: {
                    [Op.in]: [1, 2, 3] // Chỉ hiện Chờ, Đang, Nghiệm thu tại Dashboard
                  }
                }
              }
            ]
          }
        ],
        order: [['createdate', 'DESC']]
      });

      // Format response to match UI mock data structure
      const formattedOrders = orders.map(order => {
        // Evaluate order status from processing items
        let orderStatus = "Chờ gia công";
        const hasOwnerPending = order.items.some(item => 
          item.processing && item.processing.some(p => p.processing_status === 3)
        );
        const hasProcessing = order.items.some(item => 
          item.processing && item.processing.some(p => p.processing_status === 2)
        );
        const allCompleted = order.items.every(item => 
          item.processing && item.processing.every(p => p.processing_status === 4)
        );
        const allCancelled = order.items.every(item => 
          item.processing && item.processing.every(p => p.processing_status === 0)
        );

        if (hasProcessing) orderStatus = "Đang gia công";
        if (hasOwnerPending) orderStatus = "Gửi Nghiệm Thu";
        if (allCompleted) orderStatus = "Hoàn Thành";
        if (allCancelled) orderStatus = "Hủy";
        
        // order_type = 1 (Hàng Mộc), order_type = 2 (Hàng Sẵn), order_type = 3 (Hàng Custom)
        const isCustomOrder = order.order_type === 3;

        const orderDate = new Date(order.createdate).toLocaleDateString('vi-VN');

        return {
          id: `DH-${order.pk_order_id}`,
          customerName: order.customer ? order.customer.full_name : "Khách vãng lai",
          orderDate: orderDate,
          status: orderStatus,
          isCustomOrder: isCustomOrder,
          items: order.items.map(item => {
            const proc = item.processing[0]; // Lấy bản ghi processing đầu tiên
            
            // Format dimensions - handle both object and string
            let sizeStr = item.item_size;
            try {
              let sizeObj = sizeStr;
              if (typeof sizeStr === 'string' && sizeStr.startsWith('{')) {
                sizeObj = JSON.parse(sizeStr);
              }
              if (sizeObj && typeof sizeObj === 'object') {
                sizeStr = [sizeObj.length, sizeObj.width, sizeObj.height].filter(Boolean).join("x");
                if (sizeObj.unit) sizeStr += ` ${sizeObj.unit}`;
                else sizeStr += " cm";
              }
            } catch (e) {}

            // Format note - handle both object and string
            let noteStr = proc.note || item.item_note;
            try {
              if (noteStr && typeof noteStr === 'object') {
                noteStr = noteStr.note || JSON.stringify(noteStr);
              }
            } catch (e) {}

            let itemStatus = "Chờ gia công";
            if (proc.processing_status === 2) itemStatus = "Đang gia công";
            if (proc.processing_status === 3) itemStatus = "Gửi Nghiệm Thu";
            if (proc.processing_status === 4) itemStatus = "Hoàn Thành";

            return {
              id: `SP-${item.pk_order_item_id}`,
              productName: item.item_name,
              size: (typeof sizeStr === 'string' ? sizeStr : "Chưa rõ") || "Chưa rõ",
              type: item.item_material || "Chưa rõ",
              color: item.item_color || "Chưa rõ",
              quantity: proc.quantity,
              startedAt: proc.start_date ? new Date(proc.start_date).toLocaleDateString('vi-VN') : null,
              deadline: order.expected_fulfillment_date ? new Date(order.expected_fulfillment_date).toLocaleDateString('vi-VN') : null,
              note: (typeof noteStr === 'string' ? noteStr : null),
              picture: item.item_img || "https://placehold.co/400x400?text=No+Image",
              finishedImages: (() => {
                try {
                  const parsed = JSON.parse(proc.finished_img);
                  return Array.isArray(parsed) ? parsed : proc.finished_img ? [proc.finished_img] : [];
                } catch {
                  return proc.finished_img ? [proc.finished_img] : [];
                }
              })(),
              status: itemStatus
            };
          })
        };
      });

      return res.status(200).json({ data: formattedOrders });

    } catch (error) {
      console.error("Get pending tasks error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách công việc" });
    }
  }

  /**
   * Lấy danh sách các đơn hàng ĐÃ HOÀN THÀNH (processing_status = 3)
   */
  async getCompletedTasks(req, res) {
    try {
      // Find all orders that might have completed tasks
      const orders = await Order.findAll({
        where: {
          status: 1, // Active order
          order_type: {
            [Op.in]: [1, 3] // 1: Đơn hàng mộc (RAW), 3: Đơn hàng custom (CUSTOM)
          }
        },
        include: [
          {
            model: CustomerProfile,
            as: "customer",
            attributes: ["full_name"]
          },
          {
            model: OrderItem,
            as: "items",
            required: true,
            where: { status: 1 },
            include: [
              {
                model: OrderItemProcessing,
                as: "processing",
                required: false // Lấy tất cả processing để check
              }
            ]
          }
        ],
        order: [['createdate', 'DESC']]
      });

      // Filter: Chỉ giữ lại Order nếu TẤT CẢ các items đều có processing_status = 3
      const fullyCompletedOrders = orders.filter(order => {
        if (!order.items || order.items.length === 0) return false;
        
        // Kiểm tra xem tất cả các item có ít nhất 1 processing = 4 (Hoàn thành) không
        const allItemsCompleted = order.items.every(item => 
          item.processing && item.processing.some(p => p.processing_status === 4)
        );
        return allItemsCompleted;
      });

      // Format data giống như getPendingTasks
      const formattedOrders = fullyCompletedOrders.map(order => {
        let orderStatus = "Hoàn Thành";
        
        const isCustomOrder = order.order_type === 3;
        const orderDate = new Date(order.createdate).toLocaleDateString('vi-VN');

        return {
          id: `ORD-${order.pk_order_id}`,
          customerName: order.customer ? order.customer.full_name : "Khách vãng lai",
          orderDate: orderDate,
          status: orderStatus,
          isCustomOrder: isCustomOrder,
          items: order.items.map(item => {
            const proc = item.processing[0]; // Lấy bản ghi processing đầu tiên
            let sizeStr = item.item_size;
            try {
              if (sizeStr && typeof sizeStr === 'object') {
                if (sizeStr.width && sizeStr.length) sizeStr = `${sizeStr.length}x${sizeStr.width} cm`;
                else sizeStr = JSON.stringify(sizeStr);
              } else if (sizeStr && typeof sizeStr === 'string' && sizeStr.includes('{')) {
                const parsed = JSON.parse(sizeStr);
                if (parsed.width && parsed.length) sizeStr = `${parsed.length}x${parsed.width} cm`;
                else sizeStr += " cm";
              }
            } catch (e) {}

            let noteStr = proc.note || item.item_note;
            try {
              if (noteStr && typeof noteStr === 'object') {
                noteStr = noteStr.note || JSON.stringify(noteStr);
              }
            } catch (e) {}

            return {
              id: `SP-${item.pk_order_item_id}`,
              productName: item.item_name,
              size: (typeof sizeStr === 'string' ? sizeStr : "Chưa rõ") || "Chưa rõ",
              type: item.item_material || "Chưa rõ",
              color: item.item_color || "Chưa rõ",
              quantity: proc.quantity,
              startedAt: proc.start_date ? new Date(proc.start_date).toLocaleDateString('vi-VN') : null,
              deadline: order.expected_fulfillment_date ? new Date(order.expected_fulfillment_date).toLocaleDateString('vi-VN') : null,
              note: (typeof noteStr === 'string' ? noteStr : null),
              picture: item.item_img || "https://placehold.co/400x400?text=No+Image",
              finishedImage: proc.finished_img || null,
              status: "Hoàn Thành"
            };
          })
        };
      });

      return res.status(200).json({ data: formattedOrders });

    } catch (error) {
      console.error("Get completed tasks error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách đã hoàn thành" });
    }
  }

  /**
   * Bắt đầu gia công: chuyển trạng thái 1 (Chờ gia công) → 2 (Đang gia công)
   * POST /api/worker/tasks/start/:id
   * :id = pk_order_item_id (phần số sau "SP-")
   */
  async startTask(req, res) {
    const t = await sequelize.transaction();
    try {
      const orderItemId = req.params.id;
      const workerId = req.user?.userId || null;

      // Tìm bản ghi processing đang ở trạng thái "Chờ gia công"
      const proc = await OrderItemProcessing.findOne({
        where: {
          fk_order_item_id: orderItemId,
          processing_status: 1 // Chờ gia công
        },
        transaction: t
      });

      if (!proc) {
        await t.rollback();
        return res.status(404).json({ message: "Không tìm thấy công việc đang chờ gia công" });
      }

      // Cập nhật trạng thái → Đang gia công
      await proc.update({
        processing_status: 2,
        start_date: new Date(),
        fk_user_account_id: workerId,
        modifiedate: new Date(),
        modifieby: workerId
      }, { transaction: t });

      await t.commit();

      return res.status(200).json({
        message: "Đã bắt đầu gia công",
        data: {
          processingId: proc.pk_processing_id,
          status: 2,
          startDate: proc.start_date
        }
      });

    } catch (error) {
      await t.rollback();
      console.error("Start task error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi bắt đầu gia công" });
    }
  }

  /**
   * Hoàn thành gia công: chuyển trạng thái 2 (Đang gia công) → 3 (Hoàn thành)
   * POST /api/worker/tasks/complete/:id
   * :id = pk_order_item_id (phần số sau "SP-")
   */
  async completeTask(req, res) {
    const t = await sequelize.transaction();
    try {
      const orderItemId = req.params.id;
      const workerId = req.user?.userId || null;
      const { finishedImages } = req.body; // Mảng URL ảnh hoàn thiện

      // Tìm bản ghi processing đang ở trạng thái "Đang gia công" hoặc "Chờ chủ duyệt" (gửi lại ảnh)
      const proc = await OrderItemProcessing.findOne({
        where: {
          fk_order_item_id: orderItemId,
          processing_status: {
            [Op.in]: [2, 3] // 2: Đang gia công, 3: Gửi Nghiệm Thu (cho phép gửi lại)
          }
        },
        transaction: t
      });

      if (!proc) {
        await t.rollback();
        return res.status(404).json({ message: "Không tìm thấy công việc đang gia công" });
      }

      // Lưu ảnh dưới dạng JSON array
      const imgData = Array.isArray(finishedImages) ? JSON.stringify(finishedImages) : null;

      // Cập nhật trạng thái -> Gửi Nghiệm Thu (3)
      await proc.update({
        processing_status: 3, 
        end_date: new Date(),
        finished_img: imgData, 
        modifiedate: new Date(),
        modifieby: workerId
      }, { transaction: t });

      await t.commit();

      return res.status(200).json({
        message: "Đã gửi ảnh, chờ duyệt của chủ",
        data: {
          processingId: proc.pk_processing_id,
          status: 3,
          endDate: proc.end_date
        }
      });

    } catch (error) {
      await t.rollback();
      console.error("Complete task error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi hoàn thành gia công" });
    }
  }

  /**
   * 🟢 Chủ xưởng DUYỆT sản phẩm: chuyển trạng thái 4 (Chờ duyệt) → 3 (Hoàn thành)
   * POST /api/worker/tasks/approve/:id
   * :id = pk_order_item_id
   */
  async approveTask(req, res) {
    const t = await sequelize.transaction();
    try {
      const orderItemId = req.params.id;
      const ownerId = req.user?.userId || null;

      // Tìm bản ghi processing đang chờ duyệt
      const proc = await OrderItemProcessing.findOne({
        where: {
          fk_order_item_id: orderItemId,
          processing_status: 3 // Gửi Nghiệm Thu
        },
        transaction: t
      });

      if (!proc) {
        await t.rollback();
        return res.status(404).json({ message: "Không tìm thấy sản phẩm đang chờ duyệt" });
      }

      // Cập nhật trạng thái → Hoàn thành (4)
      await proc.update({
        processing_status: 4, // 4: Hoàn thành
        modifiedate: new Date(),
        modifieby: ownerId
      }, { transaction: t });

      // Lấy thông tin sản phẩm để gửi thông báo
      const orderItem = await OrderItem.findByPk(orderItemId, {
        include: [{ model: Order, as: 'order' }],
        transaction: t
      });

      await t.commit();

      // 🟢 Gửi thông báo cho Thợ: "Chủ xưởng đã duyệt"
      const workerId = proc.fk_user_account_id;
      if (workerId) {
        await sendNotification({
          userId: workerId,
          title: "Chủ xưởng đã duyệt sản phẩm",
          message: `Sản phẩm ${orderItem?.item_name || ''} (Đơn #${orderItem?.fk_order_id}) đã được chủ xưởng duyệt thành công.`,
          type: "SUCCESS",
          link: `/worker/dashboard`,
          createBy: ownerId
        });
      }

      return res.status(200).json({
        message: "Đã duyệt sản phẩm thành công",
        data: {
          processingId: proc.pk_processing_id,
          status: 4
        }
      });

    } catch (error) {
      if (t && !t.finished) await t.rollback();
      console.error("Approve task error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi duyệt sản phẩm" });
    }
  }

  /**
   * 🔴 Chủ xưởng TỪ CHỐI (yêu cầu làm lại): chuyển trạng thái 4 (Chờ duyệt) → 2 (Đang gia công)
   * POST /api/worker/tasks/reject/:id
   * :id = pk_order_item_id
   * Body: { reason: "Lý do từ chối" }
   */
  async rejectTask(req, res) {
    const t = await sequelize.transaction();
    try {
      const orderItemId = req.params.id;
      const ownerId = req.user?.userId || null;
      const { reason } = req.body;

      // Tìm bản ghi processing đang chờ duyệt
      const proc = await OrderItemProcessing.findOne({
        where: {
          fk_order_item_id: orderItemId,
          processing_status: 3 // Gửi Nghiệm Thu
        },
        transaction: t
      });

      if (!proc) {
        await t.rollback();
        return res.status(404).json({ message: "Không tìm thấy sản phẩm đang chờ duyệt" });
      }

      // Cập nhật trạng thái → Đang gia công (yêu cầu làm lại)
      await proc.update({
        processing_status: 2, // 2: Đang gia công (làm lại)
        finished_img: null,   // Xóa ảnh cũ
        end_date: null,       // Reset ngày hoàn thành
        note: reason || null, // Lưu lý do từ chối
        modifiedate: new Date(),
        modifieby: ownerId
      }, { transaction: t });

      // Lấy thông tin sản phẩm để gửi thông báo
      const orderItem = await OrderItem.findByPk(orderItemId, {
        include: [{ model: Order, as: 'order' }],
        transaction: t
      });

      await t.commit();

      // 🔴 Gửi thông báo cho Thợ: "Chủ xưởng yêu cầu làm lại"
      const workerId = proc.fk_user_account_id;
      if (workerId) {
        const reasonText = reason ? ` Lý do: ${reason}` : '';
        await sendNotification({
          userId: workerId,
          title: "Chủ xưởng yêu cầu làm lại",
          message: `Sản phẩm ${orderItem?.item_name || ''} (Đơn #${orderItem?.fk_order_id}) đã bị từ chối.${reasonText} Vui lòng xử lý lại!`,
          type: "WARNING",
          link: `/worker/dashboard`,
          createBy: ownerId
        });
      }

      return res.status(200).json({
        message: "Đã từ chối và yêu cầu thợ làm lại",
        data: {
          processingId: proc.pk_processing_id,
          status: 2
        }
      });

    } catch (error) {
      if (t && !t.finished) await t.rollback();
      console.error("Reject task error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi từ chối sản phẩm" });
    }
  }
}

module.exports = new WorkerController();
