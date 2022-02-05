/**
 * @filename  : LogHelper.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : 로그파일 저장 및 생성을 위한 설정파일
 **/
const fileHelper = require('./FileHelper');
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const path = require('path');
const config = require('./_config');

fileHelper.mkdirs(config.log.debug.path);
fileHelper.mkdirs(config.log.error.path);

const { combine, timestamp, printf, splat, simple } = winston.format;

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: "YY/MM/DD HH:mm:ss.SSS"
        }),
        printf((info) => {
            return `${info.timestamp} [${info.level}] ${info.message}`;
        }),
        splat()
    ),

    transports: [
        new winstonDaily({
            name: "debug-file",
            level: config.log.debug.level,
            datePattern: "YYMMDD",
            dirname: config.log.debug.path,
            filename: "log_%DATE%.log",
            maxsize: 50000000,
            maxFiles: 50,
            zippedArchive: true
        }),

        new winstonDaily({
            name: "error-file",
            level: config.log.debug.level,
            datePattern: "YYMMDD",
            dirname: config.log.debug.path,
            filename: "log_%DATE%.log",
            maxsize: 50000000,
            maxFiles: 50,
            zippedArchive: true
        })

    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            prettyPrint: true,
            showLevel: true,
            level: config.log.debug.level,
            format: combine(
                winston.format.colorize(),
                printf((info) => {
                    return `${info.timestamp} [${info.level}] ${info.message}`;
                })
            )
        })
    );
}

module.exports = logger;