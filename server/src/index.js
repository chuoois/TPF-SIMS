require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const sequelize = require("./config/db");
require("./entities");

// Routes
const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const accountRoutes = require("./routes/account.routes");
const systemLogRoutes = require("./routes/systemLog.routes");
const orderRoutes = require("./routes/order.routes");
const productRoutes = require("./routes/product.routes");
const productAttributeRoutes = require("./routes/productAttribute.routes");
const customRequestRoutes = require("./routes/customRequest.routes");
const employeeRoutes = require("./routes/employee.routes");
const payrollRoutes = require("./routes/payroll.routes");
const notificationRoutes = require("./routes/notification.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const supplierRoutes = require("./routes/supplier.routes");
const workerRoutes = require("./routes/worker.routes");
const manufacturingOrderRoutes = require("./routes/manufacturingOrder.routes");
const importRoutes = require("./routes/import.routes");
const customerDebtRoutes = require("./routes/customerDebt.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const supplierDebtRoutes = require("./routes/supplierDebt.routes");
const couponRoutes = require("./routes/coupon.routes");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();

// ─────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:3000",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / mobile / server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy: origin "${origin}" not allowed`)
      );
    },
    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────────
app.use(cookieParser());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  })
);

// ─────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TPF-SIMS Backend Running",
  });
});

// ─────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/system-log", systemLogRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product-attribute", productAttributeRoutes);
app.use("/api/custom-request", customRequestRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/manufacturing-order", manufacturingOrderRoutes);
app.use("/api/import", importRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customer-debt", customerDebtRoutes);
app.use("/api/supplier-debt", supplierDebtRoutes);
app.use("/api/coupon", couponRoutes);

// ─────────────────────────────────────────────────────────
// Swagger
// ─────────────────────────────────────────────────────────
const SERVER_URL =
  process.env.SERVER_URL || "http://localhost:3000";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TPF-SIMS API Documentation",
      version: "1.0.0",
      description: "API Documentation for TPF-SIMS Server",
      contact: {
        name: "Developer",
      },
    },
    servers: [
      {
        url: SERVER_URL,
        description: "Production Server",
      },
      {
        url: "http://localhost:3000",
        description: "Local Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

// ─────────────────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────────────────
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });

// ─────────────────────────────────────────────────────────
// Export App For Vercel
// ─────────────────────────────────────────────────────────
module.exports = app;