require('dotenv').config();
const { UserRole, UserAccount, UserProfile } = require("./src/entities");
const bcrypt = require("bcrypt");

async function seedAccounts() {
  try {
    console.log("--- Bắt đầu tạo tài khoản mẫu ---");
    const passwordHash = await bcrypt.hash("123456", 10);
    const roles = await UserRole.findAll();
    for (const role of roles) {
      const email = `${role.role_code.toLowerCase()}@test.com`;
      const account = await UserAccount.create({
        role_id: role.role_id,
        email: email,
        password_hash: passwordHash,
        status: 1
      });
      await UserProfile.create({
        user_account_id: account.user_account_id,
        full_name: `${role.role_name} User`,
        phone_number: "0987654321",
        gender: 1
      });
    }
    console.log("--- Hoàn tất! ---");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
seedAccounts();
