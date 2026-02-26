const { Like } = require("typeorm");
const { randomUUID } = require("crypto");
const { AppDataSource } = require("../config/db");
const { WoodTypeRepo, ProductCategoryRepo, ColorRepo } = require("./base.controller");

/**
 * Helper ghi SystemLog vào DB
 */
const writeSystemLog = async (manager, { description, actorAccount }) => {
    const logRepo = manager.getRepository("SystemLog");
    const log = logRepo.create({
        pk_system_log_id: randomUUID(),
        description,
        modified_by: actorAccount?.fullName ?? actorAccount?.email ?? "unknown",
        userAccount: actorAccount ? { pk_user_account_id: actorAccount.id } : null,
    });
    await logRepo.save(log);
};

/**
 * Wood Type CRUD
 */
const getAllWoodTypes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? [
            { wood_code: Like(`%${search}%`) },
            { wood_name: Like(`%${search}%`) }
        ] : {};

        const [items, total] = await WoodTypeRepo.findAndCount({
            where,
            order: { created_at: "DESC" },
            take: Number(limit),
            skip: Number(skip),
        });

        return res.status(200).json({
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Get All Wood Types Error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách loại gỗ" });
    }
};

const createWoodType = async (req, res) => {
    try {
        const { wood_code, wood_name } = req.body;

        const existing = await WoodTypeRepo.findOne({ where: { wood_code } });
        if (existing) {
            return res.status(400).json({ message: "Mã loại gỗ đã tồn tại" });
        }

        const newItem = WoodTypeRepo.create({
            pk_wood_type_id: randomUUID(),
            wood_code,
            wood_name,
            wood_status: "ACTIVE"
        });

        await WoodTypeRepo.save(newItem);

        await writeSystemLog(AppDataSource.manager, {
            description: `Tạo loại gỗ mới: ${wood_name} (${wood_code})`,
            actorAccount: req.user,
        });

        return res.status(201).json({ message: "Tạo loại gỗ thành công", item: newItem });
    } catch (error) {
        console.error("Create Wood Type Error:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo loại gỗ" });
    }
};

const updateWoodType = async (req, res) => {
    try {
        const { id } = req.params;
        const { wood_name, wood_status } = req.body;

        const item = await WoodTypeRepo.findOne({ where: { pk_wood_type_id: id } });
        if (!item) {
            return res.status(404).json({ message: "Không tìm thấy loại gỗ" });
        }

        const oldName = item.wood_name;
        if (wood_name) item.wood_name = wood_name;
        if (wood_status) item.wood_status = wood_status;

        await WoodTypeRepo.save(item);

        await writeSystemLog(AppDataSource.manager, {
            description: `Cập nhật loại gỗ: ${oldName} -> ${item.wood_name} (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Cập nhật thành công", item });
    } catch (error) {
        console.error("Update Wood Type Error:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật loại gỗ" });
    }
};

const deleteWoodType = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await WoodTypeRepo.findOne({ where: { pk_wood_type_id: id } });

        const result = await WoodTypeRepo.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Không tìm thấy loại gỗ" });
        }

        await writeSystemLog(AppDataSource.manager, {
            description: `Xóa loại gỗ: ${item?.wood_name || id} (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        console.error("Delete Wood Type Error:", error);
        return res.status(500).json({ message: "Lỗi server khi xóa loại gỗ (có thể đang được sử dụng)" });
    }
};

/**
 * Product Category CRUD
 */
const getAllCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? [
            { category_code: Like(`%${search}%`) },
            { category_name: Like(`%${search}%`) }
        ] : {};

        const [items, total] = await ProductCategoryRepo.findAndCount({
            where,
            order: { created_at: "DESC" },
            take: Number(limit),
            skip: Number(skip),
        });

        return res.status(200).json({
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Get All Categories Error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh mục sản phẩm" });
    }
};

const createCategory = async (req, res) => {
    try {
        const { category_code, category_name, category_status } = req.body;

        const existing = await ProductCategoryRepo.findOne({ where: { category_code } });
        if (existing) {
            return res.status(400).json({ message: "Mã danh mục đã tồn tại" });
        }

        const newItem = ProductCategoryRepo.create({
            pk_product_category_id: randomUUID(),
            category_code,
            category_name,
            category_status: category_status || "ACTIVE"
        });

        await ProductCategoryRepo.save(newItem);

        await writeSystemLog(AppDataSource.manager, {
            description: `Tạo danh mục sản phẩm mới: ${category_name} (${category_code})`,
            actorAccount: req.user,
        });

        return res.status(201).json({ message: "Tạo danh mục thành công", item: newItem });
    } catch (error) {
        console.error("Create Category Error:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo danh mục" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, category_status } = req.body;

        const item = await ProductCategoryRepo.findOne({ where: { pk_product_category_id: id } });
        if (!item) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        const oldName = item.category_name;
        if (category_name) item.category_name = category_name;
        if (category_status) item.category_status = category_status;

        await ProductCategoryRepo.save(item);

        await writeSystemLog(AppDataSource.manager, {
            description: `Cập nhật danh mục sản phẩm: ${oldName} -> ${item.category_name} (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Cập nhật thành công", item });
    } catch (error) {
        console.error("Update Category Error:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật danh mục" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await ProductCategoryRepo.findOne({ where: { pk_product_category_id: id } });

        const result = await ProductCategoryRepo.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        await writeSystemLog(AppDataSource.manager, {
            description: `Xóa danh mục sản phẩm: ${item?.category_name || id} (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        console.error("Delete Category Error:", error);
        return res.status(500).json({ message: "Lỗi server khi xóa danh mục (có thể đang được sử dụng)" });
    }
};

/**
 * Color CRUD
 */
const getAllColors = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;

        const where = search ? [
            { color_code: Like(`%${search}%`) },
            { color_name: Like(`%${search}%`) }
        ] : {};

        const [items, total] = await ColorRepo.findAndCount({
            where,
            order: { created_at: "DESC" },
            take: Number(limit),
            skip: Number(skip),
        });

        return res.status(200).json({
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Get All Colors Error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách màu" });
    }
};

const createColor = async (req, res) => {
    try {
        const { color_code, color_name } = req.body;

        const existing = await ColorRepo.findOne({ where: { color_code } });
        if (existing) {
            return res.status(400).json({ message: "Mã màu đã tồn tại" });
        }

        const newItem = ColorRepo.create({
            pk_color_id: randomUUID(),
            color_code,
            color_name,
            color_status: "ACTIVE"
        });

        await ColorRepo.save(newItem);

        await writeSystemLog(AppDataSource.manager, {
            description: `Tạo màu mới: ${color_name} (${color_code})`,
            actorAccount: req.user,
        });

        return res.status(201).json({ message: "Tạo màu thành công", item: newItem });
    } catch (error) {
        console.error("Create Color Error:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo màu" });
    }
};

const updateColor = async (req, res) => {
    try {
        const { id } = req.params;
        const { color_name, color_status } = req.body;

        const item = await ColorRepo.findOne({ where: { pk_color_id: id } });
        if (!item) {
            return res.status(404).json({ message: "Không tìm thấy màu" });
        }

        const oldName = item.color_name;
        if (color_name) item.color_name = color_name;
        if (color_status) item.color_status = color_status;

        await ColorRepo.save(item);

        await writeSystemLog(AppDataSource.manager, {
            description: `Cập nhật màu: ${oldName} -> ${item.color_name} (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Cập nhật thành công", item });
    } catch (error) {
        console.error("Update Color Error:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật màu" });
    }
};

const deleteColor = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await ColorRepo.findOne({ where: { pk_color_id: id } });

        const result = await ColorRepo.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Không tìm thấy màu" });
        }

        await writeSystemLog(AppDataSource.manager, {
            description: `Xóa màu: ${item?.color_name || id} (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        console.error("Delete Color Error:", error);
        return res.status(500).json({ message: "Lỗi server khi xóa màu (có thể đang được sử dụng)" });
    }
};

module.exports = {
    getAllWoodTypes,
    createWoodType,
    updateWoodType,
    deleteWoodType,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllColors,
    createColor,
    updateColor,
    deleteColor,
};

