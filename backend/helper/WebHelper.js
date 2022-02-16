/**
 * @filename  : WebHelper.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : GET, URL, POST, PUT, DELETE 파라미터를 수신하여 값을 리턴하는 함수 모듈
 **/
const config = require('./_config');
const logger = require('./LogHelper');
const fileHelper = require('./FileHelper');
const multer = require("multer");
const path = require('path');
const nodemailer = require("nodemailer");

module.exports = () => {
    return (req, res, next) => {
        req._getParam = (method, key, def = null) => {
            let value = null;

            if (method.toUpperCase() === 'GET') {
                value = req.query[key] || req.params[key] || def;
            } else {
                value = req.body[key] || def;
            }

            if (value === undefined) {
                value = def;
            }

            if (value !== null && typeof value == 'string') {
                value = value.trim();

                if (value.length === 0) {
                    value = def;
                }
            }

            logger.info("[HTTP %s Params] %s=%s", method, key, value);
            return value;
        };


        req.get = function(key, def) {
            return this._getParam("GET", key, def);
        };

        req.post = function(key, def) {
            return this._getParam("POST", key, def);
        };

        req.put = function(key, def) {
            return this._getParam("PUT", key, def);
        };

        req.delete = function(key, def) {
            return this._getParam("DELETE", key, def);
        };

        res.sendResult = (statusCode, message, data) => {
            const json = {
                "rt": statusCode,
                "rtmsg": message
            };

            if (data !== undefined) {
                for (const key in data) {
                    json[key] = data[key];
                }
            }

            json.pubdate = new Date().toISOString();
            res.status(statusCode).send(json);
        };

        res.sendJson = (data) => {
            res.sendResult(200, "OK", data);
        };

        res.sendError = (error) => {
            logger.error(error.name);
            logger.error(error.message);
            logger.error(error.stack);
            res.sendResult(error.statusCode, error.message)
        }

        res.sendMail = async(receiver, subject, content) => {
            const smtp = nodemailer.createTransport(config.sendmail_info);

            try {
                await smtp.sendMail({
                    from: "Node관리자 <seul5106@gmail.com>",
                    to: receiver,
                    subject: subject,
                    html: content
                });
            } catch (err) {
                throw err;
            }
        };

        req.getMultipart = () => {
            console.log("getMultipart실행")
            const multipart = multer({
                storage: multer.diskStorage({
                    destination: (req, file, callback) => {
                        console.log("WebHelper:::::"+file);
                        fileHelper.mkdirs(config.upload.dir);
                        fileHelper.mkdirs(config.thumbnail.dir);

                        file.dir = config.upload.dir.replace(/\\/gi, "/");
                        callback(null, config.upload.dir);
                    },

                    filename: (req, file, callback) => {
                        const extName = path.extname(file.originalname);
                        const saveName = new Date().getTime().toString() + extName.toLowerCase();
                        file.savename = saveName;
                        file.url = path.join("/upload", saveName).replace(/\\/gi, "/");
                        if (req.file instanceof Array) {
                            req.file.push(file);
                        } else {
                            req.file = file;
                        }
                        callback(null, saveName);
                    }

                }),

                limits: {
                    files: 5,
                    fileSize: 1024 * 1024 * 20
                },

                fileFilter: (req, file, callback) => {
                    let mimetype = file.mimetype;

                    if (mimetype.indexOf("image/") == -1) {
                        const err = new Error();
                        err.result_code = 500;
                        err.result_msg = "이미지 파일만 업로드 가능합니다.";
                        return callback(err);
                    }
                    callback(null, true);
                },
            });

            return multipart;
        }
        next();
    }
}