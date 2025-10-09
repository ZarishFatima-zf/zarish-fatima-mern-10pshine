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


// Error-handling middleware
app.use((err, req, res, next) => {
  req.log.error({ msg: "Unhandled Exception", error: err.message });
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
