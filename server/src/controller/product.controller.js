const { Op } = require("sequelize");
const { Product, ProductPricing, ProductCategory, ProductColor, ProductMaterial, ProductRoom } = require("../entities");

/**
 * Product Controller - Quản lý sản phẩm và hiển thị cho đơn hàng
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
class ProductController {
    /**
     * Lấy danh sách sản phẩm kèm thông tin giá (Dùng cho giao diện bán hàng)
     */
    async getAllProducts(req, res) {
        try {
            const { category_id, color_id, material_id, room_id, product_type, search, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const where = { product_status: 1 }; // Chỉ lấy sản phẩm đang hoạt động

            if (category_id) where.fk_category_id = category_id;
            if (color_id) where.fk_color_id = color_id;
            if (material_id) where.fk_material_id = material_id;
            if (room_id) where.fk_room_id = room_id;
            if (product_type) where.product_type = product_type;

            // Bộ lọc theo loại bán hàng (sell_type)
            // 1: Hàng mộc, 2: Hàng sẵn, 3: Hàng custom
            const { sell_type } = req.query;
            const pricingInclude = {
                model: ProductPricing,
                as: "pricings",
                where: { status: 1 }, // Chỉ lấy giá đang áp dụng
                required: false
            };

            if (sell_type) {
                if (sell_type == 1) {
                    // Hàng mộc: Phải là Standard và có giá mộc > 0
                    where.product_type = 1;
                    pricingInclude.required = true;
                    pricingInclude.where.raw_price = { [Op.gt]: 0 };
                } else if (sell_type == 2) {
                    // Hàng sẵn: Phải là Standard và có giá hoàn thiện > 0
                    where.product_type = 1;
                    pricingInclude.required = true;
                    pricingInclude.where.final_price = { [Op.gt]: 0 };
                } else if (sell_type == 3) {
                    // Hàng custom
                    where.product_type = 2;
                }
            }

            if (search) {
                where[Op.or] = [
                    { product_name: { [Op.like]: `%${search}%` } },
                    { sku: { [Op.like]: `%${search}%` } }
                ];
            }

            const { count, rows } = await Product.findAndCountAll({
                where,
                include: [
                    pricingInclude,
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
                    }
                ],
                order: [["createdate", "DESC"]],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            // Xử lý dữ liệu trả về để giao diện dễ phân biệt 3 loại hàng
            const processedRows = rows.map(product => {
                const productJson = product.toJSON();
                const currentPricing = productJson.pricings && productJson.pricings.length > 0 ? productJson.pricings[0] : null;

                let displayPrice = 0;
                let sellTypeName = "";

                if (product.product_type === 2) {
                    displayPrice = currentPricing ? currentPricing.final_price : 0;
                    sellTypeName = "Hàng custom";
                } else {
                    // Nếu đang lọc theo sell_type thì ưu tiên lấy giá của loại đó
                    if (sell_type == 1) {
                        displayPrice = currentPricing ? currentPricing.raw_price : 0;
                        sellTypeName = "Hàng mộc";
                    } else if (sell_type == 2) {
                        displayPrice = currentPricing ? currentPricing.final_price : 0;
                        sellTypeName = "Hàng sẵn";
                    } else {
                        // Mặc định (hoặc nếu không lọc cụ thể)
                        displayPrice = currentPricing ? currentPricing.final_price : 0;
                        sellTypeName = "Hàng sẵn/mẫu";
                    }
                }

                return {
                    ...productJson,
                    category_name: product.category ? product.category.category_name : null,
                    color_name: product.color ? product.color.color_name : null,
                    material_name: product.material ? product.material.material_name : null,
                    room_name: product.room ? product.room.room_name : null,
                    current_pricing: currentPricing,
                    display_price: displayPrice,
                    sell_type_name: sellTypeName,
                    // Flag để UI biết có thể bán theo loại nào
                    can_sell_raw: product.product_type === 1 && currentPricing && currentPricing.raw_price > 0,
                    can_sell_finished: product.product_type === 1 && currentPricing && currentPricing.final_price > 0,
                    is_custom_only: product.product_type === 2
                };
            });

            return res.status(200).json({
                data: processedRows,
                pagination: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
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
            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: ProductPricing,
                        as: "pricings",
                        where: { status: 1 },
                        required: false
                    },
                    {
                        model: ProductCategory,
                        as: "category"
                    },
                    {
                        model: ProductColor,
                        as: "color"
                    },
                    {
                        model: ProductMaterial,
                        as: "material"
                    },
                    {
                        model: ProductRoom,
                        as: "room"
                    }
                ]
            });

            if (!product) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            }

            return res.status(200).json(product);
        } catch (error) {
            console.error("Get product detail error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết sản phẩm" });
        }
    }
}

module.exports = new ProductController();
