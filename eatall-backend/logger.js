// Archivo para gestionar los logs mediante la librería winston de node.js
const winston = require('winston');
const { format, transports } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),

  transports: [
    new transports.File({ filename: 'logs/combined.log', level: 'info' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

module.exports = logger;
