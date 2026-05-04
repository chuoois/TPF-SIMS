const { ProductCategory, ProductColor, ProductMaterial, ProductRoom } = require("../entities");
const systemLogController = require("./systemLog.controller");
const { Op } = require("sequelize");

/**
 * ProductAttributeController
 * Quản lý danh mục, màu sắc, chất liệu sản phẩm
 * Cung cấp API list và tự động thêm mới (findOrCreate)
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
class ProductAttributeController {
    /**
     * Lấy thuộc tính sản phẩm.
     * Hỗ trợ:
     * 1. Lấy toàn bộ (mặc định)
     * 2. Tìm kiếm chung (?search=...)
     * 3. Phân trang theo loại cụ thể (?type=category&page=1&limit=10&search=...)
     */
    async getAllAttributes(req, res) {
        try {
            const { type, search, page, limit } = req.query;

            // Nếu có type, thực hiện lấy danh sách phân trang cho loại đó
            if (type) {
                const pageNum = parseInt(page) || 1;
                const limitNum = parseInt(limit) || 10;
                const offset = (pageNum - 1) * limitNum;

                let model;
                let searchField;

                switch (type) {
                    case "category":
                        model = ProductCategory;
                        searchField = "category_name";
                        break;
                    case "color":
                        model = ProductColor;
                        searchField = "color_name";
                        break;
                    case "material":
                        model = ProductMaterial;
                        searchField = "material_name";
                        break;
                    case "room":
                        model = ProductRoom;
                        searchField = "room_name";
                        break;
                    default:
                        return res.status(400).json({ message: "Loại thuộc tính không hợp lệ" });
                }

                const whereClause = { status: 1 };
                if (search) {
                    whereClause[searchField] = { [Op.like]: `%${search}%` };
                }

                const { count, rows } = await model.findAndCountAll({
                    where: whereClause,
                    order: [[searchField, "ASC"]],
                    limit: limitNum,
                    offset: offset
                });

                const responseKey = 
                    type === "category" ? "categories" :
                    type === "color" ? "colors" :
                    type === "material" ? "materials" :
                    type === "room" ? "rooms" : "data";

                return res.status(200).json({
                    [responseKey]: rows,
                    pagination: {
                        totalItems: count,
                        totalPages: Math.ceil(count / limitNum),
                        currentPage: pageNum
                    }
                });
            }

            // Trường hợp lấy toàn bộ (có thể search chung)
            const whereClause = { status: 1 };
            const catWhere = { ...whereClause };
            const colorWhere = { ...whereClause };
            const matWhere = { ...whereClause };
            const roomWhere = { ...whereClause };

            if (search) {
                catWhere.category_name = { [Op.like]: `%${search}%` };
                colorWhere.color_name = { [Op.like]: `%${search}%` };
                matWhere.material_name = { [Op.like]: `%${search}%` };
                roomWhere.room_name = { [Op.like]: `%${search}%` };
            }

            const [categories, colors, materials, rooms] = await Promise.all([
                ProductCategory.findAndCountAll({ where: catWhere, order: [["category_name", "ASC"]] }),
                ProductColor.findAndCountAll({ where: colorWhere, order: [["color_name", "ASC"]] }),
                ProductMaterial.findAndCountAll({ where: matWhere, order: [["material_name", "ASC"]] }),
                ProductRoom.findAndCountAll({ where: roomWhere, order: [["room_name", "ASC"]] })
            ]);

            return res.status(200).json({
                categories: categories.rows,
                colors: colors.rows,
                materials: materials.rows,
                rooms: rooms.rows,
                counts: {
                    categories: categories.count,
                    colors: colors.count,
                    materials: materials.count,
                    rooms: rooms.count
                }
            });
        } catch (error) {
            console.error("Get attributes error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách thuộc tính" });
        }
    }

    /**
     * Đồng bộ Category: Tìm theo tên, nếu không có thì tạo mới
     */
    async syncCategory(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Tên danh mục không được để trống" });

            const [category, created] = await ProductCategory.findOrCreate({
                where: { category_name: name.trim() },
                defaults: {
                    category_name: name.trim(),
                    status: 1
                }
            });

            if (created) {
                await systemLogController.record(
                    req,
                    "CREATE_CATEGORY",
                    `Đã tạo mới danh mục sản phẩm: ${name.trim()}`,
                    "INFO"
                );
            }

            return res.status(created ? 201 : 200).json(category);
        } catch (error) {
            console.error("Sync category error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi đồng bộ danh mục" });
        }
    }

    /**
     * Đồng bộ Color: Tìm theo tên, nếu không có thì tạo mới
     */
    async syncColor(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Tên màu sắc không được để trống" });

            const [color, created] = await ProductColor.findOrCreate({
                where: { color_name: name.trim() },
                defaults: {
                    color_name: name.trim(),
                    status: 1
                }
            });

            if (created) {
                await systemLogController.record(
                    req,
                    "CREATE_COLOR",
                    `Đã tạo mới màu sắc sản phẩm: ${name.trim()}`,
                    "INFO"
                );
            }

            return res.status(created ? 201 : 200).json(color);
        } catch (error) {
            console.error("Sync color error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi đồng bộ màu sắc" });
        }
    }

    /**
     * Đồng bộ Material: Tìm theo tên, nếu không có thì tạo mới
     */
    async syncMaterial(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Tên chất liệu không được để trống" });

            const [material, created] = await ProductMaterial.findOrCreate({
                where: { material_name: name.trim() },
                defaults: {
                    material_name: name.trim(),
                    status: 1
                }
            });

            if (created) {
                await systemLogController.record(
                    req,
                    "CREATE_MATERIAL",
                    `Đã tạo mới chất liệu sản phẩm: ${name.trim()}`,
                    "INFO"
                );
            }

            return res.status(created ? 201 : 200).json(material);
        } catch (error) {
            console.error("Sync material error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi đồng bộ chất liệu" });
        }
    }

    /**
     * Đồng bộ Room: Tìm theo tên, nếu không có thì tạo mới
     */
    async syncRoom(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Tên phòng/khu vực không được để trống" });

            const [room, created] = await ProductRoom.findOrCreate({
                where: { room_name: name.trim() },
                defaults: {
                    room_name: name.trim(),
                    status: 1
                }
            });

            if (created) {
                await systemLogController.record(
                    req,
                    "CREATE_ROOM",
                    `Đã tạo mới phòng/khu vực: ${name.trim()}`,
                    "INFO"
                );
            }

            return res.status(created ? 201 : 200).json(room);
        } catch (error) {
            console.error("Sync room error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi đồng bộ phòng/khu vực" });
        }
    }
    /**
     * Lưu thuộc tính (Thêm mới hoặc Cập nhật)
     */
    async saveAttribute(req, res) {
        try {
            const { type } = req.params;
            const { id, name } = req.body;

            if (!name) return res.status(400).json({ message: "Tên không được để trống" });

            let model;
            let pkField;
            let searchField;
            let typeLabel;
            let logTypePrefix;

            switch (type) {
                case "category":
                    model = ProductCategory;
                    pkField = "pk_product_category_id";
                    searchField = "category_name";
                    typeLabel = "danh mục";
                    logTypePrefix = "CATEGORY";
                    break;
                case "color":
                    model = ProductColor;
                    pkField = "pk_product_color_id";
                    searchField = "color_name";
                    typeLabel = "màu sắc";
                    logTypePrefix = "COLOR";
                    break;
                case "material":
                    model = ProductMaterial;
                    pkField = "pk_product_material_id";
                    searchField = "material_name";
                    typeLabel = "chất liệu";
                    logTypePrefix = "MATERIAL";
                    break;
                case "room":
                    model = ProductRoom;
                    pkField = "pk_product_room_id";
                    searchField = "room_name";
                    typeLabel = "phòng/khu vực";
                    logTypePrefix = "ROOM";
                    break;
                default:
                    return res.status(400).json({ message: "Loại thuộc tính không hợp lệ" });
            }

            let result;
            let isCreated = false;

            if (id) {
                // Cập nhật theo ID
                const item = await model.findByPk(id);
                if (!item) return res.status(404).json({ message: `Không tìm thấy ${typeLabel} để cập nhật` });

                const oldName = item[searchField];
                await item.update({ [searchField]: name.trim(), status: 1 });
                result = item;

                await systemLogController.record(
                    req,
                    `UPDATE_${logTypePrefix}`,
                    `Đã cập nhật tên ${typeLabel} từ "${oldName}" thành "${name.trim()}"`,
                    "INFO"
                );
            } else {
                // Thêm mới hoặc Reactivate cái cũ
                // Sử dụng BINARY để so sánh chính xác từng dấu tiếng Việt
                const { sequelize } = model;
                const existingItem = await model.findOne({
                    where: sequelize.where(
                        sequelize.fn("BINARY", sequelize.col(searchField)),
                        name.trim()
                    )
                });

                if (existingItem) {
                    if (existingItem.status === 0) {
                        // Nếu bị ẩn thì hiện lại
                        await existingItem.update({ status: 1 });
                        result = existingItem;
                        isCreated = true;
                        
                        await systemLogController.record(
                            req,
                            `CREATE_${logTypePrefix}`,
                            `Đã khôi phục ${typeLabel}: ${name.trim()}`,
                            "INFO"
                        );
                    } else {
                        // Nếu đang hiện rồi thì trả về luôn (không tạo trùng)
                        result = existingItem;
                        return res.status(400).json({ message: `${typeLabel} này đã tồn tại trong danh sách` });
                    }
                } else {
                    // Tạo mới hoàn toàn
                    result = await model.create({
                        [searchField]: name.trim(),
                        status: 1
                    });
                    isCreated = true;

                    await systemLogController.record(
                        req,
                        `CREATE_${logTypePrefix}`,
                        `Đã tạo mới ${typeLabel}: ${name.trim()}`,
                        "INFO"
                    );
                }
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error("Save attribute error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi lưu thuộc tính" });
        }
    }

    /**
     * Xóa thuộc tính (Soft Delete)
     */
    async deleteAttribute(req, res) {
        try {
            const { type } = req.params;
            const { id, ids } = req.body;
            
            let model;
            let pkField;
            let searchField;
            let typeLabel;
            let logType;

            switch (type) {
                case "category":
                    model = ProductCategory;
                    pkField = "pk_product_category_id";
                    searchField = "category_name";
                    typeLabel = "danh mục";
                    logType = "DELETE_CATEGORY";
                    break;
                case "color":
                    model = ProductColor;
                    pkField = "pk_product_color_id";
                    searchField = "color_name";
                    typeLabel = "màu sắc";
                    logType = "DELETE_COLOR";
                    break;
                case "material":
                    model = ProductMaterial;
                    pkField = "pk_product_material_id";
                    searchField = "material_name";
                    typeLabel = "chất liệu";
                    logType = "DELETE_MATERIAL";
                    break;
                case "room":
                    model = ProductRoom;
                    pkField = "pk_product_room_id";
                    searchField = "room_name";
                    typeLabel = "phòng/khu vực";
                    logType = "DELETE_ROOM";
                    break;
                default:
                    return res.status(400).json({ message: "Loại thuộc tính không hợp lệ" });
            }

            // Ưu tiên ids (mảng), nếu không có thì lấy id (đơn lẻ)
            const targetIds = Array.isArray(ids) && ids.length
                ? ids.map(value => Number(value)).filter(Number.isInteger)
                : (id ? [Number(id)].filter(Number.isInteger) : []);

            if (!targetIds.length) {
                return res.status(400).json({ message: "Yêu cầu cung cấp id hoặc ids để xóa" });
            }

            const items = await model.findAll({ where: { [pkField]: targetIds } });
            if (!items.length) {
                return res.status(404).json({ message: `Không tìm thấy ${typeLabel} yêu cầu` });
            }

            await model.destroy({ where: { [pkField]: targetIds } });

            const itemNames = items.map(item => item[searchField]).join(", ");
            const deletedCount = items.length;

            await systemLogController.record(
                req,
                logType,
                `Đã xóa ${typeLabel}${deletedCount > 1 ? "s" : ""}: ${itemNames}`,
                "WARNING"
            );

            return res.status(200).json({
                message: `Đã xóa ${deletedCount} ${typeLabel} thành công`,
                deletedIds: items.map(item => item[pkField])
            });
        } catch (error) {
            console.error("Delete attribute error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi xóa thuộc tính" });
        }
    }
}

module.exports = new ProductAttributeController();
