const { Op } = require("sequelize");
const { sequelize, Product, ProductCategory, ProductColor, ProductMaterial, ProductRoom, ProductPricing, ProductItem } = require("../entities");

/**
 * Inventory Controller - Quản lý Kho hàng cho Kế toán
 * Created By: Hieunm
 * Created Date: 2026-04-26
 */
class InventoryController {
  /**
   * Lấy danh sách sản phẩm trong kho kèm chi tiết số lượng
   */
  async getInventoryProducts(req, res) {
    try {
      const { search, category, typeFilter, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const andConditions = [{ product_status: 1 }];

      // Filter by type
      if (typeFilter && typeFilter !== "ALL" && typeFilter !== "LOW_STOCK" && typeFilter !== "LONG_STAY" && typeFilter !== "DEFECTIVE") {
        andConditions.push({ product_type: typeFilter });
      }

      // Filter by search
      if (search) {
        const searchTerm = `%${search}%`;
        andConditions.push({
          [Op.or]: [
            { product_name: { [Op.like]: searchTerm } },
            { sku: { [Op.like]: searchTerm } },
            { "$category.category_name$": { [Op.like]: searchTerm } },
            { "$material.material_name$": { [Op.like]: searchTerm } },
          ],
        });
      }

      const where = { [Op.and]: andConditions };

      // Filter by category (by exact name based on frontend mock)
      const categoryInclude = {
        model: ProductCategory,
        as: "category",
        attributes: ["category_name"],
      };
      if (category && category !== "Tất cả") {
        categoryInclude.where = { category_name: category };
      }

      // Literal for counting items
      // Chỉ đếm item còn trong kho (loại trừ status=0: đã xử lý/xuất kho)
      const stockLiteral = sequelize.literal(`(
        SELECT COUNT(*) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
        AND product_item.item_status != 0
      )`);

      const availableLiteral = sequelize.literal(`(
        SELECT COUNT(*) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
        AND product_item.item_status = 1
        AND product_item.fk_order_item_id IS NULL
      )`);

      const defectiveLiteral = sequelize.literal(`(
        SELECT COUNT(*) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
        AND product_item.item_status = 3
      )`);

      const deliveringLiteral = sequelize.literal(`(
        SELECT COUNT(*) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
        AND (product_item.item_status = 2 OR (product_item.item_status = 1 AND product_item.fk_order_item_id IS NOT NULL))
      )`);

      // We assume item_status = 4 is processing, else 0
      const processingLiteral = sequelize.literal(`(
        SELECT COUNT(*) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
        AND product_item.item_status = 4
      )`);

      // Ngày nhập kho sớm nhất (chỉ lấy item còn trong kho)
      const importedAtLiteral = sequelize.literal(`(
        SELECT MIN(createdate) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
        AND product_item.item_status != 0
      )`);

      const queryOptions = {
        where,
        attributes: [
          "pk_product_id",
          "sku",
          "product_name",
          "product_img",
          "product_type",
          "size",
          "description",
          "warranty_months",
          "is_gift",
          "is_bundle",
          "bundle_items",
          "min_stock",
          [stockLiteral, "stock"],
          [availableLiteral, "available"],
          [defectiveLiteral, "defective"],
          [deliveringLiteral, "delivering"],
          [processingLiteral, "processing"],
          [importedAtLiteral, "importedAt"]
        ],
        include: [
          categoryInclude,
          {
            model: ProductColor,
            as: "color",
            attributes: ["color_name"],
          },
          {
            model: ProductMaterial,
            as: "material",
            attributes: ["material_name"],
          },
          {
            model: ProductRoom,
            as: "room",
            attributes: ["room_name"],
            required: false,
          },
        ],
        order: [[sequelize.col("Product.createdate"), "DESC"]],
        subQuery: false,
        distinct: true,
      };

      // Query data without limit/offset to handle custom logic filtering if needed
      let rows = await Product.findAll(queryOptions);

      // Map to frontend expected format
      let formattedData = rows.map((product) => {
        const p = product.toJSON();
        return {
          id: p.pk_product_id,
          sku: p.sku,
          name: p.product_name,
          category: p.category ? p.category.category_name : null,
          type: p.product_type || "FINISHED",
          materialType: p.material ? p.material.material_name : null,
          color: p.color ? p.color.color_name : null,
          room: p.room ? p.room.room_name : null,
          img: p.product_img,
          // Kích thước (size JSON)
          length: p.size?.length || null,
          width: p.size?.width || null,
          height: p.size?.height || null,
          sizeUnit: p.size?.unit || "cm",
          sizeNote: p.size?.note || null,
          // Thông tin sản phẩm
          details: p.description || null,
          warrantyMonths: p.warranty_months || null,
          isGift: p.is_gift === 1,
          isBundle: p.is_bundle === 1,
          bundleItems: p.bundle_items || null,
          stock: parseInt(p.stock) || 0,
          stockBreakdown: {
            available: parseInt(p.available) || 0,
            processing: parseInt(p.processing) || 0,
            defective: parseInt(p.defective) || 0,
            delivering: parseInt(p.delivering) || 0,
          },
          importedAt: p.importedAt,
          minStock: p.min_stock || 0,
        };
      });

      // Calculate counts for pills before applying typeFilter
      const counts = {
        ALL: formattedData.length,
        FINISHED: 0,
        RAW: 0,
        CUSTOM: 0,
        LOW_STOCK: 0,
        LONG_STAY: 0,
        DEFECTIVE: 0,
      };

      const TODAY = new Date();
      const LONG_STAY_DAYS = 60;

      formattedData.forEach(p => {
        if (p.type === "FINISHED") counts.FINISHED++;
        else if (p.type === "RAW") counts.RAW++;
        else if (p.type === "CUSTOM") counts.CUSTOM++;

        if (p.type === "FINISHED" && p.stockBreakdown.available <= p.minStock) {
          counts.LOW_STOCK++;
        }

        if (p.importedAt) {
          const daysOld = Math.floor((TODAY - new Date(p.importedAt)) / (1000 * 60 * 60 * 24));
          if (daysOld > LONG_STAY_DAYS) counts.LONG_STAY++;
        }

        if (p.stockBreakdown.defective > 0) {
          counts.DEFECTIVE++;
        }
      });

      // Special frontend filters: LOW_STOCK, LONG_STAY, DEFECTIVE
      if (typeFilter === "LOW_STOCK") {
        formattedData = formattedData.filter(p => p.type === "FINISHED" && p.stockBreakdown.available <= p.minStock);
      } else if (typeFilter === "LONG_STAY") {
        formattedData = formattedData.filter(p => {
          if (!p.importedAt) return false;
          const importDate = new Date(p.importedAt);
          const daysOld = Math.floor((TODAY - importDate) / (1000 * 60 * 60 * 24));
          return daysOld > LONG_STAY_DAYS;
        });
      } else if (typeFilter === "DEFECTIVE") {
        formattedData = formattedData.filter(p => p.stockBreakdown.defective > 0);
      }

      // Manual pagination because we filtered in JS
      const totalItems = formattedData.length;
      const paginatedData = formattedData.slice(offset, offset + parseInt(limit));

      return res.status(200).json({
        data: paginatedData,
        counts: counts,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get inventory products error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách kho hàng" });
    }
  }

  /**
   * Cập nhật trạng thái từng đơn vị sản phẩm (Báo lỗi / Bỏ báo lỗi)
   */
  async updateItemStatus(req, res) {
    try {
      const { itemSerial } = req.params;
      const { status, note } = req.body;

      // status nhận: "AVAILABLE" | "DEFECTIVE"
      const statusMap = {
        AVAILABLE: 1,
        DEFECTIVE: 3,
        PENDING_DELIVERY: 2,
        PROCESSING: 4,
      };

      const dbStatus = statusMap[status];
      if (dbStatus === undefined) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      const item = await ProductItem.findOne({ where: { item_serial: itemSerial } });
      if (!item) {
        return res.status(404).json({ message: "Không tìm thấy đơn vị sản phẩm" });
      }

      await item.update({
        item_status: dbStatus,
        note: note || item.note,
        modifiedate: new Date(),
      });

      return res.status(200).json({ message: "Cập nhật trạng thái thành công", item });
    } catch (error) {
      console.error("Update item status error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái đơn vị" });
    }
  }

  /**
   * Xử lý hàng lỗi: RETURN (trả NCC), SCRAP (thanh lý), WRITE_OFF (xuất hủy)
   * Tất cả đều xóa item khỏi kho (đặt status = 0 - Đã xử lý)
   */
  async processDefectiveItems(req, res) {
    try {
      const { unitIds, processType, scrapPrice, note } = req.body;
      if (!unitIds || unitIds.length === 0) {
        return res.status(400).json({ message: "Danh sách đơn vị cần xử lý không được rỗng" });
      }

      const validTypes = ["RETURN", "SCRAP", "WRITE_OFF"];
      if (!validTypes.includes(processType)) {
        return res.status(400).json({ message: "Phương thức xử lý không hợp lệ" });
      }

      // Tìm các item theo item_serial
      const items = await ProductItem.findAll({
        where: { item_serial: unitIds },
      });

      if (items.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy các đơn vị sản phẩm cần xử lý" });
      }

      // Cập nhật: đặt item_status = 0 (Đã xử lý/xuất kho) và ghi note
      const processNote = [
        `[${processType}]`,
        processType === "SCRAP" && scrapPrice ? `Giá thanh lý: ${scrapPrice}đ` : null,
        note || null,
      ].filter(Boolean).join(" – ");

      for (const item of items) {
        await item.update({
          item_status: 0, // 0: Đã xử lý/xuất khỏi kho
          note: processNote,
          modifiedate: new Date(),
        });
      }

      return res.status(200).json({
        message: `Đã xử lý ${items.length} đơn vị hàng lỗi thành công`,
        processType,
        count: items.length,
      });
    } catch (error) {
      console.error("Process defective items error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xử lý hàng lỗi" });
    }
  }

  /**
   * Lấy chi tiết từng đơn vị sản phẩm (ProductItem) của một sản phẩm
   */
  async getProductItems(req, res) {
    try {
      const { id } = req.params;
      const items = await ProductItem.findAll({
        where: {
          fk_product_id: id,
          item_status: { [Op.ne]: 0 }, // Loại trừ item đã xử lý/xuất kho
        },
        order: [["createdate", "DESC"]],
      });

      // Map sang format frontend mong muốn (lot > units)
      // Hiện tại frontend ViewProductModal hỗ trợ nhận lots array
      const units = items.map(item => {
        let status = "AVAILABLE";
        if (item.item_status === 1 && item.fk_order_item_id !== null) status = "PENDING_DELIVERY";
        else if (item.item_status === 2) status = "PENDING_DELIVERY";
        else if (item.item_status === 3) status = "DEFECTIVE";
        else if (item.item_status === 4) status = "PROCESSING";

        return {
          unitId: item.item_serial || `UNIT-${item.pk_item_id}`,
          status: status,
          importDate: item.createdate,
          importPrice: parseFloat(item.cost_price) || null,
          importReceiptId: item.batch_code || null,
        };
      });

      // Gói tất cả vào 1 lot ảo hoặc group theo batch_code
      const lotsMap = {};
      units.forEach(u => {
        const key = u.importReceiptId || "NO_RECEIPT";
        if (!lotsMap[key]) {
          lotsMap[key] = {
            lotId: `LOT-${key}`,
            importReceiptId: u.importReceiptId,
            importDate: u.importDate,
            importPrice: u.importPrice,
            units: []
          };
        }
        lotsMap[key].units.push(u);
      });

      const lots = Object.values(lotsMap);

      return res.status(200).json(lots);
    } catch (error) {
      console.error("Get product items error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết đơn vị sản phẩm" });
    }
  }

  /**
   * Tổng quan kho hàng – Dashboard
   * Trả về KPI, cảnh báo hàng dưới định mức, tồn lâu, nhập hàng gần đây
   */
  async getDashboardStats(req, res) {
    try {
      const MIN_STOCK = 2;      // Ngưỡng tồn tối thiểu (cố định)
      const LONG_STAY_DAYS = 60; // Ngày tồn lâu

      // ── 1. KPI: tổng sản phẩm, phân loại ──────────────────────
      const allProducts = await Product.findAll({
        where: { product_status: 1 },
        attributes: [
          "pk_product_id", "sku", "product_name", "product_type",
          "product_img", "size", "min_stock",
          [sequelize.literal(`(
            SELECT COUNT(*) FROM product_item
            WHERE product_item.fk_product_id = Product.pk_product_id
            AND product_item.item_status != 0
          )`), "stock"],
          [sequelize.literal(`(
            SELECT COUNT(*) FROM product_item
            WHERE product_item.fk_product_id = Product.pk_product_id
            AND product_item.item_status = 1
            AND product_item.fk_order_item_id IS NULL
          )`), "available"],
          [sequelize.literal(`(
            SELECT COUNT(*) FROM product_item
            WHERE product_item.fk_product_id = Product.pk_product_id
            AND product_item.item_status = 3
          )`), "defective"],
          [sequelize.literal(`(
            SELECT MIN(createdate) FROM product_item
            WHERE product_item.fk_product_id = Product.pk_product_id
            AND product_item.item_status != 0
          )`), "importedAt"],
        ],
        include: [
          { model: ProductCategory, as: "category", attributes: ["category_name"], required: false },
          { model: ProductColor,    as: "color",    attributes: ["color_name"],    required: false },
          { model: ProductMaterial, as: "material", attributes: ["material_name"], required: false },
          { model: ProductRoom,     as: "room",     attributes: ["room_name"],     required: false },
        ],
        order: [["createdate", "DESC"]],
        subQuery: false,
      });

      const TODAY = new Date();
      const LONG_STAY_MS = LONG_STAY_DAYS * 24 * 60 * 60 * 1000;

      // Map và tính toán
      const mapped = allProducts.map((p) => {
        const j = p.toJSON();
        const stock     = parseInt(j.stock)     || 0;
        const available = parseInt(j.available) || 0;
        const defective = parseInt(j.defective) || 0;
        const daysOld = j.importedAt
          ? Math.floor((TODAY - new Date(j.importedAt)) / (24 * 60 * 60 * 1000))
          : null;
        return {
          id: j.pk_product_id,
          sku: j.sku,
          name: j.product_name,
          type: j.product_type || "FINISHED",
          img: j.product_img,
          category: j.category?.category_name || null,
          color: j.color?.color_name || null,
          materialType: j.material?.material_name || null,
          room: j.room?.room_name || null,
          stock,
          available,
          defective,
          minStock: j.min_stock || 0,
          importedAt: j.importedAt,
          daysOld,
        };
      });

      // KPI counts
      const totalProducts   = mapped.length;
      const totalStock      = mapped.reduce((s, p) => s + p.stock, 0);
      const finishedCount   = mapped.filter(p => p.type === "FINISHED").length;
      const rawCount        = mapped.filter(p => p.type === "RAW").length;
      const customCount     = mapped.filter(p => p.type === "CUSTOM").length;
      const defectiveCount  = mapped.filter(p => p.defective > 0).length;

      // Cảnh báo hàng dưới định mức (FINISHED, available <= minStock)
      const lowStockProducts = mapped
        .filter(p => p.type === "FINISHED" && p.available <= p.minStock)
        .slice(0, 20);

      // Hàng tồn lâu (> 60 ngày)
      const longStayProducts = mapped
        .filter(p => p.daysOld !== null && p.daysOld > LONG_STAY_DAYS)
        .slice(0, 20);

      // ── 2. Nhập hàng gần đây: tách 2 query để tránh ONLY_FULL_GROUP_BY ─
      // Bước 1: GROUP BY không JOIN
      const recentBatches = await ProductItem.findAll({
        attributes: [
          "batch_code",
          "fk_product_id",
          [sequelize.fn("MIN", sequelize.col("createdate")), "import_date"],
          [sequelize.fn("COUNT", sequelize.col("pk_item_id")), "qty"],
          [sequelize.fn("SUM", sequelize.col("cost_price")),  "total_price"],
        ],
        where: { batch_code: { [Op.ne]: null } },
        group: ["batch_code", "fk_product_id"],
        order: [[sequelize.fn("MIN", sequelize.col("createdate")), "DESC"]],
        limit: 8,
      });

      // Bước 2: Lấy thông tin Product cho các fk_product_id đã có
      const productIds = [...new Set(recentBatches.map(b => b.fk_product_id))];
      const productsForImport = await Product.findAll({
        where: { pk_product_id: productIds },
        attributes: ["pk_product_id", "product_name", "sku"],
      });
      const productMap = {};
      productsForImport.forEach(p => { productMap[p.pk_product_id] = p; });

      const recentImports = recentBatches.map(b => {
        const j = b.toJSON();
        const prod = productMap[j.fk_product_id];
        return {
          code: j.batch_code,
          date: j.import_date,
          product: prod?.product_name || "—",
          sku: prod?.sku || "—",
          qty: parseInt(j.qty) || 0,
          totalPrice: parseFloat(j.total_price) || 0,
        };
      });

      // ── 3. Thống kê danh mục ───────────────────────────────────
      const categoryCount = await ProductCategory.count();

      return res.status(200).json({
        kpi: {
          totalProducts,
          totalStock,
          finishedCount,
          rawCount,
          customCount,
          defectiveCount,
          lowStockCount: lowStockProducts.length,
          longStayCount: longStayProducts.length,
          categoryCount,
        },
        lowStockProducts,
        longStayProducts,
        recentImports,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy thống kê kho hàng" });
    }
  }

  /**
   * Cập nhật định mức tồn kho tối thiểu (min_stock)
   */
  async updateMinStock(req, res) {
    try {
      const { id } = req.params;
      const { minStock, imgUrl } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      const updateData = {
        modifiedate: new Date(),
        modifieby: req.user.userId
      };

      if (minStock !== undefined) {
        updateData.min_stock = minStock;
      }

      // Cập nhật ảnh nếu có (imgUrl = null → xóa ảnh, imgUrl = URL → cập nhật ảnh)
      if (imgUrl !== undefined) {
        updateData.product_img = imgUrl;
      }

      await product.update(updateData);

      return res.status(200).json({ 
        message: "Cập nhật sản phẩm thành công", 
        data: { minStock: product.min_stock, img: product.product_img } 
      });
    } catch (error) {
      console.error("Update min stock error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật sản phẩm" });
    }
  }
}

module.exports = new InventoryController();
