const { AppDataSource } = require("../config/db");
const UserRepo = AppDataSource.getRepository("UserAccount");
const RefreshTokenRepo = AppDataSource.getRepository("RefreshToken");
const SystemLogRepo = AppDataSource.getRepository("SystemLog");
const EmployeeSalaryRepo = AppDataSource.getRepository("EmployeeSalary");
const UserProfileRepo = AppDataSource.getRepository("UserProfile");
const UserRoleRepo = AppDataSource.getRepository("UserRole");
const CustomerProfileRepo = AppDataSource.getRepository("CustomerProfile");
const ProductCategoryRepo = AppDataSource.getRepository("ProductCategory");
const ProductRepo = AppDataSource.getRepository("Product");
const WoodTypeRepo = AppDataSource.getRepository("WoodType");
const SkuRepo = AppDataSource.getRepository("Sku");
const WarehouseRepo = AppDataSource.getRepository("Warehouse");
const WarehouseInventoryRepo = AppDataSource.getRepository("WarehouseInventory");
const ColorRepo = AppDataSource.getRepository("Color");

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
  ProductCategoryRepo,
  ProductRepo,
  WoodTypeRepo,
  SkuRepo,
  WarehouseRepo,
  WarehouseInventoryRepo,
  ColorRepo,
};

