const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

/**
 * Config Database bằng Sequelize
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

const sequelize = new Sequelize(
  process.env.DB_NAME?.trim(),
  process.env.DB_USER?.trim(),
  process.env.DB_PASSWORD?.trim(),
  {
    host: process.env.DB_HOST?.trim(),

    // PORT phải là number
    port: Number(process.env.DB_PORT),

    dialect: "mysql",
    dialectModule: mysql2,

    logging: false,

    dialectOptions: {
      connectTimeout: 60000,

      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed:");
    console.error(error);
  });

module.exports = sequelize;