/**
 * @filename  : BadRequestException.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : 400에러 발생시 400에러를 확장시키기 위한 모듈
 **/
class BadRequestException extends Error {
    constructor(msg = "잘못된 요청 입니다.") {
        super(msg);
        this._statusCode = 400;
    }

    get statusCode() {
        return this._statusCode;
    }
}

module.exports = BadRequestException;