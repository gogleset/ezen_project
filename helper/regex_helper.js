/**
 * @filename  : regex_helper.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : 정규표현식 검사 수행 후 , true/false로 해당 정규 표현식 충족하는지 여부를 반환하는 함수들의 모음
 * 
 * 
 */
class RegexHelper {
    // constructor(){}

    /**
     * 값의 존재 여부를 검사한다.
     * @param {string} content 입력요소에 해당하는 css 선택자
     * @param {string} msg  값이 없을 경우 표시할 메시지 내용
     * @param {boolean} 입력된 경우 true / 입력되지 않은 경우 false
     */

    value(content, msg) {
        if (content == undefined || content == null || content.trim().length == 0) {
            throw new Error(msg);
        }
        return true;
    }

    /**
     * 입력값이 지정된 글자수를 초과했는지 검사한다.
     * @param {string} content     입력요소에 해당하는 css 선택자
     * @param {int} len             최대 글자수
     * @param {string} msg          값이 없을 경우 표시될 메시지
     * @return {boolean} 초과하지 않은 경우 true / 초과한 경우 false 
     */
    max_length(content, len, msg) {
        if (!this.value(content) || content.length > len) {
            throw new Error(msg)
        }
        return true;
    }
}

module.exports = new RegexHelper();