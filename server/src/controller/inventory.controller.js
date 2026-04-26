const { Op } = require("sequelize");
const { sequelize, Product, ProductCategory, ProductColor, ProductMaterial, ProductRoom, ProductItem } = require("../entities");

/**
 * Inventory Controller - Quản lý Kho hàng cho Kế toán
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
      const stockLiteral = sequelize.literal(`(
        SELECT COUNT(*) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
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

      // Earliest import date
      const importedAtLiteral = sequelize.literal(`(
        SELECT MIN(createdate) FROM product_item
        WHERE product_item.fk_product_id = Product.pk_product_id
      )`);

      const queryOptions = {
        where,
        attributes: [
          "pk_product_id",
          "sku",
          "product_name",
          "product_img",
          "product_type",
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
          img: p.product_img,
          stock: parseInt(p.stock) || 0,
          stockBreakdown: {
            available: parseInt(p.available) || 0,
            processing: parseInt(p.processing) || 0,
            defective: parseInt(p.defective) || 0,
            delivering: parseInt(p.delivering) || 0,
          },
          importedAt: p.importedAt,
          minStock: 2, // Hardcoded minStock for now since DB doesn't have it
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
   * Lấy chi tiết từng đơn vị sản phẩm (ProductItem) của một sản phẩm
   */
  async getProductItems(req, res) {
    try {
      const { id } = req.params;
      const items = await ProductItem.findAll({
        where: { fk_product_id: id },
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
}

module.exports = new InventoryController();
