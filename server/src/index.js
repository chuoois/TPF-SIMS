require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth.routes");

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

sequelize.authenticate().then(() => {
  console.log("Database connected");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
});