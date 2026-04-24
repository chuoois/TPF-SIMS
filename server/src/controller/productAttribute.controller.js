const { ProductCategory, ProductColor, ProductMaterial, ProductRoom } = require("../entities");
const systemLogController = require("./systemLog.controller");

/**
 * ProductAttributeController
 * Quản lý danh mục, màu sắc, chất liệu sản phẩm
 * Cung cấp API list và tự động thêm mới (findOrCreate)
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */
class ProductAttributeController {
    /**
     * Lấy tất cả thuộc tính sản phẩm trong một lần gọi
     */
    async getAllAttributes(req, res) {
        try {
            const [categories, colors, materials, rooms] = await Promise.all([
                ProductCategory.findAll({ where: { status: 1 }, order: [["category_name", "ASC"]] }),
                ProductColor.findAll({ where: { status: 1 }, order: [["color_name", "ASC"]] }),
                ProductMaterial.findAll({ where: { status: 1 }, order: [["material_name", "ASC"]] }),
                ProductRoom.findAll({ where: { status: 1 }, order: [["room_name", "ASC"]] })
            ]);

            return res.status(200).json({
                categories,
                colors,
                materials,
                rooms
            });
        } catch (error) {
            console.error("Get all attributes error:", error);
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
}

module.exports = new ProductAttributeController();
