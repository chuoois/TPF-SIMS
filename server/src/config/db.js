const { Sequelize } = require("sequelize");

/**
 * Config Database bằng Sequelize
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

const sequelize = new Sequelize(
  (process.env.DB_NAME || "").trim(),
  (process.env.DB_USER || "").trim(),
  (process.env.DB_PASSWORD || "").trim(),
  {
    host: (process.env.DB_HOST || "").trim(),
    port: (process.env.DB_PORT || "").trim(),
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false, // Required for Aiven MySQL
      },
    },
  }
);

module.exports = sequelize;