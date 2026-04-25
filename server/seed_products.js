require('dotenv').config();
const { 
  Product, 
  ProductCategory, 
  ProductColor, 
  ProductMaterial, 
  ProductRoom, 
  ProductPricing,
  ProductItem,
  sequelize 
} = require("./src/entities");

async function seedProducts() {
  try {
    console.log("--- Bắt đầu tạo dữ liệu Sản phẩm mẫu ---");

    // 1. Tạo Danh mục (Category)
    const categories = await ProductCategory.bulkCreate([
      { category_name: "Bàn" },
      { category_name: "Ghế" },
      { category_name: "Tủ" },
      { category_name: "Giường" }
    ]);

    // 2. Tạo Màu sắc (Color)
    const colors = await ProductColor.bulkCreate([
      { color_name: "Màu tự nhiên" },
      { color_name: "Màu Óc chó" },
      { color_name: "Màu Cánh gián" }
    ]);

    // 3. Tạo Chất liệu (Material)
    const materials = await ProductMaterial.bulkCreate([
      { material_name: "Gỗ Sồi" },
      { material_name: "Gỗ Xoan Đào" },
      { material_name: "Gỗ MDF" }
    ]);

    // 4. Tạo Phòng (Room)
    const rooms = await ProductRoom.bulkCreate([
      { room_name: "Phòng khách" },
      { room_name: "Phòng ngủ" },
      { room_name: "Phòng bếp" }
    ]);

    // 5. Tạo Sản phẩm (Product)
    const productsData = [
      {
        product_name: "Bàn ăn Gỗ Sồi 6 ghế",
        sku: "BA-GS-01",
        fk_category_id: categories[0].pk_product_category_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_room_id: rooms[2].pk_product_room_id,
        unit: "Bộ",
        stock_quantity: 10,
        size: { length: 160, width: 80, height: 75, unit: "cm" }
      },
      {
        product_name: "Ghế làm việc Ergonomic",
        sku: "G-ER-02",
        fk_category_id: categories[1].pk_product_category_id,
        fk_color_id: colors[1].pk_product_color_id,
        fk_material_id: materials[2].pk_product_material_id,
        fk_room_id: rooms[0].pk_product_room_id,
        unit: "Cái",
        stock_quantity: 25,
        size: { length: 60, width: 60, height: 120, unit: "cm" }
      },
      {
        product_name: "Tủ quần áo 3 cánh Gỗ Xoan",
        sku: "TQA-GX-03",
        fk_category_id: categories[2].pk_product_category_id,
        fk_color_id: colors[2].pk_product_color_id,
        fk_material_id: materials[1].pk_product_material_id,
        fk_room_id: rooms[1].pk_product_room_id,
        unit: "Cái",
        stock_quantity: 5,
        size: { length: 180, width: 60, height: 210, unit: "cm" }
      },
      {
        product_name: "Giường ngủ 1m8 Gỗ Sồi",
        sku: "GN-GS-04",
        fk_category_id: categories[3].pk_product_category_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_room_id: rooms[1].pk_product_room_id,
        unit: "Cái",
        stock_quantity: 8,
        size: { length: 200, width: 180, height: 45, unit: "cm" }
      },
      {
        product_name: "Đồng hồ gỗ trang trí (Quà tặng)",
        sku: "QT-DH-05",
        fk_category_id: categories[2].pk_product_category_id,
        fk_color_id: colors[0].pk_product_color_id,
        fk_material_id: materials[0].pk_product_material_id,
        fk_room_id: rooms[0].pk_product_room_id,
        unit: "Cái",
        stock_quantity: 50,
        is_gift: 1,
        size: { length: 30, width: 5, height: 30, unit: "cm" }
      }
    ];

    for (const pData of productsData) {
      const product = await Product.create(pData);
      
      // Tạo giá cho sản phẩm
      await ProductPricing.create({
        fk_product_id: product.pk_product_id,
        cost_price: 5000000,
        profit_margin: 20.00,
        operating_margin: 10.00,
        raw_price: 7000000,
        final_price: 8500000,
        status: 1
      });

      // Tạo các ProductItem (Serial/Mã định danh từng sản phẩm) với giá vốn khác nhau
      for (let i = 1; i <= 2; i++) {
        await ProductItem.create({
          fk_product_id: product.pk_product_id,
          batch_code: `BATCH-0${i}`,
          item_serial: `${product.sku}-SN-${i}`,
          cost_price: i === 1 ? 2000000 : 3000000, // Lô 1: 2tr, Lô 2: 3tr
          item_status: 1, // Sẵn sàng
          note: `Hàng nhập kho mẫu lô ${i}`
        });
      }
      
      console.log(`Đã tạo sản phẩm: ${product.product_name} và 2 items đi kèm.`);
    }

    console.log("--- Hoàn tất tạo dữ liệu Sản phẩm! ---");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi tạo dữ liệu sản phẩm:", error);
    process.exit(1);
  }
}

seedProducts();
