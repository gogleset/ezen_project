/**
 * @filename  : RuntimeException.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : 500에러 발생시 500에러를 확장시키기 위한 모듈
 **/
class RuntimeException extends Error {
    constructor(msg = "잘못된 요청 입니다.") {
        super(msg);
        this._statusCode = 500;
    }

    get statusCode() {
        return this._statusCode;
    }
}

module.exports = RuntimeException;