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

// 🧩 Connect DB (skip test env)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
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
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
// If you have notes routes, add it separately:
// app.use("/api/notes", notesRoutes);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Home route
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// ------------------------------
// Production build (React)
// ------------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // FIXED: no "*" wildcard (prevents crash)
  app.use((req, res) => {
    res.sendFile(
      path.resolve(__dirname, "../frontend", "build", "index.html")
    );
  });
}

// ------------------------------
// Start server (Railway safe)
// ------------------------------
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;