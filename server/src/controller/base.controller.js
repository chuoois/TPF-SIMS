const { AppDataSource } = require("../config/db");
const UserRepo = AppDataSource.getRepository("UserAccount");
const RefreshTokenRepo = AppDataSource.getRepository("RefreshToken");
const SystemLogRepo = AppDataSource.getRepository("SystemLog");
const EmployeeSalaryRepo = AppDataSource.getRepository("EmployeeSalary");
const UserProfileRepo = AppDataSource.getRepository("UserProfile");
const UserRoleRepo = AppDataSource.getRepository("UserRole");
const WoodTypeRepo = AppDataSource.getRepository("WoodType");
const ProductCategoryRepo = AppDataSource.getRepository("ProductCategory");
const ProductRepo = AppDataSource.getRepository("Product");
const CustomerProfileRepo = AppDataSource.getRepository("CustomerProfile");

/**
 * Đăng kí các entites trên database
 *
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
module.exports = {
  UserRepo,
  RefreshTokenRepo,
  SystemLogRepo,
  EmployeeSalaryRepo,
  UserProfileRepo,
  UserRoleRepo,
  WoodTypeRepo,
  ProductCategoryRepo,
  ProductRepo,
  CustomerProfileRepo,
};

