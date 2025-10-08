const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const pinoHttp = require("pino-http");
const logger = require("./logger"); // <== add this line

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Pino HTTP Logger middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: true, // logs all incoming HTTP requests automatically
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Example route for testing
app.get("/", (req, res) => {
  req.log.info("Home route accessed");
  res.send("Pino Logger Integrated Successfully ✅");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  req.log.error({ msg: "Unhandled Exception", error: err.message });
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
