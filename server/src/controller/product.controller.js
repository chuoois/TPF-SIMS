const { Op } = require("sequelize");
const { sequelize, Product, ProductPricing, ProductCategory, ProductColor, ProductMaterial, ProductRoom, ProductItem, ProductCoupon } = require("../entities");

/**
 * Product Controller - Quản lý sản phẩm và hiển thị cho đơn hàng
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 * Modified Date: 25/04/2026
 */
class ProductController {
    /**
     * Lấy danh sách sản phẩm kèm thông tin giá (Dùng cho giao diện bán hàng)
     * 
     * Query params:
     *  - search: tìm kiếm theo tên sản phẩm, SKU, tên loại, tên màu, tên chất liệu, tên phòng
     *  - category_id: lọc theo loại sản phẩm (hỗ trợ nhiều giá trị, phân cách bằng dấu phẩy)
     *  - color_id: lọc theo màu sắc (hỗ trợ nhiều giá trị)
     *  - material_id: lọc theo chất liệu (hỗ trợ nhiều giá trị)
     *  - room_id: lọc theo phòng (hỗ trợ nhiều giá trị)
     *  - sell_type: lọc theo loại bán hàng (1: Hàng mộc, 2: Hàng sẵn, 3: Quà tặng, 4: Hàng custom)
     *  - page, limit: phân trang
     */
    async getAllProducts(req, res) {
        try {
            const {
                category_id, color_id, material_id, room_id,
                sell_type, search, min_price, max_price, is_gift,
                page = 1, limit = 20
            } = req.query;
            const offset = (page - 1) * limit;

            // === WHERE conditions cho bảng Product ===
            const where = { product_status: 1 }; // Chỉ lấy sản phẩm đang hoạt động

            if (is_gift !== undefined) {
                where.is_gift = is_gift == "true" || is_gift == 1 ? 1 : 0;
            }

            // Lọc theo FK - hỗ trợ nhiều giá trị (vd: category_id=1,2,3)
            if (category_id) {
                const ids = String(category_id).split(",").map(Number).filter(n => !isNaN(n));
                where.fk_category_id = ids.length === 1 ? ids[0] : { [Op.in]: ids };
            }
            if (color_id) {
                const ids = String(color_id).split(",").map(Number).filter(n => !isNaN(n));
                where.fk_color_id = ids.length === 1 ? ids[0] : { [Op.in]: ids };
            }
            if (material_id) {
                const ids = String(material_id).split(",").map(Number).filter(n => !isNaN(n));
                where.fk_material_id = ids.length === 1 ? ids[0] : { [Op.in]: ids };
            }
            if (room_id) {
                const ids = String(room_id).split(",").map(Number).filter(n => !isNaN(n));
                where.fk_room_id = ids.length === 1 ? ids[0] : { [Op.in]: ids };
            }
            // === Pricing include (điều chỉnh theo sell_type) ===
            const pricingInclude = {
                model: ProductPricing,
                as: "pricings",
                where: { status: 1 }, // Chỉ lấy giá đang áp dụng
                required: false
            };

            // sell_type: 1-Hàng mộc, 2-Hàng sẵn, 3-Quà tặng, 4-Hàng custom
            if (sell_type) {
                if (sell_type == 1) {
                    // Hàng mộc: có giá mộc > 0
                    pricingInclude.required = true;
                    pricingInclude.where.raw_price = { [Op.gt]: 0 };
                    
                    if (min_price) pricingInclude.where.raw_price[Op.gte] = parseFloat(min_price);
                    if (max_price) {
                        if (typeof pricingInclude.where.raw_price === 'object') {
                            pricingInclude.where.raw_price[Op.lte] = parseFloat(max_price);
                        } else {
                            pricingInclude.where.raw_price = { [Op.lte]: parseFloat(max_price) };
                        }
                    }
                } else if (sell_type == 2 || sell_type == 3 || sell_type == 4) {
                    // Hàng sẵn/Quà tặng/Custom: có giá hoàn thiện > 0
                    pricingInclude.required = true;
                    pricingInclude.where.final_price = { [Op.gt]: 0 };

                    if (min_price) pricingInclude.where.final_price[Op.gte] = parseFloat(min_price);
                    if (max_price) {
                        if (typeof pricingInclude.where.final_price === 'object') {
                            pricingInclude.where.final_price[Op.lte] = parseFloat(max_price);
                        } else {
                            pricingInclude.where.final_price = { [Op.lte]: parseFloat(max_price) };
                        }
                    }
                }
            } else if (min_price || max_price) {
                // Nếu không có sell_type nhưng có lọc giá, mặc định lọc theo final_price
                pricingInclude.required = true;
                pricingInclude.where.final_price = {};
                if (min_price) pricingInclude.where.final_price[Op.gte] = parseFloat(min_price);
                if (max_price) pricingInclude.where.final_price[Op.lte] = parseFloat(max_price);
            }

            // === Include các bảng liên quan ===
            const categoryInclude = {
                model: ProductCategory,
                as: "category",
                attributes: ["pk_product_category_id", "category_name"]
            };
            const colorInclude = {
                model: ProductColor,
                as: "color",
                attributes: ["pk_product_color_id", "color_name"]
            };
            const materialInclude = {
                model: ProductMaterial,
                as: "material",
                attributes: ["pk_product_material_id", "material_name"]
            };
            const roomInclude = {
                model: ProductRoom,
                as: "room",
                attributes: ["pk_product_room_id", "room_name"]
            };

            // === Search: tìm kiếm trên Product + các bảng join ===
            if (search) {
                const searchTerm = `%${search}%`;
                // Sử dụng $alias.field$ để search trên bảng join
                where[Op.or] = [
                    { product_name: { [Op.like]: searchTerm } },
                    { sku: { [Op.like]: searchTerm } },
                    { "$category.category_name$": { [Op.like]: searchTerm } },
                    { "$color.color_name$": { [Op.like]: searchTerm } },
                    { "$material.material_name$": { [Op.like]: searchTerm } },
                    { "$room.room_name$": { [Op.like]: searchTerm } },
                ];
            }

            // === Subquery tính số lượng có thể bán ===
            // Chỉ đếm ProductItem có item_status = 1 (Sẵn sàng) VÀ chưa được gán cho đơn hàng nào
            const stockQuantityLiteral = sequelize.literal(`(
                SELECT COUNT(*)
                FROM product_item
                WHERE product_item.fk_product_id = Product.pk_product_id
                AND product_item.item_status = 1
                AND product_item.fk_order_item_id IS NULL
            )`);
            // === Include coupons (chỉ lấy coupon còn hạn) ===
            const couponInclude = {
                model: ProductCoupon,
                as: "coupons",
                where: {
                    status: 1,
                    start_date: { [Op.lte]: new Date() },
                    end_date: { [Op.gte]: new Date() }
                },
                required: false
            };

            // === Build query ===
            const queryOptions = {
                where,
                attributes: [
                    "pk_product_id", "sku", "product_name", "product_img",
                    "unit", "size", "is_gift", "description", "warranty_months",
                    [stockQuantityLiteral, "available_quantity"]
                ],
                include: [
                    {
                        ...pricingInclude,
                        attributes: ["raw_price", "final_price"]
                    },
                    categoryInclude,
                    colorInclude,
                    materialInclude,
                    roomInclude,
                    couponInclude
                ],
                order: [[sequelize.col("Product.createdate"), "DESC"]],
                // subQuery: false cần thiết khi search trên bảng join kết hợp với limit/offset
                subQuery: false,
                distinct: true,
            };

            // Đếm tổng (cần query riêng vì subQuery: false ảnh hưởng count)
            const totalItems = await Product.count({
                where,
                include: [
                    pricingInclude,
                    categoryInclude,
                    colorInclude,
                    materialInclude,
                    roomInclude,
                    couponInclude
                ],
                distinct: true,
                col: "pk_product_id"
            });

            // Query data với phân trang
            queryOptions.limit = parseInt(limit);
            queryOptions.offset = parseInt(offset);

            const rows = await Product.findAll(queryOptions);

            // === Xử lý dữ liệu trả về (chỉ giữ thông tin cần thiết cho list) ===
            const processedRows = rows.map(product => {
                const p = product.toJSON();
                const pricing = p.pricings && p.pricings.length > 0 ? p.pricings[0] : null;
                const coupon = p.coupons && p.coupons.length > 0 ? p.coupons[0] : null;

                // Xác định giá hiển thị gốc
                let original_price = 0;
                let sell_type_name = "";

                if (p.is_gift) {
                    original_price = 0;
                    sell_type_name = "Quà tặng";
                } else if (sell_type == 1) {
                    original_price = pricing ? pricing.raw_price : 0;
                    sell_type_name = "Hàng mộc";
                } else if (sell_type == 2) {
                    original_price = pricing ? pricing.final_price : 0;
                    sell_type_name = "Hàng sẵn";
                } else if (sell_type == 3) {
                    original_price = pricing ? pricing.final_price : 0;
                    sell_type_name = "Quà tặng";
                } else if (sell_type == 4) {
                    original_price = pricing ? pricing.final_price : 0;
                    sell_type_name = "Hàng custom";
                } else {
                    original_price = pricing ? pricing.final_price : 0;
                }

                // Tính toán giá sau giảm
                let display_price = original_price;
                let discount_percent = 0;
                if (coupon && original_price > 0) {
                    discount_percent = parseFloat(coupon.discount_percent);
                    display_price = original_price * (1 - discount_percent / 100);
                }

                return {
                    pk_product_id: p.pk_product_id,
                    sku: p.sku,
                    product_name: p.product_name,
                    product_img: p.product_img,
                    unit: p.unit,
                    size: p.size,
                    is_gift: p.is_gift,
                    available_quantity: parseInt(p.available_quantity) || 0,
                    category_name: p.category ? p.category.category_name : null,
                    color_name: p.color ? p.color.color_name : null,
                    material_name: p.material ? p.material.material_name : null,
                    room_name: p.room ? p.room.room_name : null,
                    original_price,
                    display_price,
                    discount_percent,
                    coupon_code: coupon ? coupon.coupon_code : null,
                    sell_type_name,
                    description: p.description,
                    warranty_months: p.warranty_months,
                };
            });

            return res.status(200).json({
                data: processedRows,
                pagination: {
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                },
            });
        } catch (error) {
            console.error("Get all products error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách sản phẩm" });
        }
    }

    /**
     * Lấy chi tiết một sản phẩm
     */
    async getProductDetail(req, res) {
        try {
            const { id } = req.params;

            // Subquery tính số lượng có thể bán
            const stockQuantityLiteral = sequelize.literal(`(
                SELECT COUNT(*)
                FROM product_item
                WHERE product_item.fk_product_id = Product.pk_product_id
                AND product_item.item_status = 1
                AND product_item.fk_order_item_id IS NULL
            )`);

            const product = await Product.findByPk(id, {
                attributes: [
                    "pk_product_id", "sku", "product_name", "product_img",
                    "unit", "size", "is_gift", "warranty_months", "description",
                    [stockQuantityLiteral, "available_quantity"]
                ],
                include: [
                    {
                        model: ProductPricing,
                        as: "pricings",
                        where: { status: 1 },
                        required: false,
                        attributes: ["raw_price", "final_price"]
                    },
                    {
                        model: ProductCategory,
                        as: "category",
                        attributes: ["category_name"]
                    },
                    {
                        model: ProductColor,
                        as: "color",
                        attributes: ["color_name"]
                    },
                    {
                        model: ProductMaterial,
                        as: "material",
                        attributes: ["material_name"]
                    },
                    {
                        model: ProductRoom,
                        as: "room",
                        attributes: ["room_name"]
                    },
                    {
                        model: ProductCoupon,
                        as: "coupons",
                        where: {
                            status: 1,
                            start_date: { [Op.lte]: new Date() },
                            end_date: { [Op.gte]: new Date() }
                        },
                        required: false,
                        through: { attributes: [] }
                    },
                    {
                        model: ProductItem,
                        as: "items",
                        where: { item_status: 1, fk_order_item_id: null },
                        required: false,
                        attributes: ["pk_item_id", "item_serial", "batch_code", "item_status", "note"]
                    }
                ]
            });

            if (!product) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            }

            // Xử lý dữ liệu tương tự getAllProducts
            const p = product.toJSON();
            const pricing = p.pricings && p.pricings.length > 0 ? p.pricings[0] : null;
            const coupon = p.coupons && p.coupons.length > 0 ? p.coupons[0] : null;

            let original_final_price = pricing ? pricing.final_price : 0;
            let original_raw_price = pricing ? pricing.raw_price : 0;
            
            let discount_percent = 0;
            let display_final_price = original_final_price;
            let display_raw_price = original_raw_price;

            if (coupon) {
                discount_percent = parseFloat(coupon.discount_percent);
                display_final_price = original_final_price * (1 - discount_percent / 100);
                display_raw_price = original_raw_price * (1 - discount_percent / 100);
            }

            const response = {
                pk_product_id: p.pk_product_id,
                sku: p.sku,
                product_name: p.product_name,
                product_img: p.product_img,
                unit: p.unit,
                size: p.size,
                is_gift: p.is_gift,
                description: p.description,
                warranty_months: p.warranty_months,
                available_quantity: parseInt(p.available_quantity) || 0,
                category_name: p.category ? p.category.category_name : null,
                color_name: p.color ? p.color.color_name : null,
                material_name: p.material ? p.material.material_name : null,
                room_name: p.room ? p.room.room_name : null,
                pricing: {
                    original_raw_price,
                    original_final_price,
                    display_raw_price,
                    display_final_price,
                    discount_percent,
                    coupon_code: coupon ? coupon.coupon_code : null
                },
                items: p.items || []
            };

            return res.status(200).json(response);
        } catch (error) {
            console.error("Get product detail error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết sản phẩm" });
        }
    }
}

module.exports = new ProductController();
