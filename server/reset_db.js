require('dotenv').config();
const { sequelize } = require("./src/entities");

async function clearDatabase() {
  try {
    console.log("--- Bắt đầu dọn dẹp Database ---");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "user_account", "user_profile", "refresh_token", "customer_profile", 
      "system_log", "product_material", "product_category", "product_color", 
      "product", "product_item", "order_item", "`order`", "order_history", 
      "product_pricing", "product_room", "custom_request_item", "custom_request", 
      "product_coupon", "coupon_product"
    ];
    for (const table of tables) {
      await sequelize.query(`TRUNCATE TABLE ${table}`);
    }
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("--- Hoàn tất! ---");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
clearDatabase();
