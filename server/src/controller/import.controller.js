const { Op, fn, col, literal } = require("sequelize");
const {
  sequelize,
  ImportReceipt,
  ProductItem,
  Product,
  ProductCategory,
  ProductColor,
  ProductMaterial,
  ManufacturingOrder,
  ManufacturingOrderItem,
  Supplier,
  Order,
  OrderItem,
  OrderHistory,
  CustomRequestItem,
} = require("../entities");

// Helper: parse item_size JSON thành object {length, width, height}
const parseSize = (rawSize) => {
  if (!rawSize) return { length: "", width: "", height: "" };
  if (typeof rawSize === "object") {
    return {
      length: rawSize.length ?? rawSize.L ?? "",
      width:  rawSize.width  ?? rawSize.W ?? "",
      height: rawSize.height ?? rawSize.H ?? "",
    };
  }
  // string fallback ("100x80x50")
  const parts = String(rawSize).split(/[xX×]/g).map(s => s.trim());
  return {
    length: parts[0] || "",
    width:  parts[1] || "",
    height: parts[2] || "",
  };
};

/**
 * Import Controller – Quản lý Phiếu Nhập Kho
 * Created By: HieuNM
 * Created Date: 15/05/2026
 */
class ImportController {
  // ─────────────────────────────────────────────────────────
  // HELPER: Sinh mã phiếu nhập
  // ─────────────────────────────────────────────────────────
  async _generateReceiptCode(date) {
    const d = date ? new Date(date) : new Date();
    const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");

    const count = await ImportReceipt.count({
      where: literal(`DATE(import_date) = '${d.toISOString().slice(0, 10)}'`),
    });

    const seq = String(count + 1).padStart(3, "0");
    return `NK-${yyyymmdd}-${seq}`;
  }

  // ─────────────────────────────────────────────────────────
  // 1. GET /api/import/requests
  //    Lấy danh sách ManufacturingOrder đang chờ nhập hàng
  // ─────────────────────────────────────────────────────────
  async getImportRequests(req, res) {
    try {
      const { search } = req.query;

      // Status: 1=Mới tạo, 2=Đã gửi xưởng, 3=Đang gia công
      const whereOrder = { status: { [Op.in]: [1, 2, 3] } };

      if (search) {
        const s = `%${search}%`;
        whereOrder[Op.or] = [
          { order_code: { [Op.like]: s } },
          { note: { [Op.like]: s } },
        ];
      }

      const orders = await ManufacturingOrder.findAll({
        where: whereOrder,
        include: [
          {
            model: Supplier,
            as: "supplier",
            attributes: ["supplier_name"],
            required: false,
          },
          {
            model: ManufacturingOrderItem,
            as: "items",
            attributes: [
              "pk_manufacturing_order_item_id",
              "fk_product_id",
              "fk_custom_request_item_id",
              "item_name",
              "item_material",
              "item_color",
              "item_size",
              "quantity",
              "import_price",
              "item_is_bundle",
              "item_bundle_items",
              "note",
            ],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["pk_product_id", "sku", "product_img", "product_type", "size"],
                include: [
                  { model: ProductCategory, as: "category", attributes: ["category_name"], required: false },
                  { model: ProductColor, as: "color", attributes: ["color_name"], required: false },
                  { model: ProductMaterial, as: "material", attributes: ["material_name"], required: false },
                ],
                required: false,
              },
              {
                // Join CustomRequestItem để lấy item_size/material/color gốc
                // khi ManufacturingOrderItem chưa có Product liên kết
                model: CustomRequestItem,
                as: "customRequestItem",
                attributes: ["item_size", "item_material", "item_color"],
                required: false,
              },
            ],
          },
        ],
        order: [["createdate", "DESC"]],
      });

      const STATUS_MAP = { 1: "PENDING", 2: "PENDING", 3: "Đang gia công", 4: "DONE", 0: "CANCELLED" };

      const data = orders.map((o) => {
        const j = o.toJSON();
        return {
          id: j.pk_manufacturing_order_id,
          requestCode: j.order_code,
          date: j.createdate ? j.createdate.toISOString().slice(0, 10) : null,
          supplier: j.supplier?.supplier_name || null,
          note: j.note || "",
          status: STATUS_MAP[j.status] || "PENDING",
          items: (j.items || []).map((it) => {
            // Lấy size: ưu tiên item_size của ManufacturingOrderItem,
            // fallback về item_size của CustomRequestItem gốc,
            // rồi đến size của Product đã tồn tại
            const rawSize =
              it.item_size ||
              it.customRequestItem?.item_size ||
              it.product?.size ||
              null;
            const parsedSize = parseSize(rawSize);

            // Lấy category từ Product đã liên kết trực tiếp với ManufacturingOrderItem
            // Nếu không có thông tin → mặc định "Khác"
            const category = it.product?.category?.category_name || "Khác";

            return {
              id: it.pk_manufacturing_order_item_id,
              productId: it.fk_product_id,
              productCode: it.product?.sku || "",
              productName: it.item_name,
              category,
              materialType:
                it.item_material ||
                it.customRequestItem?.item_material ||
                it.product?.material?.material_name ||
                "",
              color:
                it.item_color ||
                it.customRequestItem?.item_color ||
                it.product?.color?.color_name ||
                "",
              // size trả về dạng object { length, width, height } để FE dùng trực tiếp
              size: parsedSize,
              productType:
                it.product?.product_type ||
                (it.fk_custom_request_item_id ? "CUSTOM" : "FINISHED"),
              requestedQty: it.quantity || 1,
              estimatedPrice: parseFloat(it.import_price) || 0,
              isBundle: Number(it.item_is_bundle) === 1,
              bundleItems: it.item_bundle_items || null,
              details: it.note || "",
              productImg: it.product?.product_img || null,
            };
          }),
        };
      });

      return res.status(200).json({ data });
    } catch (error) {
      console.error("getImportRequests error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách yêu cầu nhập" });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. POST /api/import/receipt
  //    Tạo phiếu nhập + sinh ProductItem vào kho
  // ─────────────────────────────────────────────────────────
  async createImportReceipt(req, res) {
    const t = await sequelize.transaction();
    try {
      const { importDate, supplier, note, invoiceImgUrl, lines, manufacturingOrderId } = req.body;
      // Các validation cơ bản đã được xử lý bởi middleware validateCreateImportReceipt

      // Sinh mã phiếu
      const receiptCode = await this._generateReceiptCode(importDate);

      let totalAmount = 0;
      let totalQty = 0;
      const linkedOrderIds = new Set(); // Track các Order liên kết để kiểm tra sau

      // Chuyển manufacturingOrderId sang integer an toàn
      const moId = manufacturingOrderId ? parseInt(manufacturingOrderId, 10) || null : null;

      // ── Kiểm tra ManufacturingOrder tồn tại và hợp lệ ──
      if (moId) {
        const mo = await ManufacturingOrder.findByPk(moId, { transaction: t });
        if (!mo) {
          await t.rollback();
          return res.status(404).json({ message: `Không tìm thấy yêu cầu sản xuất ID=${moId}` });
        }
        if (mo.status === 4) {
          await t.rollback();
          return res.status(400).json({ message: `Yêu cầu sản xuất "${mo.order_code}" đã hoàn thành, không thể tạo phiếu nhập thêm` });
        }
        if (mo.status === 0) {
          await t.rollback();
          return res.status(400).json({ message: `Yêu cầu sản xuất "${mo.order_code}" đã bị hủy, không thể tạo phiếu nhập` });
        }
      }

      // ── Kiểm tra item_serial (unitIds) chưa tồn tại trong DB ──
      const allUnitIds = lines.flatMap(l => [
        ...(l.unitIds || []),
        ...(l.bundleUnitIds || [])
      ]).filter(Boolean);
      if (allUnitIds.length > 0) {
        const { Op: OpCheck } = require('sequelize');
        const existing = await ProductItem.findOne({
          where: { item_serial: { [OpCheck.in]: allUnitIds } },
          attributes: ['item_serial'],
          transaction: t,
        });
        if (existing) {
          await t.rollback();
          return res.status(409).json({ message: `Mã định danh "${existing.item_serial}" đã tồn tại trong kho, vui lòng kiểm tra lại` });
        }
      }

      // Tạo phiếu nhập
      const receipt = await ImportReceipt.create({
        receipt_code: receiptCode,
        import_date: importDate,
        supplier_name: supplier || null,
        fk_manufacturing_order_id: moId,
        total_amount: 0, // cập nhật sau
        total_qty: 0,
        invoice_img: invoiceImgUrl || null,
        note: note || null,
        createdate: new Date(),
      }, { transaction: t });

      // Xử lý từng dòng
      let lineIdx = 0;
      for (const line of lines) {
        lineIdx++;
        if (line.isBundle) {
          // Dòng bộ sản phẩm
          const bundleQty = parseInt(line.bundleQty) || 0;
          const bundlePrice = parseFloat(line.bundlePrice) || 0;
          if (bundleQty <= 0 || bundlePrice <= 0) continue; // guard: bỏ qua dòng bất hợp lệ

          // ── GUARD: Kiểm tra số lượng nhập không vượt quá yêu cầu ──
          if (line.id) {
            const moItemCheck = await ManufacturingOrderItem.findByPk(line.id, { transaction: t });
            if (moItemCheck && bundleQty > moItemCheck.quantity) {
              await t.rollback();
              return res.status(400).json({
                message: `Bộ sản phẩm "${line.bundleName}": Số lượng nhập (${bundleQty}) vượt quá số lượng yêu cầu (${moItemCheck.quantity})`
              });
            }
          }
          const lineTotal = bundleQty * bundlePrice;
          totalAmount += lineTotal;
          totalQty += bundleQty;

          // Tìm hoặc TỰ ĐỘNG TẠO Product cho bộ (để hiện trong kho hàng)
          let product = null;
          if (line.bundleCode) {
            product = await Product.findOne({ where: { sku: line.bundleCode }, transaction: t });
          }
          if (!product && line.productId) {
            product = await Product.findByPk(line.productId, { transaction: t });
          }
          // Cập nhật ảnh nếu sản phẩm đã tồn tại nhưng chưa có ảnh
          if (product && line.productImgUrl && !product.product_img) {
            await product.update({ product_img: line.productImgUrl }, { transaction: t });
          }
          if (!product && line.bundleName) {
            // Tạo mới Product nếu chưa có → hàng mới từ xưởng chưa từng nhập kho
            const newSku = line.bundleCode || `BUNDLE-${receiptCode}-L${lineIdx}`;

            // Lookup FK IDs từ tên (tử thông tin bên yêu cầu)
            let fkCategoryId = null, fkMaterialId = null, fkColorId = null;
            if (line.category) {
              const cat = await ProductCategory.findOne({ where: { category_name: line.category }, transaction: t });
              fkCategoryId = cat?.pk_product_category_id || null;
            }
            if (!fkCategoryId) {
              const [otherCat] = await ProductCategory.findOrCreate({
                where: { category_name: "Khác" },
                defaults: { category_name: "Khác", status: 1, createdate: new Date() },
                transaction: t,
              });
              fkCategoryId = otherCat?.pk_product_category_id || null;
            }
            if (line.materialType) {
              const mat = await ProductMaterial.findOne({ where: { material_name: line.materialType }, transaction: t });
              fkMaterialId = mat?.pk_product_material_id || null;
            }
            if (line.color) {
              const clr = await ProductColor.findOne({ where: { color_name: line.color }, transaction: t });
              fkColorId = clr?.pk_product_color_id || null;
            }

            const [created] = await Product.findOrCreate({
              where: { sku: newSku },
              defaults: {
                sku: newSku,
                product_name: line.bundleName,
                product_type: line.productType || "FINISHED",
                fk_category_id: fkCategoryId,
                fk_material_id: fkMaterialId,
                fk_color_id: fkColorId,
                product_img: line.productImgUrl || null,
                description: line.details || null,
                is_bundle: 1,
                bundle_items: line.items && line.items.length > 0 ? line.items : null,
                product_status: 1,
                createdate: new Date(),
              },
              transaction: t,
            });
            // Cập nhật ảnh nếu product đã tồn tại nhưng chưa có ảnh
            if (line.productImgUrl && !created.product_img) {
              await created.update({ product_img: line.productImgUrl }, { transaction: t });
            }
            product = created;
          }

          const productId = product?.pk_product_id || null;

          // Tìm OrderItem liên kết qua CustomRequestItem (nếu có)
          let linkedOrderItem = null;
          if (line.id) {
            const moItem = await ManufacturingOrderItem.findByPk(line.id, { transaction: t });
            if (moItem) {
              // Đánh dấu ManufacturingOrderItem đã được nhập kho
              if (productId) {
                await moItem.update({ fk_product_id: productId }, { transaction: t });
              }
              if (moItem.fk_custom_request_item_id) {
                linkedOrderItem = await OrderItem.findOne({
                  where: { fk_custom_request_item_id: moItem.fk_custom_request_item_id, status: 1 },
                  transaction: t
                });
                if (linkedOrderItem && productId) {
                  await linkedOrderItem.update({
                    fk_product_id: productId,
                    import_status: 1, // Đã về kho
                    modifiedate: new Date(),
                  }, { transaction: t });
                  linkedOrderIds.add(linkedOrderItem.fk_order_id); // Track order
                  // Cập nhật fk_product_id cho CustomRequestItem
                  await CustomRequestItem.update(
                    { fk_product_id: productId, modifiedate: new Date() },
                    { where: { pk_custom_request_item_id: moItem.fk_custom_request_item_id }, transaction: t }
                  );
                }
              }
            }
          }

          // Sinh ProductItem cho từng bộ
          for (let i = 0; i < bundleQty; i++) {
            const serial = (line.unitIds && line.unitIds[i]) ? line.unitIds[i] : `${receiptCode}-B${String(i + 1).padStart(3, "0")}`;
            await ProductItem.create({
              fk_product_id: productId,
              fk_order_item_id: linkedOrderItem ? linkedOrderItem.pk_order_item_id : null,
              item_name: line.bundleName || null,
              cost_price: bundlePrice,
              batch_code: receiptCode,
              item_serial: serial,
              item_status: linkedOrderItem ? 2 : 1, // 2: Chờ giao (giữ chỗ cho đơn hàng), 1: Sẵn sàng
              note: line.details || null,
              createdate: new Date(),
            }, { transaction: t });
          }
        } else {
          // Dòng sản phẩm lẻ
          const qty = parseInt(line.qty) || 0;
          const importPrice = parseFloat(line.importPrice) || 0;
          if (qty <= 0 || importPrice <= 0) continue; // guard: bỏ qua dòng bất hợp lệ

          // ── GUARD: Kiểm tra số lượng nhập không vượt quá yêu cầu ──
          if (line.id) {
            const moItemCheck = await ManufacturingOrderItem.findByPk(line.id, { transaction: t });
            if (moItemCheck && qty > moItemCheck.quantity) {
              await t.rollback();
              return res.status(400).json({
                message: `Sản phẩm "${line.productName}": Số lượng nhập (${qty}) vượt quá số lượng yêu cầu (${moItemCheck.quantity})`
              });
            }
          }
          const lineTotal = qty * importPrice;
          totalAmount += lineTotal;
          totalQty += qty;

          // Tìm hoặc TỰ ĐỘNG TẠO Product (để hiện trong kho hàng)
          let product = null;
          if (line.productCode) {
            product = await Product.findOne({ where: { sku: line.productCode }, transaction: t });
          }
          if (!product && line.productId) {
            product = await Product.findByPk(line.productId, { transaction: t });
          }
          // Cập nhật ảnh nếu sản phẩm đã tồn tại nhưng chưa có ảnh
          if (product && line.productImgUrl && !product.product_img) {
            await product.update({ product_img: line.productImgUrl }, { transaction: t });
          }
          if (!product && line.productName) {
            // Tạo mới Product nếu chưa có → hàng mới từ xưởng chưa từng nhập kho
            const newSku = line.productCode || `SP-${receiptCode}-L${lineIdx}`;

            // Lookup FK IDs từ tên (thông tin từ yêu cầu sản xuất)
            let fkCategoryId = null, fkMaterialId = null, fkColorId = null;
            if (line.category) {
              const cat = await ProductCategory.findOne({ where: { category_name: line.category }, transaction: t });
              fkCategoryId = cat?.pk_product_category_id || null;
            }
            if (!fkCategoryId) {
              const [otherCat] = await ProductCategory.findOrCreate({
                where: { category_name: "Khác" },
                defaults: { category_name: "Khác", status: 1, createdate: new Date() },
                transaction: t,
              });
              fkCategoryId = otherCat?.pk_product_category_id || null;
            }
            if (line.materialType) {
              const mat = await ProductMaterial.findOne({ where: { material_name: line.materialType }, transaction: t });
              fkMaterialId = mat?.pk_product_material_id || null;
            }
            if (line.color) {
              const clr = await ProductColor.findOne({ where: { color_name: line.color }, transaction: t });
              fkColorId = clr?.pk_product_color_id || null;
            }

            const [created] = await Product.findOrCreate({
              where: { sku: newSku },
              defaults: {
                sku: newSku,
                product_name: line.productName,
                product_type: line.productType || "FINISHED",
                fk_category_id: fkCategoryId,
                fk_material_id: fkMaterialId,
                fk_color_id: fkColorId,
                product_img: line.productImgUrl || null,
                description: line.details || null,
                is_bundle: 0,
                product_status: 1,
                createdate: new Date(),
              },
              transaction: t,
            });
            // Cập nhật ảnh nếu product đã tồn tại nhưng chưa có ảnh
            if (line.productImgUrl && !created.product_img) {
              await created.update({ product_img: line.productImgUrl }, { transaction: t });
            }
            product = created;
          }

          const productId = product?.pk_product_id || null;

          // Tìm OrderItem liên kết qua CustomRequestItem (nếu có)
          let linkedOrderItem = null;
          if (line.id) {
            const moItem = await ManufacturingOrderItem.findByPk(line.id, { transaction: t });
            if (moItem) {
              // Đánh dấu ManufacturingOrderItem đã được nhập kho
              if (productId) {
                await moItem.update({ fk_product_id: productId }, { transaction: t });
              }
              if (moItem.fk_custom_request_item_id) {
                linkedOrderItem = await OrderItem.findOne({
                  where: { fk_custom_request_item_id: moItem.fk_custom_request_item_id, status: 1 },
                  transaction: t
                });
                // Cập nhật fk_product_id và import_status cho OrderItem
                if (linkedOrderItem && productId) {
                  await linkedOrderItem.update({
                    fk_product_id: productId,
                    import_status: 1, // Đã về kho
                    modifiedate: new Date(),
                  }, { transaction: t });
                  linkedOrderIds.add(linkedOrderItem.fk_order_id); // Track order
                  // Cập nhật fk_product_id cho CustomRequestItem
                  await CustomRequestItem.update(
                    { fk_product_id: productId, modifiedate: new Date() },
                    { where: { pk_custom_request_item_id: moItem.fk_custom_request_item_id }, transaction: t }
                  );
                }
              }
            }
          }

          // Sinh ProductItem cho từng đơn vị
          for (let i = 0; i < qty; i++) {
            const serial = (line.unitIds && line.unitIds[i]) ? line.unitIds[i] : `${receiptCode}-U${String(i + 1).padStart(3, "0")}`;
            await ProductItem.create({
              fk_product_id: productId,
              fk_order_item_id: linkedOrderItem ? linkedOrderItem.pk_order_item_id : null,
              item_name: line.productName || null,
              cost_price: importPrice,
              batch_code: receiptCode,
              item_serial: serial,
              item_status: linkedOrderItem ? 2 : 1, // 2: Chờ giao (giữ chỗ cho đơn hàng), 1: Sẵn sàng
              note: line.details || null,
              createdate: new Date(),
            }, { transaction: t });
          }
        }
      }

      // Cập nhật tổng tiền và tổng SL
      await receipt.update({ total_amount: totalAmount, total_qty: totalQty }, { transaction: t });

      // Cập nhật trạng thái ManufacturingOrder → chỉ chuyển sang Hoàn thành (status=4)
      // khi TẤT CẢ ManufacturingOrderItem đã được nhập kho (có fk_product_id)
      if (moId) {
        const allMoItems = await ManufacturingOrderItem.findAll({
          where: { fk_manufacturing_order_id: moId },
          attributes: ["pk_manufacturing_order_item_id", "fk_product_id"],
          transaction: t,
        });
        const allImported = allMoItems.length > 0 && allMoItems.every(item => item.fk_product_id != null);
        if (allImported) {
          await ManufacturingOrder.update(
            { status: 4, modifiedate: new Date() },
            { where: { pk_manufacturing_order_id: moId }, transaction: t }
          );
        }
        // Nếu chưa nhập đủ → giữ nguyên status → vẫn hiện trong danh sách yêu cầu nhập
      }

      // Kiểm tra nếu tất cả OrderItem của Order đều đã về kho → chuyển order_status sang 2 (Chờ xử lý)
      console.log(">>> linkedOrderIds:", [...linkedOrderIds]);
      for (const orderId of linkedOrderIds) {
        const allItems = await OrderItem.findAll({
          where: { fk_order_id: orderId, status: 1 },
          attributes: ['pk_order_item_id', 'import_status'],
          transaction: t
        });
        console.log(">>> Order", orderId, "items import_status:", allItems.map(i => ({ id: i.pk_order_item_id, import_status: i.import_status, type: typeof i.import_status })));
        const allArrived = allItems.length > 0 && allItems.every(item => Number(item.import_status) === 1);
        console.log(">>> allArrived:", allArrived);
        if (allArrived) {
          await Order.update(
            { order_status: 2, modifiedate: new Date() },
            { where: { pk_order_id: orderId }, transaction: t }
          );
          await OrderHistory.create({
            fk_order_id: orderId,
            action: "Hàng đã về kho đủ",
            new_status: 2,
            note: "Tất cả sản phẩm trong đơn hàng đã về kho. Tự động chuyển sang Chờ xử lý.",
            createby: req.user?.userId || null,
          }, { transaction: t });
          console.log(">>> Order", orderId, "đã chuyển sang status 2 (Chờ xử lý)");
        }
      }

      await t.commit();

      return res.status(201).json({
        message: "Tạo phiếu nhập thành công",
        receipt: {
          id: receipt.pk_receipt_id,
          receiptCode,
          totalAmount,
          totalQty,
        },
      });
    } catch (error) {
      await t.rollback();
      console.error("createImportReceipt error:", error.message);
      console.error("Stack:", error.stack);
      if (error.name === "SequelizeValidationError") {
        const msgs = error.errors?.map(e => `${e.path}: ${e.message}`).join(", ");
        return res.status(400).json({ message: `Dữ liệu không hợp lệ: ${msgs}` });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors?.[0]?.path || '';
        if (field === 'item_serial' || field.includes('serial')) {
          return res.status(409).json({ message: 'Mã định danh đơn vị bị trùng, vui lòng kiểm tra lại danh sách mã định danh' });
        }
        return res.status(409).json({ message: 'Dữ liệu bị trùng lặp, vui lòng thử lại' });
      }
      return res.status(500).json({ message: error.message || "Lỗi hệ thống khi tạo phiếu nhập" });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. GET /api/import/receipt
  //    Danh sách phiếu nhập (có search + date filter + phân trang)
  // ─────────────────────────────────────────────────────────
  async getImportReceipts(req, res) {
    try {
      const { search, date, page = 1, limit = 15 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};

      if (date) {
        where.import_date = date; // YYYY-MM-DD
      }

      if (search) {
        const s = `%${search}%`;
        where[Op.or] = [
          { receipt_code: { [Op.like]: s } },
          { supplier_name: { [Op.like]: s } },
        ];
      }

      const { count, rows } = await ImportReceipt.findAndCountAll({
        where,
        order: [["createdate", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Lấy tên sản phẩm đầu tiên của mỗi phiếu (tránh group by strict mode)
      const receiptCodes = rows.map((r) => r.receipt_code);
      const allItems = receiptCodes.length > 0 ? await ProductItem.findAll({
        where: { batch_code: receiptCodes },
        attributes: ["batch_code", "fk_product_id", "item_name"],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["product_name"],
            required: false,
          },
        ],
        order: [["createdate", "ASC"]],
      }) : [];

      const firstItemMap = {};
      allItems.forEach((item) => {
        const j = item.toJSON();
        if (!firstItemMap[j.batch_code]) {
          // Ưu tiên product_name từ join, fallback về item_name đã lưu trực tiếp
          firstItemMap[j.batch_code] = j.product?.product_name || j.item_name || "—";
        }
      });

      const data = rows.map((r) => {
        const j = r.toJSON();
        return {
          id: j.pk_receipt_id,
          code: j.receipt_code,
          date: j.createdate,
          importDate: j.import_date,
          product: firstItemMap[j.receipt_code] || "—",
          supplier: j.supplier_name || "—",
          qty: j.total_qty,
          totalPrice: parseFloat(j.total_amount) || 0,
          note: j.note,
          invoiceImg: j.invoice_img,
        };
      });

      return res.status(200).json({
        data,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("getImportReceipts error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách phiếu nhập" });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. GET /api/import/receipt/:id
  //    Chi tiết phiếu nhập
  // ─────────────────────────────────────────────────────────
  async getImportReceiptDetail(req, res) {
    try {
      const { id } = req.params;

      const receipt = await ImportReceipt.findByPk(id);
      if (!receipt) {
        return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });
      }

      const j = receipt.toJSON();

      // Lấy tất cả ProductItem theo batch_code
      const items = await ProductItem.findAll({
        where: { batch_code: j.receipt_code },
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["pk_product_id", "sku", "product_name", "product_img"],
            include: [
              { model: ProductCategory, as: "category", attributes: ["category_name"], required: false },
              { model: ProductMaterial, as: "material", attributes: ["material_name"], required: false },
              { model: ProductColor, as: "color", attributes: ["color_name"], required: false },
            ],
            required: false,
          },
        ],
        order: [["createdate", "ASC"]],
      });

      // Group theo product (vì mỗi đơn vị là 1 ProductItem)
      const linesMap = {};
      items.forEach((item) => {
        const it = item.toJSON();
        const key = it.fk_product_id || it.batch_code + "_" + (it.item_name || "null");
        if (!linesMap[key]) {
          linesMap[key] = {
            productId: it.fk_product_id,
            productCode: it.product?.sku || "",
            // Ưu tiên product_name từ join, fallback về item_name đã lưu trực tiếp
            productName: it.product?.product_name || it.item_name || "—",
            productImg: it.product?.product_img || null,
            category: it.product?.category?.category_name || "",
            materialType: it.product?.material?.material_name || "",
            color: it.product?.color?.color_name || "",
            importPrice: parseFloat(it.cost_price) || 0,
            qty: 0,
            unitIds: [],
            details: it.note || "",
            isBundle: false,
          };
        }
        linesMap[key].qty += 1;
        linesMap[key].unitIds.push(it.item_serial);
      });

      const lines = Object.values(linesMap);

      return res.status(200).json({
        id: j.pk_receipt_id,
        code: j.receipt_code,
        date: j.createdate,
        importDate: j.import_date,
        supplier: j.supplier_name,
        note: j.note,
        invoiceImg: j.invoice_img,
        totalPrice: parseFloat(j.total_amount) || 0,
        qty: j.total_qty,
        lines,
      });
    } catch (error) {
      console.error("getImportReceiptDetail error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết phiếu nhập" });
    }
  }
}

module.exports = new ImportController();
