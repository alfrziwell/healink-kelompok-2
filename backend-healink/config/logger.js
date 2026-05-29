/**
 * @file Logger Configuration
 * @description Konfigurasi Winston untuk logging
 */

const winston = require('winston');
const path = require('path');

// Tentukan level logging berdasarkan environment
const logLevel = process.env.LOG_LEVEL || 'debug';

// Format custom untuk log
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            log += ` ${JSON.stringify(metadata)}`;
        }
        return log;
    })
);

// Buat logger
const logger = winston.createLogger({
    level: logLevel,
    format: customFormat,
    defaultMeta: { service: 'medical-records-api' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            ),
        }),
        // File transport untuk semua logs
        new winston.transports.File({
            filename: process.env.LOG_FILE_PATH || './logs/app.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport untuk error logs saja
        new winston.transports.File({
            filename: process.env.LOG_ERROR_FILE_PATH || './logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

module.exports = logger;
