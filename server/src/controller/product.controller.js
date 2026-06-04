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
            const andConditions = [{ product_status: 1 }];

            // Xử lý logic lọc quà tặng
            const isGiftQuery = (is_gift === "true" || is_gift === "1" || is_gift === 1);
            if (isGiftQuery) {
                // Tab quà tặng: lấy những gì được đánh dấu là quà tặng HOẶC có chữ "Quà tặng" trong tên
                andConditions.push({
                    [Op.or]: [
                        { is_gift: 1 },
                        { product_name: { [Op.like]: "%Quà tặng%" } }
                    ]
                });
            } else {
                // Các tab khác: tuyệt đối không lấy quà tặng
                andConditions.push({ is_gift: { [Op.or]: [0, null] } });
                andConditions.push({ product_name: { [Op.notLike]: "%Quà tặng%" } });
            }

            // Lọc theo FK - hỗ trợ nhiều giá trị (vd: category_id=1,2,3)
            if (category_id) {
                const ids = String(category_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_category_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }
            if (color_id) {
                const ids = String(color_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_color_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }
            if (material_id) {
                const ids = String(material_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_material_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }
            if (room_id) {
                const ids = String(room_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_room_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }

            // === Search: tìm kiếm trên Product + các bảng join ===
            if (search) {
                const searchTerm = `%${search}%`;
                andConditions.push({
                    [Op.or]: [
                        { product_name: { [Op.like]: searchTerm } },
                        { sku: { [Op.like]: searchTerm } },
                        { "$category.category_name$": { [Op.like]: searchTerm } },
                        { "$color.color_name$": { [Op.like]: searchTerm } },
                        { "$material.material_name$": { [Op.like]: searchTerm } },
                        { "$room.room_name$": { [Op.like]: searchTerm } },
                    ]
                });
            }

            const where = { [Op.and]: andConditions };

            // === Pricing include (điều chỉnh theo sell_type và is_gift) ===
            const pricingInclude = {
                model: ProductPricing,
                as: "pricings",
                where: { status: 1 }, // Chỉ lấy giá đang áp dụng
                required: false
            };

            // Nếu không phải là quà tặng, mới áp dụng các bộ lọc về giá
            if (!isGiftQuery) {
                if (sell_type == 1) {
                    // Hàng mộc (RAW): Chỉ lấy sản phẩm có product_type = 'RAW' và final_price > 0
                    andConditions.push({ product_type: "RAW" });
                    pricingInclude.required = true;
                    andConditions.push({ "$pricings.final_price$": { [Op.gt]: 0 } });

                    if (min_price) {
                        andConditions.push({ "$pricings.final_price$": { [Op.gte]: parseFloat(min_price) } });
                    }
                    if (max_price) {
                        andConditions.push({ "$pricings.final_price$": { [Op.lte]: parseFloat(max_price) } });
                    }
                } else if (sell_type == 2) {
                    // Hàng sẵn: Lấy FINISHED có final_price > 0 HOẶC RAW có raw_price > 0
                    andConditions.push({ product_type: { [Op.in]: ["FINISHED", "RAW"] } });
                    pricingInclude.required = true;

                    if (min_price || max_price) {
                        const min = min_price ? parseFloat(min_price) : null;
                        const max = max_price ? parseFloat(max_price) : null;

                        andConditions.push({
                            [Op.or]: [
                                {
                                    [Op.and]: [
                                        { product_type: "FINISHED" },
                                        { "$pricings.final_price$": { [Op.gt]: 0 } },
                                        min !== null && { "$pricings.final_price$": { [Op.gte]: min } },
                                        max !== null && { "$pricings.final_price$": { [Op.lte]: max } }
                                    ].filter(Boolean)
                                },
                                {
                                    [Op.and]: [
                                        { product_type: "RAW" },
                                        { "$pricings.raw_price$": { [Op.gt]: 0 } },
                                        min !== null && { "$pricings.raw_price$": { [Op.gte]: min } },
                                        max !== null && { "$pricings.raw_price$": { [Op.lte]: max } }
                                    ].filter(Boolean)
                                }
                            ]
                        });
                    } else {
                        andConditions.push({
                            [Op.or]: [
                                {
                                    [Op.and]: [
                                        { product_type: "FINISHED" },
                                        { "$pricings.final_price$": { [Op.gt]: 0 } }
                                    ]
                                },
                                {
                                    [Op.and]: [
                                        { product_type: "RAW" },
                                        { "$pricings.raw_price$": { [Op.gt]: 0 } }
                                    ]
                                }
                            ]
                        });
                    }
                } else if (sell_type == 4) {
                    // Hàng custom: bắt buộc có giá hoàn thiện > 0
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
                } else if (min_price || max_price) {
                    // Nếu không có sell_type nhưng có lọc giá, mặc định lọc theo final_price
                    pricingInclude.required = true;
                    pricingInclude.where.final_price = {};
                    if (min_price) pricingInclude.where.final_price[Op.gte] = parseFloat(min_price);
                    if (max_price) pricingInclude.where.final_price[Op.lte] = parseFloat(max_price);
                }
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
                    "is_bundle", "bundle_items", "size", "is_gift", "description", "warranty_months", "min_stock", "product_type",
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

                // Xác định sản phẩm thực sự là quà tặng (dựa trên flag DB hoặc tên)
                const isActuallyGift = p.is_gift == 1 || p.product_name?.toLowerCase().includes("quà tặng");

                if (isActuallyGift) {
                    original_price = 0;
                    sell_type_name = "Quà tặng";
                } else {
                    if (sell_type == 1) {
                        // Hàng mộc tab: Giá khách mua mộc đem về tự sơn (final_price)
                        original_price = pricing ? pricing.final_price : 0;
                        sell_type_name = "Hàng mộc";
                    } else if (sell_type == 2) {
                        // Hàng sẵn tab: 
                        // - Nếu là hàng RAW mộc nhưng bán ở tab Hàng sẵn -> yêu cầu xưởng sơn (raw_price)
                        // - Nếu là hàng FINISHED -> giá hoàn thiện (final_price)
                        if (pricing) {
                            original_price = p.product_type === "RAW" ? pricing.raw_price : pricing.final_price;
                        } else {
                            original_price = 0;
                        }
                        sell_type_name = "Hàng sẵn";
                    } else if (sell_type == 4) {
                        original_price = pricing ? pricing.final_price : 0;
                        sell_type_name = "Hàng custom";
                    } else {
                        // Mặc định nếu không có sell_type cụ thể
                        if (pricing) {
                            if (p.product_type === "RAW") {
                                original_price = pricing.final_price || pricing.raw_price;
                            } else {
                                original_price = pricing.final_price;
                            }
                        } else {
                            original_price = 0;
                        }
                        sell_type_name = "Sản phẩm";
                    }
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
                    is_bundle: p.is_bundle,
                    bundle_items: p.bundle_items,
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
                    min_stock: p.min_stock || 0,
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
                    "is_bundle", "bundle_items", "size", "is_gift", "warranty_months", "description", "min_stock",
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
                is_bundle: p.is_bundle,
                bundle_items: p.bundle_items,
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
                items: p.items || [],
                min_stock: p.min_stock || 0
            };

            return res.status(200).json(response);
        } catch (error) {
            console.error("Get product detail error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết sản phẩm" });
        }
    }
    // ======================== OWNER ENDPOINTS ========================

    /**
     * Lấy danh sách sản phẩm cho Owner (bao gồm cả inactive, chưa định giá)
     * 
     * Query params:
     *  - search: tìm kiếm theo tên, SKU
     *  - category_id, color_id, material_id, room_id: filter theo FK
     *  - product_type: FINISHED | RAW | CUSTOM
     *  - product_status: 0 | 1 (mặc định lấy tất cả)
     *  - is_gift: 0 | 1
     *  - page, limit: phân trang
     */
    async getAllProductsForOwner(req, res) {
        try {
            const {
                category_id, color_id, material_id, room_id,
                product_type, product_status, search, is_gift,
                low_stock,
                page = 1, limit = 20
            } = req.query;
            const offset = (page - 1) * limit;
            const isLowStockFilter = low_stock === 'true' || low_stock === '1';

            const andConditions = [];

            // Owner có thể xem cả active lẫn inactive, nhưng nếu có filter thì áp dụng
            if (product_status !== undefined && product_status !== '') {
                andConditions.push({ product_status: parseInt(product_status) });
            }

            if (product_type) {
                andConditions.push({ product_type });
            }

            if (is_gift !== undefined && is_gift !== '') {
                andConditions.push({ is_gift: parseInt(is_gift) });
            }

            // Lọc theo FK
            if (category_id) {
                const ids = String(category_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_category_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }
            if (color_id) {
                const ids = String(color_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_color_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }
            if (material_id) {
                const ids = String(material_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_material_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }
            if (room_id) {
                const ids = String(room_id).split(",").map(Number).filter(n => !isNaN(n));
                andConditions.push({ fk_room_id: ids.length === 1 ? ids[0] : { [Op.in]: ids } });
            }

            // Search
            if (search) {
                const searchTerm = `%${search}%`;
                andConditions.push({
                    [Op.or]: [
                        { product_name: { [Op.like]: searchTerm } },
                        { sku: { [Op.like]: searchTerm } },
                        { "$category.category_name$": { [Op.like]: searchTerm } },
                        { "$material.material_name$": { [Op.like]: searchTerm } },
                    ]
                });
            }

            // Low stock filter: lọc server-side bằng subquery trong WHERE
            if (isLowStockFilter) {
                andConditions.push(sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM product_item
                    WHERE product_item.fk_product_id = Product.pk_product_id
                    AND product_item.item_status = 1
                    AND product_item.fk_order_item_id IS NULL
                ) > 0 AND (
                    SELECT COUNT(*)
                    FROM product_item
                    WHERE product_item.fk_product_id = Product.pk_product_id
                    AND product_item.item_status = 1
                    AND product_item.fk_order_item_id IS NULL
                ) <= Product.min_stock AND Product.min_stock > 0`));
            }

            const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

            // Subquery tính số lượng tồn kho thực tế
            const stockQuantityLiteral = sequelize.literal(`(
                SELECT COUNT(*)
                FROM product_item
                WHERE product_item.fk_product_id = Product.pk_product_id
                AND product_item.item_status = 1
                AND product_item.fk_order_item_id IS NULL
            )`);

            const includes = [
                {
                    model: ProductPricing,
                    as: "pricings",
                    where: { status: 1 },
                    required: false,
                    attributes: ["pk_pricing_id", "cost_price", "raw_price", "final_price", "profit_margin", "operating_margin"]
                },
                {
                    model: ProductCategory,
                    as: "category",
                    attributes: ["pk_product_category_id", "category_name"]
                },
                {
                    model: ProductColor,
                    as: "color",
                    attributes: ["pk_product_color_id", "color_name"]
                },
                {
                    model: ProductMaterial,
                    as: "material",
                    attributes: ["pk_product_material_id", "material_name"]
                },
                {
                    model: ProductRoom,
                    as: "room",
                    attributes: ["pk_product_room_id", "room_name"]
                },
            ];

            // Count
            const totalItems = await Product.count({
                where,
                include: includes,
                distinct: true,
                col: "pk_product_id"
            });

            // Query
            const rows = await Product.findAll({
                where,
                attributes: [
                    "pk_product_id", "sku", "product_name", "product_img",
                    "is_bundle", "bundle_items", "size", "is_gift", "description",
                    "warranty_months", "product_type", "product_status",
                    "stock_quantity", "createdate", "modifiedate", "min_stock",
                    [stockQuantityLiteral, "available_quantity"]
                ],
                include: includes,
                order: [["createdate", "DESC"]],
                subQuery: false,
                distinct: true,
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            // Lấy dữ liệu lô hàng từ ProductItem
            const productIds = rows.map(r => r.pk_product_id);
            const productItems = await ProductItem.findAll({
                where: { fk_product_id: productIds },
                attributes: ["fk_product_id", "cost_price", "batch_code", "createdate", "item_status", "fk_order_item_id"],
            });

            const lotsMap = {};
            productItems.forEach(item => {
                const pid = item.fk_product_id;
                if (!lotsMap[pid]) lotsMap[pid] = {};

                // Group by batch_code, fallback to date + cost_price
                const dateKey = item.createdate ? new Date(item.createdate).toISOString().split('T')[0] : 'unknown_date';
                const key = item.batch_code || `${dateKey}_${parseFloat(item.cost_price)}`;

                if (!lotsMap[pid][key]) {
                    lotsMap[pid][key] = {
                        lotId: key,
                        importDate: item.createdate || new Date(),
                        importPrice: parseFloat(item.cost_price) || 0,
                        initialQuantity: 0,
                        remainingQuantity: 0,
                    };
                }

                lotsMap[pid][key].initialQuantity += 1;
                if (item.item_status === 1 && item.fk_order_item_id === null) {
                    lotsMap[pid][key].remainingQuantity += 1;
                }
            });

            // Map dữ liệu
            const PRODUCT_TYPE_MAP = { FINISHED: "Hàng sẵn", RAW: "Hàng mộc", CUSTOM: "Hàng khách đặt" };

            const processedRows = rows.map(product => {
                const p = product.toJSON();
                const pricing = p.pricings && p.pricings.length > 0 ? p.pricings[0] : null;
                const availableQty = parseInt(p.available_quantity) || 0;
                const productTypeName = PRODUCT_TYPE_MAP[p.product_type] || p.product_type;

                // Xác định status hiển thị
                let displayStatus;
                if (p.product_status === 0) {
                    displayStatus = "Hết hàng";
                } else if (p.is_gift === 1) {
                    displayStatus = "Quà tặng";
                } else if (p.product_type === "CUSTOM") {
                    displayStatus = "Hàng khách đặt";
                } else if (!pricing || (pricing.final_price <= 0 && pricing.raw_price <= 0)) {
                    displayStatus = "Chưa định giá";
                } else if (availableQty === 0 && p.product_type !== "CUSTOM") {
                    displayStatus = "Hết hàng";
                } else if (p.product_type === "RAW") {
                    displayStatus = "Hàng mộc";
                } else {
                    displayStatus = "Hàng sẵn";
                }

                // Dimensions string
                let dimensions = "";
                if (p.size) {
                    const parts = [];
                    if (p.size.length) parts.push(p.size.length);
                    if (p.size.width) parts.push(p.size.width);
                    if (p.size.height) parts.push(p.size.height);
                    dimensions = parts.join(" × ");
                    if (p.size.note) dimensions = dimensions ? `${dimensions} (${p.size.note})` : p.size.note;
                }

                return {
                    id: p.pk_product_id,
                    code: p.sku,
                    name: p.product_name,
                    img: p.product_img,
                    category: p.category ? p.category.category_name : null,
                    category_id: p.category ? p.category.pk_product_category_id : null,
                    material: p.material ? p.material.material_name : null,
                    material_id: p.material ? p.material.pk_product_material_id : null,
                    color: p.color ? p.color.color_name : null,
                    color_id: p.color ? p.color.pk_product_color_id : null,
                    room: p.room ? p.room.room_name : null,
                    room_id: p.room ? p.room.pk_product_room_id : null,
                    dimensions,
                    size: p.size,
                    productType: productTypeName,
                    productTypeCode: p.product_type,
                    status: displayStatus,
                    stock: availableQty,
                    is_bundle: p.is_bundle,
                    bundle_items: p.bundle_items,
                    is_gift: p.is_gift,
                    warrantyMonths: p.warranty_months,
                    description: p.description,
                    product_status: p.product_status,
                    // Pricing
                    costPrice: pricing ? parseFloat(pricing.cost_price) : 0,
                    rawRetailPrice: pricing ? (p.product_type === "RAW" ? parseFloat(pricing.final_price) : 0) : 0,
                    retailPrice: pricing ? parseFloat(pricing.final_price) : 0,
                    finishedRetailPrice: pricing ? (p.product_type === "RAW" ? parseFloat(pricing.raw_price) : parseFloat(pricing.final_price)) : 0,
                    profitMargin: pricing ? parseFloat(pricing.profit_margin) : 0,
                    isPriced: pricing ? (parseFloat(pricing.final_price) > 0 || parseFloat(pricing.raw_price) > 0) : false,
                    minStock: p.min_stock || 0,
                    createdate: p.createdate,
                    lots: Object.values(lotsMap[p.pk_product_id] || {}).sort((a, b) => new Date(b.importDate) - new Date(a.importDate)),
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
            console.error("Get owner products error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách sản phẩm" });
        }
    }

    /**
     * Tạo sản phẩm mới (Chỉ OWNER)
     */
    async createProduct(req, res) {
        const t = await sequelize.transaction();
        try {
            const { pricing, ...productData } = req.body;
            const userId = req.user.id;

            // Kiểm tra SKU unique
            const existingSku = await Product.findOne({ where: { sku: productData.sku } });
            if (existingSku) {
                await t.rollback();
                return res.status(409).json({ message: `Mã sản phẩm "${productData.sku}" đã tồn tại` });
            }

            // Tạo Product
            const product = await Product.create({
                ...productData,
                product_status: 1,
                createby: userId,
                createdate: new Date(),
            }, { transaction: t });

            // Tạo Pricing nếu có
            if (pricing) {
                await ProductPricing.create({
                    fk_product_id: product.pk_product_id,
                    fk_user_account_id: userId,
                    cost_price: pricing.cost_price || 0,
                    raw_price: pricing.raw_price || 0,
                    final_price: pricing.final_price || 0,
                    profit_margin: pricing.profit_margin || 0,
                    operating_margin: pricing.operating_margin || 0,
                    status: 1,
                    createby: userId,
                    createdate: new Date(),
                }, { transaction: t });
            }

            await t.commit();

            // Fetch lại sản phẩm đầy đủ
            const fullProduct = await Product.findByPk(product.pk_product_id, {
                include: [
                    { model: ProductPricing, as: "pricings", where: { status: 1 }, required: false },
                    { model: ProductCategory, as: "category" },
                    { model: ProductColor, as: "color" },
                    { model: ProductMaterial, as: "material" },
                    { model: ProductRoom, as: "room" },
                ]
            });

            return res.status(201).json({
                message: "Tạo sản phẩm thành công",
                data: fullProduct,
            });
        } catch (error) {
            await t.rollback();
            console.error("Create product error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tạo sản phẩm" });
        }
    }

    /**
     * Cập nhật sản phẩm (Chỉ OWNER)
     */
    async updateProduct(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { pricing, ...productData } = req.body;
            const userId = req.user.id;

            const product = await Product.findByPk(id);
            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            }

            // Kiểm tra SKU unique (trừ chính nó)
            if (productData.sku) {
                const existingSku = await Product.findOne({
                    where: { sku: productData.sku, pk_product_id: { [Op.ne]: id } }
                });
                if (existingSku) {
                    await t.rollback();
                    return res.status(409).json({ message: `Mã sản phẩm "${productData.sku}" đã tồn tại` });
                }
            }

            // Cập nhật Product
            await product.update({
                ...productData,
                modifieby: userId,
                modifiedate: new Date(),
            }, { transaction: t });

            // Cập nhật Pricing nếu có
            if (pricing) {
                // Tắt pricing cũ
                await ProductPricing.update(
                    { status: 0, modifieby: userId, modifiedate: new Date() },
                    { where: { fk_product_id: id, status: 1 }, transaction: t }
                );

                // Tạo pricing mới
                await ProductPricing.create({
                    fk_product_id: parseInt(id),
                    fk_user_account_id: userId,
                    cost_price: pricing.cost_price || 0,
                    raw_price: pricing.raw_price || 0,
                    final_price: pricing.final_price || 0,
                    profit_margin: pricing.profit_margin || 0,
                    operating_margin: pricing.operating_margin || 0,
                    status: 1,
                    createby: userId,
                    createdate: new Date(),
                }, { transaction: t });
            }

            await t.commit();

            // Fetch lại đầy đủ
            const fullProduct = await Product.findByPk(id, {
                include: [
                    { model: ProductPricing, as: "pricings", where: { status: 1 }, required: false },
                    { model: ProductCategory, as: "category" },
                    { model: ProductColor, as: "color" },
                    { model: ProductMaterial, as: "material" },
                    { model: ProductRoom, as: "room" },
                ]
            });

            return res.status(200).json({
                message: "Cập nhật sản phẩm thành công",
                data: fullProduct,
            });
        } catch (error) {
            await t.rollback();
            console.error("Update product error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật sản phẩm" });
        }
    }

    /**
     * Xóa sản phẩm vĩnh viễn (Hard-delete, chỉ OWNER)
     * - Kiểm tra tồn kho active trước khi xóa
     * - Kiểm tra đơn hàng đang xử lý liên quan
     * - Xóa các bản ghi con: ProductPricing, ProductItem, CouponProduct
     * - Gỡ liên kết FK ở OrderItem, ManufacturingOrderItem (set NULL để giữ lịch sử)
     * - Xóa bản ghi Product
     */
    async deleteProduct(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id);
            if (!product) {
                await t.rollback();
                return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            }

            // Kiểm tra có ProductItem active (đang trong kho) không
            const activeItems = await ProductItem.count({
                where: {
                    fk_product_id: id,
                    item_status: 1,
                    fk_order_item_id: null,
                }
            });

            if (activeItems > 0) {
                await t.rollback();
                return res.status(400).json({
                    message: `Không thể xóa! Sản phẩm đang có ${activeItems} món hàng tồn kho.`
                });
            }

            // Kiểm tra có đơn hàng đang xử lý (chưa hoàn thành/hủy) liên quan không
            const pendingOrderItems = await sequelize.query(`
                SELECT COUNT(*) as cnt
                FROM order_item oi
                JOIN \`order\` o ON oi.fk_order_id = o.pk_order_id
                WHERE oi.fk_product_id = :productId
                AND oi.status = 1
                AND o.order_status NOT IN (0, 6)
            `, {
                replacements: { productId: id },
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            });

            if (pendingOrderItems[0]?.cnt > 0) {
                await t.rollback();
                return res.status(400).json({
                    message: `Không thể xóa! Sản phẩm đang có ${pendingOrderItems[0].cnt} đơn hàng chưa hoàn thành.`
                });
            }

            // 1. Xóa tất cả ProductPricing liên quan
            await ProductPricing.destroy({
                where: { fk_product_id: id },
                transaction: t
            });

            // 2. Xóa tất cả ProductItem liên quan (đã kiểm tra active = 0 ở trên)
            await ProductItem.destroy({
                where: { fk_product_id: id },
                transaction: t
            });

            // 3. Xóa liên kết CouponProduct
            const { CouponProduct } = require("../entities");
            await CouponProduct.destroy({
                where: { fk_product_id: id },
                transaction: t
            });

            // 4. Gỡ liên kết FK ở OrderItem (giữ lịch sử đơn hàng, set NULL)
            const { OrderItem: OI } = require("../entities");
            await OI.update(
                { fk_product_id: null },
                { where: { fk_product_id: id }, transaction: t }
            );

            // 5. Gỡ liên kết FK ở ManufacturingOrderItem (giữ lịch sử nhập hàng)
            const { ManufacturingOrderItem: MOI } = require("../entities");
            await MOI.update(
                { fk_product_id: null },
                { where: { fk_product_id: id }, transaction: t }
            );

            // 6. Xóa sản phẩm
            await product.destroy({ transaction: t });

            await t.commit();

            return res.status(200).json({ message: "Đã xóa sản phẩm vĩnh viễn thành công" });
        } catch (error) {
            await t.rollback();
            console.error("Delete product error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm" });
        }
    }
}

module.exports = new ProductController();
