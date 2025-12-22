const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// 🧩 Only connect to MongoDB if NOT testing
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.use(cors());
app.use(express.json());

app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          body: req.body,
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

app.use("/api/notes", authRoutes);
// Routes
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}
// ✅ Export app for testing
// if (process.env.NODE_ENV !== "test") {
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
