const { Like, IsNull, Not } = require("typeorm");
const { randomUUID } = require("crypto");
const { AppDataSource } = require("../config/db");
const {
    ProductRepo,
    ProductCategoryRepo,
    SkuRepo,
    WarehouseInventoryRepo,
    WarehouseRepo,
    WoodTypeRepo,
    ColorRepo,
} = require("./base.controller");

/**
 * Accountant Controller
 * Quản lý sản phẩm & kho hàng cho Kế toán
 *
 * Created By: HieuNM
 * Created Date: 27/02/2026
 */

// Helper ghi SystemLog vào DB
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
 * Helper tự sinh SKU code ngắn gọn
 * Format: [4 ký tự đầu tên SP]-[WOOD_CODE]-[COLOR_CODE]-[SIZE]
 * Ví dụ: GHET-OAK-BRN-120X60
 * Tối đa ~30 ký tự, đảm bảo nhỏ hơn varchar(50)
 */
function normalizeStr(str, maxLen) {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d").replace(/\u0110/g, "D")
        .toUpperCase().trim()
        .replace(/\s+/g, "").replace(/[^A-Z0-9]/g, "")
        .slice(0, maxLen);
}

function generateSkuCode(productName, woodCode, colorCode, size) {
    const base = [
        normalizeStr(productName, 4) || "SKU",
        normalizeStr(woodCode, 5),
        normalizeStr(colorCode, 5),
        normalizeStr(size, 12),
    ].filter(Boolean).join("-");
    return base.slice(0, 40); // hard cap để còn chỗ suffix "-99"
}

/**
 * Sinh SKU code duy nhất – tự thêm suffix -01/-02/... nếu bị trùng
 */
async function generateUniqueSkuCode(productName, woodCode, colorCode, size, skuRepo) {
    const base = generateSkuCode(productName, woodCode, colorCode, size);
    // Kiểm tra trùng
    const existing = await skuRepo.findOne({ where: { sku_code: base } });
    if (!existing) return base;

    // Tìm suffix tiếp theo
    for (let i = 1; i <= 99; i++) {
        const candidate = `${base}-${String(i).padStart(2, "0")}`;
        const dup = await skuRepo.findOne({ where: { sku_code: candidate } });
        if (!dup) return candidate;
    }
    // Fallback với timestamp nếu tất cả đều trùng (hiếm gặp)
    return `${base}-${Date.now() % 10000}`;
}

/**
 * GET /accountant/dashboard/stats
 * Thống kê tổng quan kho hàng
 */
const getDashboardStats = async (req, res) => {
    try {
        const [totalProducts, totalSkus, totalCategories, totalWarehouses] = await Promise.all([
            ProductRepo.count(),
            SkuRepo.count(),
            ProductCategoryRepo.count(),
            WarehouseRepo.count(),
        ]);

        // Tổng tồn kho (quantity_available)
        const inventoryAgg = await AppDataSource
            .getRepository("WarehouseInventory")
            .createQueryBuilder("wi")
            .select("SUM(wi.quantity_available)", "totalQty")
            .addSelect("COUNT(wi.pk_warehouse_inventory_id)", "totalEntries")
            .getRawOne();

        const totalQty = parseInt(inventoryAgg?.totalQty || 0, 10);

        // SKU sắp hết hàng (quantity_available <= minimum_stock WHERE minimum_stock IS NOT NULL)
        const lowStockCount = await AppDataSource
            .getRepository("WarehouseInventory")
            .createQueryBuilder("wi")
            .where("wi.minimum_stock IS NOT NULL")
            .andWhere("wi.quantity_available <= wi.minimum_stock")
            .getCount();

        return res.status(200).json({
            totalProducts,
            totalSkus,
            totalCategories,
            totalWarehouses,
            totalInventoryQty: totalQty,
            lowStockCount,
        });
    } catch (error) {
        console.error("getDashboardStats Error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
    }
};

/**
 * GET /accountant/products
 * Lấy danh sách sản phẩm kèm SKU & tồn kho
 */
const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", categoryId = "" } = req.query;
        const skip = (page - 1) * limit;

        const qb = ProductRepo.createQueryBuilder("p")
            .leftJoinAndSelect("p.productCategory", "pc")
            .leftJoinAndSelect("p.skus", "s")
            .leftJoinAndSelect("s.warehouseInventories", "wi")
            .leftJoinAndSelect("s.woodType", "wt")
            .leftJoinAndSelect("s.color", "c")
            .orderBy("p.created_at", "DESC")
            .take(Number(limit))
            .skip(Number(skip));

        if (search) {
            qb.andWhere("p.product_name LIKE :search", { search: `%${search}%` });
        }

        if (categoryId) {
            qb.andWhere("pc.pk_product_category_id = :categoryId", { categoryId });
        }

        const [items, total] = await qb.getManyAndCount();

        return res.status(200).json({
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        console.error("getAllProducts Error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
    }
};

/**
 * PUT /accountant/products/:id
 * Cập nhật sản phẩm
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, purchase_price, selling_price, product_status, product_img } = req.body;

        const product = await ProductRepo.findOne({ where: { pk_product_id: id } });
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        const oldName = product.product_name;
        if (product_name) product.product_name = product_name;
        if (purchase_price !== undefined) product.purchase_price = purchase_price;
        if (selling_price !== undefined) product.selling_price = selling_price;
        if (product_status) product.product_status = product_status;
        if (product_img !== undefined) product.product_img = product_img || null;

        await ProductRepo.save(product);

        await writeSystemLog(AppDataSource.manager, {
            description: `Cập nhật sản phẩm: "${oldName}" → "${product.product_name}" (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Cập nhật thành công", item: product });
    } catch (error) {
        console.error("updateProduct Error:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm" });
    }
};

/**
 * DELETE /accountant/products/:id
 * Xóa sản phẩm
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductRepo.findOne({ where: { pk_product_id: id } });
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        await ProductRepo.delete(id);

        await writeSystemLog(AppDataSource.manager, {
            description: `Xóa sản phẩm: "${product.product_name}" (ID: ${id})`,
            actorAccount: req.user,
        });

        return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
        console.error("deleteProduct Error:", error);
        return res.status(500).json({ message: "Lỗi server khi xóa sản phẩm (có thể đang được sử dụng)" });
    }
};

/**
 * POST /accountant/import-stock
 * Nhập hàng batch – hỗ trợ cả sản phẩm mới & sản phẩm có sẵn
 *
 * Body: {
 *   warehouseId: string,
 *   lines: [
 *     // Sản phẩm có sẵn (chỉ thêm tồn kho)
 *     { type: "existing", skuId: string, quantity: number, purchasePrice?: number }
 *     // Sản phẩm mới
 *     { type: "new", productName: string, categoryId: string,
 *       woodTypeId?: string, colorId?: string, size?: string,
 *       sellingPrice?: number, purchasePrice?: number, quantity: number }
 *   ]
 * }
 */
const importStock = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { warehouseId, lines = [] } = req.body;

        if (!warehouseId) {
            return res.status(400).json({ message: "Thiếu thông tin kho (warehouseId)" });
        }
        if (!lines.length) {
            return res.status(400).json({ message: "Danh sách nhập hàng rỗng" });
        }

        // Validate warehouse
        const warehouse = await WarehouseRepo.findOne({ where: { pk_warehouse_id: warehouseId } });
        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy kho" });
        }

        const logDetails = [];

        for (const line of lines) {
            const qty = Number(line.quantity);
            if (!qty || qty <= 0) continue;

            if (line.type === "existing") {
                // ---- Sản phẩm & SKU có sẵn ----
                const sku = await SkuRepo.findOne({ where: { pk_sku_id: line.skuId } });
                if (!sku) continue;

                // Tìm hoặc tạo WarehouseInventory
                let inv = await queryRunner.manager.getRepository("WarehouseInventory").findOne({
                    where: {
                        sku: { pk_sku_id: line.skuId },
                        warehouse: { pk_warehouse_id: warehouseId },
                    },
                    relations: ["sku", "warehouse"],
                });

                if (inv) {
                    inv.quantity_available = (inv.quantity_available || 0) + qty;
                    await queryRunner.manager.getRepository("WarehouseInventory").save(inv);
                } else {
                    const newInv = queryRunner.manager.getRepository("WarehouseInventory").create({
                        pk_warehouse_inventory_id: randomUUID(),
                        quantity_available: qty,
                        quantity_reserved: 0,
                        quantity_defect: 0,
                        sku: { pk_sku_id: line.skuId },
                        warehouse: { pk_warehouse_id: warehouseId },
                    });
                    await queryRunner.manager.getRepository("WarehouseInventory").save(newInv);
                }

                if (line.purchasePrice !== undefined) {
                    await queryRunner.manager.getRepository("Product").createQueryBuilder()
                        .innerJoin("Sku", "s", "s.fk_product_id = product.pk_product_id")
                        .update()
                        .set({ purchase_price: line.purchasePrice })
                        .where("s.pk_sku_id = :skuId", { skuId: line.skuId })
                        .execute();
                }

                logDetails.push(`SKU "${sku.sku_code}" +${qty}`);

            } else if (line.type === "new") {
                // ---- Tạo sản phẩm mới ----
                const { productName, categoryId, woodTypeId, colorId, size, sellingPrice, purchasePrice, productImg } = line;
                if (!productName) continue;

                // Lấy codes để sinh SKU
                let woodCode = "";
                let colorCode = "";
                if (woodTypeId) {
                    const wt = await WoodTypeRepo.findOne({ where: { pk_wood_type_id: woodTypeId } });
                    woodCode = wt?.wood_code || "";
                }
                if (colorId) {
                    const col = await ColorRepo.findOne({ where: { pk_color_id: colorId } });
                    colorCode = col?.color_code || "";
                }

                const skuCode = await generateUniqueSkuCode(
                    productName, woodCode, colorCode, size || "", SkuRepo
                );

                // Tạo Product
                const newProduct = queryRunner.manager.getRepository("Product").create({
                    pk_product_id: randomUUID(),
                    product_name: productName,
                    product_status: "ACTIVE",
                    purchase_price: purchasePrice || null,
                    selling_price: sellingPrice || null,
                    product_img: productImg || null,
                    productCategory: categoryId ? { pk_product_category_id: categoryId } : null,
                });
                const savedProduct = await queryRunner.manager.getRepository("Product").save(newProduct);

                // Tạo SKU
                const newSku = queryRunner.manager.getRepository("Sku").create({
                    pk_sku_id: randomUUID(),
                    sku_code: skuCode,
                    sku_status: "ACTIVE",
                    size: size || null,
                    product: { pk_product_id: savedProduct.pk_product_id },
                    woodType: woodTypeId ? { pk_wood_type_id: woodTypeId } : null,
                    color: colorId ? { pk_color_id: colorId } : null,
                });
                const savedSku = await queryRunner.manager.getRepository("Sku").save(newSku);

                // Tạo WarehouseInventory
                const newInv = queryRunner.manager.getRepository("WarehouseInventory").create({
                    pk_warehouse_inventory_id: randomUUID(),
                    quantity_available: qty,
                    quantity_reserved: 0,
                    quantity_defect: 0,
                    sku: { pk_sku_id: savedSku.pk_sku_id },
                    warehouse: { pk_warehouse_id: warehouseId },
                });
                await queryRunner.manager.getRepository("WarehouseInventory").save(newInv);

                logDetails.push(`Sản phẩm mới "${productName}" (SKU: ${skuCode}) +${qty}`);
            }
        }

        // Ghi một SystemLog tổng hợp
        await writeSystemLog(queryRunner.manager, {
            description: `Nhập hàng vào kho "${warehouse.warehouse_name}": ${logDetails.join(", ")}`,
            actorAccount: req.user,
        });

        await queryRunner.commitTransaction();

        return res.status(200).json({ message: "Nhập hàng thành công", details: logDetails });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("importStock Error:", error);
        return res.status(500).json({ message: "Lỗi server khi nhập hàng" });
    } finally {
        await queryRunner.release();
    }
};

/**
 * GET /accountant/warehouses
 * Lấy danh sách kho để hiển thị trong dropdown
 */
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await WarehouseRepo.find({
            where: { warehouse_status: "ACTIVE" },
            order: { warehouse_name: "ASC" },
        });
        return res.status(200).json(warehouses);
    } catch (error) {
        console.error("getWarehouses Error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách kho" });
    }
};

module.exports = {
    getDashboardStats,
    getAllProducts,
    updateProduct,
    deleteProduct,
    importStock,
    getWarehouses,
};
