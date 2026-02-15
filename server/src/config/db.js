require("dotenv").config();
require("reflect-metadata");
const { DataSource } = require("typeorm");
/**
 * Config Database bằng typeORM và mysql12
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */
const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [__dirname + "/../entities/*.js"],
  synchronize: false, 
  logging: false,
});

module.exports = {
  AppDataSource,
};
