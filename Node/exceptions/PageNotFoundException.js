/**
 * @filename  : PageNotFoundException.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : 404에러 발생시 404에러를 확장시키기 위한 모듈
 **/
class PageNotFoundException extends Error {
    constructor(msg = "페이지를 찾을 수 없습니다.") {
        super(msg);
        this._statusCode = 404;
    }

    get statusCode() {
        return this._statusCode;
    }
}

module.exports = PageNotFoundException;