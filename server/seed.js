/**
 * Seed Script – Drop & Re-create database with fresh data
 * Run: node seed.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./src/config/db");
require("./src/entities"); // Load tất cả entity + associations

const {
  UserRole, UserAccount, UserProfile, CustomerProfile,
  ProductCategory, ProductColor, ProductMaterial, ProductRoom,
  Product, ProductPricing, ProductItem, Supplier, Employee,
} = require("./src/entities");

async function seed() {
  try {
    console.log("🔄 Đang kết nối database...");
    await sequelize.authenticate();
    console.log("✅ Kết nối thành công!");

    // ── DROP & RE-CREATE ALL TABLES ──────────────────────────
    console.log("🗑️  Đang drop tất cả bảng...");
    await sequelize.sync({ force: true });
    console.log("✅ Đã tạo lại tất cả bảng!");

    // ── 1. USER ROLES ────────────────────────────────────────
    console.log("📝 Tạo roles...");
    const roles = await UserRole.bulkCreate([
      { role_code: "OWNER", role_name: "Chủ cửa hàng", description: "Quyền cao nhất, quản lý toàn bộ hệ thống" },
      { role_code: "ADMIN", role_name: "Quản trị viên", description: "Quản lý hệ thống, nhân sự" },
      { role_code: "SALES", role_name: "Nhân viên bán hàng", description: "Tạo đơn hàng, quản lý khách hàng" },
      { role_code: "ACCOUNTANT", role_name: "Kế toán", description: "Quản lý tài chính, nhập hàng, công nợ" },
      { role_code: "WORKER", role_name: "Thợ xưởng", description: "Gia công sản phẩm" },
    ]);

    // ── 2. USER ACCOUNTS + PROFILES ──────────────────────────
    console.log("📝 Tạo tài khoản...");
    const defaultPassword = await bcrypt.hash("123456aA@", 10);

    const accounts = [
      { email: "owner@tpf.com", role_id: roles[0].role_id, name: "Trần Phong", phone: "0901234567", gender: 1 },
      { email: "admin@tpf.com", role_id: roles[1].role_id, name: "Nguyễn Minh Hiếu", phone: "0902345678", gender: 1 },
      { email: "sales1@tpf.com", role_id: roles[2].role_id, name: "Lê Thị Hương", phone: "0903456789", gender: 0 },
      { email: "sales2@tpf.com", role_id: roles[2].role_id, name: "Phạm Văn Đức", phone: "0904567890", gender: 1 },
      { email: "accountant@tpf.com", role_id: roles[3].role_id, name: "Võ Thị Mai", phone: "0905678901", gender: 0 },
      { email: "worker1@tpf.com", role_id: roles[4].role_id, name: "Nguyễn Văn Tùng", phone: "0906789012", gender: 1 },
      { email: "worker2@tpf.com", role_id: roles[4].role_id, name: "Trần Quốc Bảo", phone: "0907890123", gender: 1 },
    ];

    for (const acc of accounts) {
      const user = await UserAccount.create({
        email: acc.email,
        password_hash: defaultPassword,
        role_id: acc.role_id,
        status: 1,
      });
      await UserProfile.create({
        user_account_id: user.user_account_id,
        full_name: acc.name,
        phone_number: acc.phone,
        gender: acc.gender,
        dob: "1995-06-15",
      });
    }

    // ── 3. CUSTOMERS ─────────────────────────────────────────
    console.log("📝 Tạo khách hàng...");
    await CustomerProfile.bulkCreate([
      { customer_code: "KH001", full_name: "Nguyễn Thị Lan", phone_number: "0911222333", email: "lan.nguyen@gmail.com", address: "123 Nguyễn Huệ, Q.1, TP.HCM", gender: 0, status: 1 },
      { customer_code: "KH002", full_name: "Trần Văn Minh", phone_number: "0922333444", email: "minh.tran@gmail.com", address: "456 Lê Lợi, Q.3, TP.HCM", gender: 1, status: 1 },
      { customer_code: "KH003", full_name: "Phạm Thanh Hà", phone_number: "0933444555", email: "ha.pham@gmail.com", address: "789 Trần Hưng Đạo, Q.5, TP.HCM", gender: 0, status: 1 },
      { customer_code: "KH004", full_name: "Lê Hoàng Nam", phone_number: "0944555666", email: "nam.le@gmail.com", address: "12 Pasteur, Q.1, TP.HCM", gender: 1, status: 1 },
      { customer_code: "KH005", full_name: "Vũ Minh Châu", phone_number: "0955666777", email: "chau.vu@gmail.com", address: "34 Hai Bà Trưng, Q.1, TP.HCM", gender: 0, status: 1 },
      { customer_code: "KH006", full_name: "Đặng Quốc Việt", phone_number: "0966777888", email: "viet.dang@gmail.com", address: "56 Điện Biên Phủ, Bình Thạnh, TP.HCM", gender: 1, status: 1 },
      { customer_code: "KH007", full_name: "Hoàng Thị Yến", phone_number: "0977888999", email: "yen.hoang@gmail.com", address: "78 Võ Văn Tần, Q.3, TP.HCM", gender: 0, status: 1 },
      { customer_code: "KH008", full_name: "Bùi Đức Thắng", phone_number: "0988999000", email: "thang.bui@gmail.com", address: "90 CMT8, Q.10, TP.HCM", gender: 1, status: 1 },
    ]);

    // ── 4. PRODUCT ATTRIBUTES ────────────────────────────────
    console.log("📝 Tạo thuộc tính sản phẩm...");

    const categories = await ProductCategory.bulkCreate([
      { category_name: "Bàn ăn", status: 1 },
      { category_name: "Ghế ăn", status: 1 },
      { category_name: "Bàn làm việc", status: 1 },
      { category_name: "Kệ sách", status: 1 },
      { category_name: "Tủ quần áo", status: 1 },
      { category_name: "Giường ngủ", status: 1 },
      { category_name: "Sofa", status: 1 },
      { category_name: "Bàn trà", status: 1 },
      { category_name: "Khác", status: 1 },
    ]);

    const colors = await ProductColor.bulkCreate([
      { color_name: "Walnut", status: 1 },
      { color_name: "Natural", status: 1 },
      { color_name: "Đen", status: 1 },
      { color_name: "Trắng", status: 1 },
      { color_name: "Nâu đậm", status: 1 },
      { color_name: "Xám", status: 1 },
      { color_name: "Honey", status: 1 },
    ]);

    const materials = await ProductMaterial.bulkCreate([
      { material_name: "Gỗ sồi (Oak)", status: 1 },
      { material_name: "Gỗ óc chó (Walnut)", status: 1 },
      { material_name: "Gỗ thông (Pine)", status: 1 },
      { material_name: "Gỗ tần bì (Ash)", status: 1 },
      { material_name: "Gỗ cao su", status: 1 },
      { material_name: "MDF phủ veneer", status: 1 },
    ]);

    const rooms = await ProductRoom.bulkCreate([
      { room_name: "Phòng khách", status: 1 },
      { room_name: "Phòng ngủ", status: 1 },
      { room_name: "Phòng ăn", status: 1 },
      { room_name: "Phòng làm việc", status: 1 },
      { room_name: "Phòng bếp", status: 1 },
    ]);

    // ── 5. PRODUCTS ──────────────────────────────────────────
    console.log("📝 Tạo sản phẩm...");

    const productsData = [
      {
        sku: "BA-OAK-001", product_name: "Bàn ăn Osaka 6 chỗ",
        fk_category_id: categories[0].pk_product_category_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_room_id: rooms[2].pk_product_room_id,
        size: JSON.stringify({ length: 160, width: 80, height: 75, unit: "cm" }),
        warranty_months: 24, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 4500000, rawPrice: 6500000, finalPrice: 8500000, profitMargin: 30, operatingMargin: 10,
        stockQty: 5,
      },
      {
        sku: "GA-OAK-001", product_name: "Ghế ăn Osaka",
        fk_category_id: categories[1].pk_product_category_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_room_id: rooms[2].pk_product_room_id,
        size: JSON.stringify({ length: 45, width: 45, height: 85, unit: "cm" }),
        warranty_months: 24, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 1200000, rawPrice: 1800000, finalPrice: 2500000, profitMargin: 30, operatingMargin: 10,
        stockQty: 12,
      },
      {
        sku: "BLV-WAL-001", product_name: "Bàn làm việc Nordic",
        fk_category_id: categories[2].pk_product_category_id,
        fk_material_id: materials[1].pk_product_material_id,
        fk_color_id: colors[1].pk_product_color_id,
        fk_room_id: rooms[3].pk_product_room_id,
        size: JSON.stringify({ length: 140, width: 60, height: 75, unit: "cm" }),
        warranty_months: 18, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 3800000, rawPrice: 5500000, finalPrice: 7200000, profitMargin: 28, operatingMargin: 10,
        stockQty: 3,
      },
      {
        sku: "KS-ASH-001", product_name: "Kệ sách Scandinavian 5 tầng",
        fk_category_id: categories[3].pk_product_category_id,
        fk_material_id: materials[3].pk_product_material_id,
        fk_color_id: colors[1].pk_product_color_id,
        fk_room_id: rooms[3].pk_product_room_id,
        size: JSON.stringify({ length: 80, width: 35, height: 180, unit: "cm" }),
        warranty_months: 18, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 2800000, rawPrice: 4000000, finalPrice: 5500000, profitMargin: 25, operatingMargin: 10,
        stockQty: 4,
      },
      {
        sku: "TQA-OAK-001", product_name: "Tủ quần áo 3 cánh gỗ sồi",
        fk_category_id: categories[4].pk_product_category_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_color_id: colors[4].pk_product_color_id,
        fk_room_id: rooms[1].pk_product_room_id,
        size: JSON.stringify({ length: 180, width: 60, height: 210, unit: "cm" }),
        warranty_months: 24, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 7500000, rawPrice: 10000000, finalPrice: 14500000, profitMargin: 30, operatingMargin: 10,
        stockQty: 2,
      },
      {
        sku: "GN-PIN-001", product_name: "Giường ngủ gỗ thông 1m6",
        fk_category_id: categories[5].pk_product_category_id,
        fk_material_id: materials[2].pk_product_material_id,
        fk_color_id: colors[6].pk_product_color_id,
        fk_room_id: rooms[1].pk_product_room_id,
        size: JSON.stringify({ length: 200, width: 160, height: 40, unit: "cm" }),
        warranty_months: 24, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 5000000, rawPrice: 7000000, finalPrice: 9500000, profitMargin: 28, operatingMargin: 10,
        stockQty: 3,
      },
      {
        sku: "SF-MDF-001", product_name: "Sofa góc L phòng khách",
        fk_category_id: categories[6].pk_product_category_id,
        fk_material_id: materials[5].pk_product_material_id,
        fk_color_id: colors[5].pk_product_color_id,
        fk_room_id: rooms[0].pk_product_room_id,
        size: JSON.stringify({ length: 260, width: 160, height: 85, unit: "cm" }),
        warranty_months: 12, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 8000000, rawPrice: 11000000, finalPrice: 15000000, profitMargin: 25, operatingMargin: 10,
        stockQty: 2,
      },
      {
        sku: "BT-WAL-001", product_name: "Bàn trà gỗ óc chó",
        fk_category_id: categories[7].pk_product_category_id,
        fk_material_id: materials[1].pk_product_material_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_room_id: rooms[0].pk_product_room_id,
        size: JSON.stringify({ length: 120, width: 60, height: 45, unit: "cm" }),
        warranty_months: 18, is_bundle: 0, product_type: "FINISHED", product_status: 1,
        costPrice: 3200000, rawPrice: 4500000, finalPrice: 6000000, profitMargin: 28, operatingMargin: 10,
        stockQty: 4,
      },
      // Bộ sản phẩm (Bundle)
      {
        sku: "BO-OSAKA-001", product_name: "Bộ bàn ăn Osaka (1 bàn + 4 ghế)",
        fk_category_id: categories[0].pk_product_category_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_room_id: rooms[2].pk_product_room_id,
        size: JSON.stringify({ length: 160, width: 80, height: 75, unit: "cm", note: "Kích thước bàn" }),
        warranty_months: 24, is_bundle: 1, product_type: "FINISHED", product_status: 1,
        bundle_items: JSON.stringify([
          { name: "Bàn ăn Osaka 6 chỗ", quantity: 1, material: "Gỗ sồi (Oak)", color: "Walnut" },
          { name: "Ghế ăn Osaka", quantity: 4, material: "Gỗ sồi (Oak)", color: "Walnut" }
        ]),
        costPrice: 9300000, rawPrice: 13700000, finalPrice: 18000000, profitMargin: 28, operatingMargin: 10,
        stockQty: 2,
      },
      {
        sku: "BO-NORDIC-001", product_name: "Bộ bàn ghế phòng ngủ Nordic",
        fk_category_id: categories[2].pk_product_category_id,
        fk_material_id: materials[1].pk_product_material_id,
        fk_color_id: colors[1].pk_product_color_id,
        fk_room_id: rooms[1].pk_product_room_id,
        size: null,
        warranty_months: 18, is_bundle: 1, product_type: "FINISHED", product_status: 1,
        bundle_items: JSON.stringify([
          { name: "Bàn làm việc Nordic", quantity: 1, material: "Gỗ óc chó (Walnut)", color: "Natural" },
          { name: "Ghế xoay Nordic", quantity: 1, material: "Gỗ óc chó (Walnut)", color: "Natural" }
        ]),
        costPrice: 5500000, rawPrice: 7500000, finalPrice: 10000000, profitMargin: 25, operatingMargin: 10,
        stockQty: 1,
      },
    ];

    for (const p of productsData) {
      const { costPrice, rawPrice, finalPrice, profitMargin, operatingMargin, stockQty, ...productFields } = p;

      const product = await Product.create({
        ...productFields,
        stock_quantity: stockQty,
      });

      // Tạo pricing
      await ProductPricing.create({
        fk_product_id: product.pk_product_id,
        cost_price: costPrice,
        raw_price: rawPrice,
        final_price: finalPrice,
        profit_margin: profitMargin,
        operating_margin: operatingMargin,
        status: 1,
      });

      // Tạo ProductItems (hàng tồn kho)
      for (let i = 0; i < stockQty; i++) {
        await ProductItem.create({
          fk_product_id: product.pk_product_id,
          item_name: product.product_name,
          cost_price: costPrice,
          batch_code: `INIT-SEED`,
          item_serial: `${product.sku}-${String(i + 1).padStart(3, "0")}`,
          item_status: 1, // 1: Sẵn sàng
        });
      }
    }

    // ── 6. SUPPLIERS ─────────────────────────────────────────
    console.log("📝 Tạo nhà cung cấp...");
    await Supplier.bulkCreate([
      { supplier_name: "Xưởng gỗ Minh Phát", contact_person: "Nguyễn Minh Phát", phone_number: "0912345678", email: "minhphat@wood.vn", address: "Bình Dương", tax_code: "3700123456", status: 1 },
      { supplier_name: "Nội thất Hoàng Gia", contact_person: "Trần Hoàng", phone_number: "0923456789", email: "hoanggia@noi-that.vn", address: "Đồng Nai", tax_code: "3600654321", status: 1 },
      { supplier_name: "Xưởng sơn Đại Phúc", contact_person: "Lê Đại Phúc", phone_number: "0934567890", email: "daiphuc@son.vn", address: "TP.HCM", tax_code: "3100987654", status: 1 },
      { supplier_name: "Gỗ nhập khẩu Việt Timber", contact_person: "Phạm Việt", phone_number: "0945678901", email: "contact@viettimber.vn", address: "Hà Nội", tax_code: "0100112233", status: 1 },
    ]);

    // ── 7. EMPLOYEES ─────────────────────────────────────────
    console.log("📝 Tạo nhân viên...");
    await Employee.bulkCreate([
      { employee_code: "NV001", full_name: "Lê Thị Hương", role_name: "Nhân viên bán hàng", role_type: "SALES", base_rate: 250000, is_active: 1, user_account_id: 3 },
      { employee_code: "NV002", full_name: "Phạm Văn Đức", role_name: "Nhân viên bán hàng", role_type: "SALES", base_rate: 250000, is_active: 1, user_account_id: 4 },
      { employee_code: "KT001", full_name: "Võ Thị Mai", role_name: "Kế toán", role_type: "ACCOUNTANT", base_rate: 300000, is_active: 1, user_account_id: 5 },
      { employee_code: "TS001", full_name: "Nguyễn Văn Tùng", role_name: "Thợ sơn", role_type: "PAINTER", base_rate: 350000, is_active: 1, user_account_id: 6 },
      { employee_code: "TG001", full_name: "Trần Quốc Bảo", role_name: "Thợ giấy ráp", role_type: "SANDER", base_rate: 300000, is_active: 1, user_account_id: 7 },
    ]);

    console.log("\n🎉 ════════════════════════════════════════════");
    console.log("   SEED HOÀN TẤT!");
    console.log("   ════════════════════════════════════════════");
    console.log("\n   📊 Dữ liệu đã tạo:");
    console.log("   • 5 Roles (OWNER, ADMIN, SALES, ACCOUNTANT, WORKER)");
    console.log("   • 7 Tài khoản (password mặc định: 123456aA@)");
    console.log("   • 8 Khách hàng");
    console.log("   • 9 Loại SP, 7 Màu, 6 Chất liệu, 5 Phòng");
    console.log("   • 10 Sản phẩm (8 đơn lẻ + 2 bộ) + Pricing + Tồn kho");
    console.log("   • 4 Nhà cung cấp");
    console.log("   • 5 Nhân viên");
    console.log("\n   🔐 Tài khoản đăng nhập:");
    console.log("   • owner@tpf.com / 123456aA@  (Chủ cửa hàng)");
    console.log("   • admin@tpf.com / 123456aA@  (Admin)");
    console.log("   • sales1@tpf.com / 123456aA@ (Sales)");
    console.log("   • accountant@tpf.com / 123456aA@ (Kế toán)");
    console.log("   • worker1@tpf.com / 123456aA@ (Thợ xưởng)");
    console.log("   ════════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed lỗi:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
