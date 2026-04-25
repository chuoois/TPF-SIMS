require('dotenv').config();
const { Product, ProductCoupon, CouponProduct, sequelize } = require("./src/entities");

async function seedCoupons() {
  try {
    console.log("--- Bắt đầu tạo mã giảm giá mẫu ---");

    // 1. Tạo Coupon
    const coupon = await ProductCoupon.create({
      coupon_code: "KM2026",
      coupon_name: "Khuyến mãi Khai xuân 2026",
      discount_percent: 10,
      start_date: new Date('2026-01-01'),
      end_date: new Date('2026-12-31'),
      status: 1
    });

    // 2. Lấy 2 sản phẩm đầu tiên để áp dụng
    const products = await Product.findAll({ limit: 2 });
    
    for (const p of products) {
      await CouponProduct.create({
        fk_coupon_id: coupon.pk_coupon_id,
        fk_product_id: p.pk_product_id
      });
      console.log(`Đã áp dụng mã KM2026 cho sản phẩm: ${p.product_name}`);
    }

    console.log("--- Hoàn tất! ---");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
seedCoupons();
