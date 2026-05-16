const { Op } = require("sequelize");
const {
    sequelize, ProductCoupon, CouponProduct, Product, ProductPricing
} = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * CouponController
 * Quản lý mã giảm giá (CRUD) - Áp dụng giảm giá trực tiếp lên sản phẩm
 * Created By: ThinhBui
 * Created Date: 07/05/2026
 */
class CouponController {
    /**
     * Lấy danh sách mã giảm giá (có search + phân trang)
     * GET /api/coupon?search=...&page=1&limit=15
     */
    async getAllCoupons(req, res) {
        try {
            const { search, page, limit } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 15;
            const offset = (pageNum - 1) * limitNum;

            const whereClause = { status: { [Op.ne]: -1 } }; // Không lấy đã xoá cứng

            if (search && search.trim()) {
                const s = search.trim();
                whereClause[Op.or] = [
                    { coupon_code: { [Op.like]: `%${s}%` } },
                    { coupon_name: { [Op.like]: `%${s}%` } },
                ];
            }

            const { count, rows } = await ProductCoupon.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Product,
                        as: "products",
                        attributes: ["pk_product_id", "product_name", "sku", "product_img"],
                        through: { attributes: [] }, // Không lấy field trung gian
                    },
                ],
                order: [["createdate", "DESC"]],
                limit: limitNum,
                offset,
                distinct: true, // Tránh count sai do include M:N
            });

            return res.status(200).json({
                data: rows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limitNum),
                    currentPage: pageNum,
                },
            });
        } catch (error) {
            console.error("Get all coupons error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách mã giảm giá" });
        }
    }

    /**
     * Lấy chi tiết mã giảm giá theo ID
     * GET /api/coupon/:id
     */
    async getCouponById(req, res) {
        try {
            const { id } = req.params;

            const coupon = await ProductCoupon.findOne({
                where: { pk_coupon_id: id, status: { [Op.ne]: -1 } },
                include: [
                    {
                        model: Product,
                        as: "products",
                        attributes: ["pk_product_id", "product_name", "sku", "product_img", "product_type"],
                        through: { attributes: [] },
                        include: [
                            { model: ProductPricing, as: "pricings", where: { status: 1 }, required: false },
                        ],
                    },
                ],
            });

            if (!coupon) {
                return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
            }

            return res.status(200).json({ data: coupon });
        } catch (error) {
            console.error("Get coupon by ID error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết mã giảm giá" });
        }
    }

    /**
     * Tạo mã giảm giá mới
     * POST /api/coupon
     * Body: { coupon_code, coupon_name, description, discount_percent, start_date, end_date, productIds }
     */
    async createCoupon(req, res) {
        const t = await sequelize.transaction();
        try {
            const {
                coupon_code, coupon_name, description,
                discount_percent, start_date, end_date,
                productIds, // Array of product IDs
            } = req.body;

            const userId = req.user.userId;

            // Validate
            if (!coupon_code || !coupon_code.trim()) {
                throw new Error("Mã coupon không được để trống");
            }
            if (!coupon_name || !coupon_name.trim()) {
                throw new Error("Tên chương trình không được để trống");
            }
            if (!discount_percent || discount_percent <= 0 || discount_percent > 100) {
                throw new Error("Mức giảm phải từ 1 đến 100%");
            }

            // Check trùng code
            const existing = await ProductCoupon.findOne({
                where: { coupon_code: coupon_code.trim().toUpperCase() },
            });
            if (existing) {
                throw new Error(`Mã coupon "${coupon_code}" đã tồn tại trong hệ thống`);
            }

            // 1. Tạo coupon
            const newCoupon = await ProductCoupon.create({
                coupon_code: coupon_code.trim().toUpperCase(),
                coupon_name: coupon_name.trim(),
                description: description || null,
                discount_percent: parseFloat(discount_percent),
                start_date: start_date || null,
                end_date: end_date || null,
                status: 1,
                createdate: new Date(),
                createby: userId,
            }, { transaction: t });

            // 2. Gán sản phẩm (nếu có)
            if (productIds && productIds.length > 0) {
                const couponProducts = productIds.map(pid => ({
                    fk_coupon_id: newCoupon.pk_coupon_id,
                    fk_product_id: pid,
                }));
                await CouponProduct.bulkCreate(couponProducts, { transaction: t });
            }

            await t.commit();

            // Log hệ thống
            await systemLogController.record(
                req,
                "CREATE_COUPON",
                `Tạo mã giảm giá: ${coupon_code.trim().toUpperCase()} - Giảm ${discount_percent}%`,
                "INFO",
                userId
            );

            return res.status(201).json({
                message: "Tạo mã giảm giá thành công",
                data: newCoupon,
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Create coupon error:", error);
            return res.status(400).json({ message: error.message || "Lỗi hệ thống khi tạo mã giảm giá" });
        }
    }

    /**
     * Cập nhật mã giảm giá
     * PUT /api/coupon/:id
     */
    async updateCoupon(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                coupon_code, coupon_name, description,
                discount_percent, start_date, end_date,
                productIds, status,
            } = req.body;

            const userId = req.user.userId;

            const coupon = await ProductCoupon.findByPk(id);
            if (!coupon || coupon.status === -1) {
                throw new Error("Không tìm thấy mã giảm giá để cập nhật");
            }

            // Check trùng code (trừ chính nó)
            if (coupon_code) {
                const dup = await ProductCoupon.findOne({
                    where: {
                        coupon_code: coupon_code.trim().toUpperCase(),
                        pk_coupon_id: { [Op.ne]: id },
                    },
                });
                if (dup) {
                    throw new Error(`Mã coupon "${coupon_code}" đã được sử dụng`);
                }
            }

            // 1. Update coupon info
            await coupon.update({
                coupon_code: coupon_code ? coupon_code.trim().toUpperCase() : coupon.coupon_code,
                coupon_name: coupon_name !== undefined ? coupon_name.trim() : coupon.coupon_name,
                description: description !== undefined ? description : coupon.description,
                discount_percent: discount_percent !== undefined ? parseFloat(discount_percent) : coupon.discount_percent,
                start_date: start_date !== undefined ? (start_date || null) : coupon.start_date,
                end_date: end_date !== undefined ? (end_date || null) : coupon.end_date,
                status: status !== undefined ? status : coupon.status,
                modifiedate: new Date(),
                modifieby: userId,
            }, { transaction: t });

            // 2. Update product assignments (nếu có thay đổi)
            if (productIds !== undefined) {
                // Xoá liên kết cũ
                await CouponProduct.destroy({
                    where: { fk_coupon_id: id },
                    transaction: t,
                });

                // Tạo liên kết mới
                if (productIds.length > 0) {
                    const couponProducts = productIds.map(pid => ({
                        fk_coupon_id: parseInt(id),
                        fk_product_id: pid,
                    }));
                    await CouponProduct.bulkCreate(couponProducts, { transaction: t });
                }
            }

            await t.commit();

            // Log
            await systemLogController.record(
                req,
                "UPDATE_COUPON",
                `Cập nhật mã giảm giá: ${coupon.coupon_code}`,
                "INFO",
                userId
            );

            return res.status(200).json({
                message: "Cập nhật mã giảm giá thành công",
                data: coupon,
            });
        } catch (error) {
            if (t && !t.finished) await t.rollback();
            console.error("Update coupon error:", error);
            return res.status(400).json({ message: error.message || "Lỗi hệ thống khi cập nhật mã giảm giá" });
        }
    }

    /**
     * Xoá mã giảm giá (soft delete hoặc xoá hàng loạt)
     * DELETE /api/coupon
     * Body: { id, ids }
     */
    async deleteCoupon(req, res) {
        try {
            const { id, ids } = req.body;
            const userId = req.user.userId;

            // Ưu tiên ids (mảng), nếu không có thì lấy id (đơn lẻ)
            const targetIds = Array.isArray(ids) && ids.length
                ? ids.map(Number).filter(Number.isInteger)
                : (id ? [Number(id)].filter(Number.isInteger) : []);

            if (!targetIds.length) {
                return res.status(400).json({ message: "Yêu cầu cung cấp id hoặc ids để xóa" });
            }

            const coupons = await ProductCoupon.findAll({
                where: { pk_coupon_id: targetIds },
            });

            if (!coupons.length) {
                return res.status(404).json({ message: "Không tìm thấy mã giảm giá yêu cầu" });
            }

            // Xoá liên kết sản phẩm
            await CouponProduct.destroy({
                where: { fk_coupon_id: targetIds },
            });

            // Xoá coupon (hard delete)
            await ProductCoupon.destroy({
                where: { pk_coupon_id: targetIds },
            });

            const couponNames = coupons.map(c => c.coupon_code).join(", ");

            await systemLogController.record(
                req,
                "DELETE_COUPON",
                `Đã xóa mã giảm giá: ${couponNames}`,
                "WARNING",
                userId
            );

            return res.status(200).json({
                message: `Đã xóa ${coupons.length} mã giảm giá thành công`,
                deletedIds: targetIds,
            });
        } catch (error) {
            console.error("Delete coupon error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi xóa mã giảm giá" });
        }
    }
}

module.exports = new CouponController();
