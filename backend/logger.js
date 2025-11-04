// backend/logger.js

const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty', // makes console logs colorful and readable
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname"
    }
  }
});

module.exports = logger;