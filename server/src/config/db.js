const { Sequelize } = require("sequelize");

/**
 * Config Database bằng Sequelize
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;