require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const sequelize = require("./config/db");
require("./entities");
const { initSocket } = require("./sockets/socketManager");
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
const dashboardRoutes = require("./routes/dashboard.routes");
const swaggerUi = require("swagger-ui-express");
const couponRoutes = require("./routes/coupon.routes");

const swaggerJsDoc = require("swagger-jsdoc");

const app = express();

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Routes ────────────────────────────────────────────────
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
app.use("/api/coupon", couponRoutes);

// ── Swagger ───────────────────────────────────────────────
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TPF-SIMS API Documentation",
      version: "1.0.0",
      description: "API Documentation for TPF-SIMS Server",
      contact: { name: "Developer" },
    },
    servers: [
      { url: SERVER_URL, description: "Active server" },
      { url: "http://localhost:3000", description: "Local server" },
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
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ── HTTP & Socket ─────────────────────────────────────────
const server = http.createServer(app);
initSocket(server);

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database connected and synced successful");
    server.listen(PORT, "0.0.0.0", () => {
      const SERVER_URL = `http://localhost:${PORT}`;
      console.log(`Server running at ${SERVER_URL}`);
      console.log(`Swagger docs available at ${SERVER_URL}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect/sync the database:", err.message);
    process.exit(1);
  });