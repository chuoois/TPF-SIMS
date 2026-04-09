require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");


const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for dev, or specify your client URL
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TPF-SIMS API Documentation",
      version: "1.0.0",
      description: "API Documentation for TPF-SIMS Server",
      contact: {
        name: "Developer"
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local server"
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

sequelize.authenticate()
  .then(() => {
    console.log("Database connected successful");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err.message);
  });