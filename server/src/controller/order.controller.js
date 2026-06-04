const {
    sequelize, Order, OrderItem, OrderHistory, Product,
    ProductPricing, ProductItem, ProductMaterial, ProductColor,
    CustomerProfile, UserAccount, UserProfile, UserRole, OrderItemProcessing,
    CustomRequest, CustomRequestItem, ManufacturingOrder, ManufacturingOrderItem
} = require("../entities");
const systemLogController = require("./systemLog.controller");
const { sendNotification } = require("../sockets/socketManager");

/**
 * Order Controller - Chỉ bao gồm API Tạo đơn hàng (createOrder)
 * Tuân thủ logic:
 * 1. Chỉ lấy ProductItem ở trạng thái 1 (Sẵn sàng) và chưa gán đơn hàng (fk_order_item_id IS NULL).
 * 2. OrderItem kế thừa thông tin Material, Color, Size, Warranty từ Product master data.
 */
class OrderController {
    /**
     * Lấy danh sách đơn hàng cơ bản
     */
    async getAllOrders(req, res) {
        try {
            const { page = 1, limit = 10, search, order_status, order_type, dateFrom, dateTo } = req.query;
            const offset = (page - 1) * limit;

            const where = { status: 1 };

            if (order_status) {
                where.order_status = order_status;
            }

            if (order_type) {
                where.order_type = order_type;
            }

            if (dateFrom || dateTo) {
                const dateCond = {};
                if (dateFrom) dateCond[Op.gte] = `${dateFrom} 00:00:00`;
                if (dateTo) dateCond[Op.lte] = `${dateTo} 23:59:59`;
                where.createdate = dateCond;
            }

            if (search) {
                where[Op.or] = [
                    { order_code: { [Op.like]: `%${search}%` } },
                    { '$customer.full_name$': { [Op.like]: `%${search}%` } },
                    { '$customer.phone_number$': { [Op.like]: `%${search}%` } },
                    sequelize.literal(`EXISTS (
                        SELECT 1 
                        FROM order_item AS i
                        WHERE i.fk_order_id = Order.pk_order_id 
                          AND i.item_name LIKE ${sequelize.escape('%' + search + '%')}
                          AND i.status = 1
                    )`)
                ];

                if (!isNaN(search)) {
                    where[Op.or].push({ pk_order_id: search });
                }
            }

            const { count, rows } = await Order.findAndCountAll({
                where,
                include: [
                    {
                        model: CustomerProfile,
                        as: 'customer',
                        attributes: ['full_name', 'phone_number']
                    }
                ],
                attributes: [
                    'pk_order_id', 'createdate', 'expected_fulfillment_date', 'total_amount',
                    'deposit_amount', 'received_amount', 'delivery_image', 'order_status', 'order_type',
                    'deposit_resolution', 'cancel_reason', 'order_code',
                    [
                        sequelize.literal(`(
                            SELECT GROUP_CONCAT(i.item_name SEPARATOR ', ')
                            FROM order_item AS i
                            WHERE i.fk_order_id = Order.pk_order_id AND i.status = 1
                        )`),
                        'product_names'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM order_item_processing AS p
                            JOIN order_item AS i ON p.fk_order_item_id = i.pk_order_item_id
                            WHERE i.fk_order_id = Order.pk_order_id AND i.status = 1
                        )`),
                        'total_processing_count'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM order_item_processing AS p
                            JOIN order_item AS i ON p.fk_order_item_id = i.pk_order_item_id
                            WHERE i.fk_order_id = Order.pk_order_id AND i.status = 1 AND p.processing_status != 4
                        )`),
                        'pending_processing_count'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM order_item_processing AS p
                            JOIN order_item AS i ON p.fk_order_item_id = i.pk_order_item_id
                            WHERE i.fk_order_id = Order.pk_order_id AND i.status = 1 AND p.processing_status = 3
                        )`),
                        'inspection_count'
                    ]
                ],
                order: [['createdate', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                subQuery: false
            });

            // Lấy counts theo status (áp dụng các bộ lọc hiện tại trừ order_status)
            const countWhere = { ...where };
            delete countWhere.order_status;

            const countsQuery = await Order.count({
                where: countWhere,
                include: [
                    {
                        model: CustomerProfile,
                        as: 'customer',
                        attributes: []
                    }
                ],
                group: ['order_status']
            });

            const statusCounts = {};
            let totalStatusCount = 0;
            countsQuery.forEach(c => {
                const cCount = parseInt(c.count);
                statusCounts[c.order_status] = cCount;
                totalStatusCount += cCount;
            });
            statusCounts["all"] = totalStatusCount;

            return res.status(200).json({
                data: rows,
                statusCounts,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error("Get all orders error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách đơn hàng" });
        }
    }

    /**
     * Lấy chi tiết đơn hàng (List detail)
     */
    async getOrderById(req, res) {
        try {
            const { id } = req.params;

            const order = await Order.findByPk(id, {
                include: [
                    {
                        model: CustomerProfile,
                        as: 'customer',
                        attributes: ['full_name', 'phone_number', 'email', 'address']
                    },
                    {
                        model: OrderItem,
                        as: 'items',
                        where: { status: 1 },
                        required: false,
                        include: [
                            {
                                model: OrderItemProcessing,
                                as: 'processing',
                                required: false,
                                include: [
                                    {
                                        model: UserAccount,
                                        as: 'worker',
                                        attributes: ['user_account_id', 'email'],
                                        include: [
                                            {
                                                model: UserProfile,
                                                as: 'profile',
                                                attributes: ['full_name', 'phone_number']
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: CustomRequestItem,
                                as: 'customRequestItem',
                                required: false,
                                attributes: ['pk_custom_request_item_id', 'fk_custom_request_id'],
                                include: [
                                    {
                                        model: CustomRequest,
                                        as: 'request',
                                        required: false,
                                        attributes: ['pk_custom_request_id', 'request_code', 'status']
                                    },
                                    {
                                        model: ManufacturingOrderItem,
                                        as: 'manufacturingDetail',
                                        required: false,
                                        attributes: ['pk_manufacturing_order_item_id', 'fk_manufacturing_order_id'],
                                        include: [{
                                            model: ManufacturingOrder,
                                            as: 'order',
                                            required: false,
                                            attributes: ['pk_manufacturing_order_id', 'order_code', 'status', 'createdate']
                                        }]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: OrderHistory,
                        as: 'histories',
                        attributes: ['action', 'note', 'new_status', 'createdate'],
                        required: false
                    },
                    {
                        model: CustomRequest,
                        as: 'customRequest',
                        required: false,
                        attributes: ['pk_custom_request_id', 'request_code', 'status', 'createdate']
                    }
                ],
                attributes: [
                    'pk_order_id', 'order_status', 'order_type', 'createdate',
                    'expected_fulfillment_date', 'total_amount', 'deposit_amount', 'received_amount',
                    'address', 'note', 'fulfillment_method', 'delivery_image', 'deposit_resolution', 'cancel_reason', 'order_code'
                ],
                order: [
                    // Sắp xếp lịch sử từ mới nhất đến cũ nhất giống Shopee timeline
                    [{ model: OrderHistory, as: 'histories' }, 'createdate', 'DESC']
                ]
            });

            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

            return res.status(200).json({ data: order });
        } catch (error) {
            console.error("Get order by id error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết đơn hàng" });
        }
    }

    /**
     * API Tạo mới đơn hàng
     */
    async createOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const {
                fk_customer_id, fulfillment_method, expected_fulfillment_date,
                note, deposit_amount, received_amount, address, total_amount,
                delivery_image, order_status, order_type, items // items: [{ fk_product_id, item_quantity, ... }]
            } = req.body;

            const userId = req.user.userId;
            const currentStatus = order_status || 1; // Mặc định là Chờ xác nhận

            // 0. Kiểm tra và lấy thông tin khách hàng (để lấy địa chỉ mặc định)
            const customer = await CustomerProfile.findOne({
                where: { pk_customer_id: fk_customer_id, status: 1 },
                transaction: t
            });

            if (!customer) {
                throw new Error("Không tìm thấy khách hàng hoặc khách hàng đã bị xóa.");
            }

            const finalAddress = address || customer.address;

            // 1. Tạo bản ghi Order (Header)
            const newOrder = await Order.create({
                order_code: `DH-${Date.now()}`,
                fk_customer_id,
                fk_user_account_id: userId,
                fulfillment_method,
                expected_fulfillment_date,
                note,
                deposit_amount,
                received_amount,
                address: finalAddress,
                total_amount,
                delivery_image,
                order_status: currentStatus,
                order_type: order_type || 1, // 1: Mộc, 2: Sẵn
                status: 1,
                createby: userId,
            }, { transaction: t });

            // 2. Lấy thông tin Master Data của các sản phẩm để đối chiếu
            const productIds = items.map(i => i.fk_product_id).filter(id => id);
            const products = await Product.findAll({
                where: { pk_product_id: productIds, product_status: 1 },
                include: [
                    { model: ProductMaterial, as: "material", attributes: ["material_name"] },
                    { model: ProductColor, as: "color", attributes: ["color_name"] },
                    { model: ProductPricing, as: "pricings", where: { status: 1 }, required: false }
                ],
                transaction: t
            });

            if (items && items.length > 0) {
                for (const item of items) {
                    // Sửa lỗi so sánh === thành == để tránh lỗi kiểu dữ liệu (string vs number)
                    const product = products.find(p => p.pk_product_id == item.fk_product_id);
                    if (!product && item.fk_product_id) {
                        throw new Error(`Sản phẩm ID ${item.fk_product_id} không tồn tại hoặc đã ngừng kinh doanh.`);
                    }

                    const pricing = product?.pricings?.[0];

                    // Xác định trạng thái Sơn/Mộc dựa trên loại đơn hàng nếu item không truyền
                    let final_is_finished = item.is_finished;
                    if (final_is_finished === undefined || final_is_finished === null) {
                        final_is_finished = (order_type == 1) ? 0 : 1;
                    }

                    // Tự động lấy giá từ Pricing nếu request không gửi giá cụ thể
                    let autoPrice = item.item_price;
                    if (!autoPrice && pricing) {
                        autoPrice = final_is_finished ? pricing.final_price : pricing.raw_price;
                    }

                    // 3. Tạo OrderItem - Kế thừa (Clone) thông tin từ Product master data
                    const newOrderItem = await OrderItem.create({
                        fk_order_id: newOrder.pk_order_id,
                        fk_product_id: item.fk_product_id,
                        item_name: item.item_name || product?.product_name || "Sản phẩm không xác định",
                        item_img: item.item_img || product?.product_img,
                        item_quantity: item.item_quantity || 1,
                        item_price: autoPrice || 0,
                        item_material: item.item_material || product?.material?.material_name,
                        item_color: item.item_color || product?.color?.color_name,
                        item_size: item.item_size || product?.size,
                        item_warranty: item.item_warranty || product?.warranty_months,
                        item_note: item.item_note,
                        item_is_bundle: item.item_is_bundle ?? product?.is_bundle ?? 0,
                        item_bundle_items: item.item_bundle_items || product?.bundle_items || null,
                        item_is_gift: item.item_is_gift ?? product?.is_gift ?? 0,
                        is_finished: final_is_finished ? 1 : 0,
                        import_status: order_type == 2 ? 1 : 0,
                        customer_img: Array.isArray(item.customer_img) ? item.customer_img : [],
                        design_img: Array.isArray(item.design_img) ? item.design_img : [],
                        createby: userId,
                    }, { transaction: t });

                    // 4. GIỮ CHỖ (ALLOCATION) - Chỉ lấy ProductItem "Sẵn sàng" và "Chưa có chủ"
                    // Áp dụng cho: Đơn mộc (1), Đơn sẵn (2)
                    if ([1, 2].includes(Number(order_type)) && item.fk_product_id) {
                        const quantityNeeded = item.item_quantity || 1;

                        const availableItems = await ProductItem.findAll({
                            where: {
                                fk_product_id: item.fk_product_id,
                                item_status: 1, // 1: Sẵn sàng
                                fk_order_item_id: null // Quan trọng: Chưa gán cho đơn hàng nào
                            },
                            order: [["createdate", "ASC"]], // FIFO: Ưu tiên hàng nhập kho cũ nhất
                            limit: quantityNeeded,
                            transaction: t
                        });

                        if (availableItems.length < quantityNeeded) {
                            throw new Error(`Sản phẩm ${product?.product_name} không đủ số lượng sẵn sàng trong kho. (Cần ${quantityNeeded}, hiện có ${availableItems.length})`);
                        }

                        // Cập nhật trạng thái từng món hàng chi tiết sang "Chờ giao" và gán vào OrderItem
                        for (const productItem of availableItems) {
                            await productItem.update({
                                item_status: 2, // 2: Chờ giao
                                fk_order_item_id: newOrderItem.pk_order_item_id,
                                modifieby: userId,
                                modifiedate: new Date(),
                            }, { transaction: t });
                        }
                    }
                }
            }

            // 5. Ghi lịch sử đơn hàng
            await OrderHistory.create({
                fk_order_id: newOrder.pk_order_id,
                action: "Tạo đơn hàng",
                new_status: currentStatus,
                changed_by: userId,
                note: note || "Đơn hàng đã được tiếp nhận và chờ xử lý",
                createby: userId,
            }, { transaction: t });

            await t.commit();

            // Ghi log hệ thống
            await systemLogController.record(req, "Tạo đơn hàng", `Tạo đơn hàng #${newOrder.pk_order_id} thành công`, "INFO", userId);

            // 6. Gửi thông báo real-time
            await sendNotification({
                userId: userId, // Thông báo cho người tạo
                title: "Tạo đơn hàng thành công",
                message: `Đơn hàng #${newOrder.pk_order_id} của khách ${customer.full_name} đã được tạo.`,
                type: "SUCCESS",
                link: `/orders/${newOrder.pk_order_id}`,
                createBy: userId
            });

            // Gửi cho chủ cửa hàng (Admin/Owner)
            const admins = await UserAccount.findAll({
                include: [{
                    model: UserRole,
                    as: "role",
                    where: {
                        role_code: { [Op.in]: ["ADMIN", "OWNER"] }
                    }
                }],
                where: { status: 1 }
            });

            for (const admin of admins) {
                // Không gửi thêm nếu admin chính là người tạo (đã nhận thông báo SUCCESS ở trên)
                if (String(admin.user_account_id) !== String(userId)) {
                    await sendNotification({
                        userId: admin.user_account_id,
                        title: "Thông báo đơn hàng mới",
                        message: `Sales ${req.user.email} vừa tạo đơn hàng #${newOrder.pk_order_id} cho khách ${customer.full_name}.`,
                        type: "INFO",
                        link: `/orders/${newOrder.pk_order_id}`,
                        createBy: userId
                    });
                }
            }

            return res.status(201).json({
                message: "Tạo đơn hàng thành công",
                order: newOrder
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Create order error:", error);
            return res.status(400).json({ message: error.message || "Lỗi hệ thống khi tạo đơn hàng" });
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    async updateOrderStatus(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                order_status, note, deposit_amount, received_amount,
                delivery_image, handover_items, deposit_resolution, cancel_reason
            } = req.body;
            const userId = req.user.userId;

            const order = await Order.findByPk(id);
            if (!order) {
                throw new Error("Không tìm thấy đơn hàng");
            }

            const oldStatus = order.order_status;

            // Nếu Sales yêu cầu hủy (chuyển sang Chờ duyệt hủy - 7), bắt buộc phải có lý do
            if (Number(order_status) === 7 && req.user.roleCode === 'SALES' && !cancel_reason) {
                throw new Error("Vui lòng nhập lý do hủy đơn hàng.");
            }

            // Cập nhật thông tin cơ bản
            const updateData = {
                modifiedate: new Date(),
                modifieby: userId
            };

            if (order_status !== undefined) {
                updateData.order_status = order_status;
            }

            if (deposit_amount !== undefined) {
                updateData.deposit_amount = deposit_amount;
            }

            if (delivery_image !== undefined) {
                updateData.delivery_image = delivery_image;
            }

            if (received_amount !== undefined) {
                updateData.received_amount = received_amount;
            } else if (Number(order_status) === 6) {
                // Nếu hoàn thành đơn (status = 6) mà không truyền số tiền, tự động thu đủ tiền
                updateData.received_amount = Number(order.total_amount) - Number(order.deposit_amount);
            }

            if (deposit_resolution !== undefined) {
                updateData.deposit_resolution = deposit_resolution;
            }

            if (cancel_reason !== undefined) {
                updateData.cancel_reason = cancel_reason;
            }

            await order.update(updateData, { transaction: t });

            // Logic BÀN GIAO GIA CÔNG (Status 3: Đang gia công)
            if (order_status == 3 || handover_items) {
                const items = await OrderItem.findAll({ where: { fk_order_id: id }, transaction: t });

                for (const item of items) {
                    // Tìm thông tin bàn giao tương ứng cho item này (nếu có)
                    const handoverData = (handover_items || []).find(h => h.pk_order_item_id === item.pk_order_item_id);

                    // Kiểm tra xem đã có bản ghi gia công chưa
                    let processingRecord = await OrderItemProcessing.findOne({
                        where: { fk_order_item_id: item.pk_order_item_id },
                        transaction: t
                    });

                    if (!processingRecord) {
                        processingRecord = await OrderItemProcessing.create({
                            fk_order_item_id: item.pk_order_item_id,
                            processing_status: 1, // Chờ gia công
                            quantity: item.item_quantity,
                            start_date: new Date(), // Mặc định ngày bắt đầu là hôm nay khi bàn giao
                            createby: userId,
                            createdate: new Date()
                        }, { transaction: t });
                    }

                    // Nếu có thông tin bàn giao/cập nhật thì xử lý
                    if (handoverData) {
                        const pData = {
                            fk_user_account_id: handoverData.fk_user_account_id || processingRecord.fk_user_account_id,
                            start_date: handoverData.start_date || processingRecord.start_date || new Date(),
                            end_date: handoverData.end_date || processingRecord.end_date,
                            note: handoverData.note || processingRecord.note,
                            cancel_note: handoverData.cancel_note || processingRecord.cancel_note,
                            modifiedate: new Date(),
                            modifieby: userId
                        };

                        // Ưu tiên trạng thái gửi lên từ frontend, nếu không có thì tự động tính toán
                        if (handoverData.processing_status !== undefined) {
                            pData.processing_status = handoverData.processing_status;
                        } else if (Number(order_status) === 6) {
                            pData.processing_status = 4; // Hoàn thành
                        } else if (Number(order_status) === 0) {
                            pData.processing_status = 0; // Hủy
                        } else if (handoverData.fk_user_account_id) {
                            pData.processing_status = 2; // Đang gia công
                        }

                        await processingRecord.update(pData, { transaction: t });
                    } else if (Number(order_status) === 6 || Number(order_status) === 0) {
                        // Tự động cập nhật tất cả items nếu đơn hàng tổng chuyển sang Hoàn thành/Hủy
                        await processingRecord.update({
                            processing_status: Number(order_status) === 6 ? 4 : 0,
                            modifiedate: new Date(),
                            modifieby: userId
                        }, { transaction: t });
                    }
                }
            }

            // Nếu hủy đơn (status = 0) và trước đó chưa hủy, nhả hàng trong kho
            if (order_status == 0 && oldStatus != 0) {
                const orderItems = await OrderItem.findAll({ where: { fk_order_id: id }, transaction: t });
                if (orderItems.length > 0) {
                    const orderItemIds = orderItems.map(i => i.pk_order_item_id);
                    await ProductItem.update({
                        item_status: 1, // Trả lại trạng thái Sẵn sàng
                        fk_order_item_id: null,
                        modifieby: userId,
                        modifiedate: new Date()
                    }, {
                        where: { fk_order_item_id: { [Op.in]: orderItemIds } },
                        transaction: t
                    });
                }
            }

            // Mapping mô tả trạng thái kiểu Shopee
            const statusDescriptions = {
                0: "Đơn hàng đã được hủy thành công.",
                1: "Người bán đang chuẩn bị hàng.",
                2: "Sản phẩm đã được kiểm tra và chờ xử lý.",
                3: "Đơn hàng đã được bàn giao cho xưởng gia công sản xuất.",
                4: "Xưởng đã hoàn thiện sản phẩm. Đơn hàng đã sẵn sàng để giao.",
                5: "Đơn hàng đang được vận chuyển đến bạn.",
                6: "Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua hàng!",
                7: "Yêu cầu hủy đơn hàng đang được xem xét."
            };

            const statusText = statusDescriptions[order_status] || "Thông tin đơn hàng đã được cập nhật.";
            const actionTitle = "Cập nhật đơn hàng";

            // Ghi lịch sử đơn hàng
            // Nếu là bàn giao xưởng (status 3), ưu tiên dùng statusText cho lịch sử (vì note thường là dặn thợ)
            const historyNote = (Number(order_status) === 3) ? statusText : (note || statusText);

            await OrderHistory.create({
                fk_order_id: id,
                action: actionTitle,
                new_status: order_status !== undefined ? order_status : oldStatus,
                changed_by: userId,
                note: historyNote,
                createby: userId,
            }, { transaction: t });

            // Auto-cleanup: Xóa sản phẩm CUSTOM khi đơn hàng khách đặt hoàn thành
            if (Number(order_status) === 6 && Number(order.order_type) === 3) {
                const orderItems = await OrderItem.findAll({
                    where: { fk_order_id: id, status: 1 },
                    attributes: ['pk_order_item_id', 'fk_product_id'],
                    transaction: t
                });

                const customProductIds = [...new Set(
                    orderItems.map(i => i.fk_product_id).filter(Boolean)
                )];

                for (const productId of customProductIds) {
                    const product = await Product.findByPk(productId, { transaction: t });
                    if (!product || product.product_type !== 'CUSTOM') continue;

                    // 1. Xóa ProductPricing
                    await ProductPricing.destroy({
                        where: { fk_product_id: productId },
                        transaction: t
                    });

                    // 2. Xóa ProductItem
                    await ProductItem.destroy({
                        where: { fk_product_id: productId },
                        transaction: t
                    });

                    // 3. Xóa liên kết CouponProduct (nếu có)
                    const { CouponProduct } = require("../entities");
                    await CouponProduct.destroy({
                        where: { fk_product_id: productId },
                        transaction: t
                    });

                    // 4. Gỡ FK ở OrderItem (giữ lịch sử đơn hàng)
                    await OrderItem.update(
                        { fk_product_id: null },
                        { where: { fk_product_id: productId }, transaction: t }
                    );

                    // 5. Gỡ FK ở ManufacturingOrderItem (giữ lịch sử nhập hàng)
                    const { ManufacturingOrderItem: MOI } = require("../entities");
                    await MOI.update(
                        { fk_product_id: null },
                        { where: { fk_product_id: productId }, transaction: t }
                    );

                    // 6. Xóa sản phẩm
                    await product.destroy({ transaction: t });
                }

                console.log(`[Auto-cleanup] Đơn #${id} hoàn thành → Đã xóa ${customProductIds.length} sản phẩm CUSTOM.`);
            }

            await t.commit();

            // Ghi log hệ thống
            await systemLogController.record(req, "Cập nhật đơn hàng", `Cập nhật đơn hàng #${id}: ${statusText}`, "INFO", userId);

            // Thông báo cho người tạo đơn
            await sendNotification({
                userId: order.createby || userId,
                title: "Cập nhật đơn hàng",
                message: `Đơn hàng DH-${id}: ${statusText}`,
                type: "INFO",
                link: `/orders/${id}`,
                createBy: userId
            });

            //  Thông báo cho TẤT CẢ THỢ khi đơn hàng chuyển sang "Đang gia công" (status 3)
            if (Number(order_status) === 3 && Number(oldStatus) !== 3) {
                // Lấy thông tin đơn hàng kèm sản phẩm
                const orderWithItems = await Order.findByPk(id, {
                    include: [
                        { model: CustomerProfile, as: 'customer', attributes: ['full_name'] },
                        { model: OrderItem, as: 'items', attributes: ['item_name'] }
                    ]
                });
                const itemNames = orderWithItems?.items?.map(i => i.item_name).join(', ') || 'Sản phẩm';
                const customerName = orderWithItems?.customer?.full_name || 'Khách hàng';

                // Tìm tất cả tài khoản có role WORKER
                const workers = await UserAccount.findAll({
                    include: [{
                        model: UserRole,
                        as: "role",
                        where: { role_code: "WORKER" }
                    }],
                    where: { status: 1 }
                });

                for (const worker of workers) {
                    await sendNotification({
                        userId: worker.user_account_id,
                        title: "Có công việc mới cần gia công",
                        message: `Đơn hàng #${id} của khách ${customerName} có sản phẩm (${itemNames}) cần gia công.`,
                        type: "SUCCESS",
                        link: `/worker/dashboard`,
                        createBy: userId
                    });
                }
            }

            return res.status(200).json({
                message: "Cập nhật trạng thái thành công",
                order
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Update order status error:", error);
            return res.status(400).json({ message: error.message || "Lỗi hệ thống khi cập nhật trạng thái đơn hàng" });
        }
    }
}

module.exports = new OrderController();
