require("dotenv").config();
require("reflect-metadata");

const express = require("express");
const { AppDataSource } = require("./config/db");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  }),
);
app.use(cookieParser());

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    app.use("/api", router);

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
