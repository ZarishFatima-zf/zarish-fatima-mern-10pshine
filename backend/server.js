const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// DB connect (Railway)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middlewares
app.use(cors({
  origin: "*", // Netlify frontend ke liye open (baad me restrict kar sakti ho)
}));
app.use(express.json());

// Logger
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// ------------------------------
// Start server (Railway safe)
// ------------------------------
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;