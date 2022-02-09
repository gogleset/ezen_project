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
     * @param {string} selector 입력요소에 해당하는 css 선택자
     * @param {string} msg  값이 없을 경우 표시할 메시지 내용
     * @param {boolean} 입력된 경우 true / 입력되지 않은 경우 false
     */
    value(selector, msg) {
        const field = document.querySelector(selector);
        const content = field.value.trim();

        if (!content) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field.focus();
            return false;

        }
        return true;
    }



    /**
     * 입력값이 지정된 글자수를 초과했는지 검사한다.
     * @param {string} selector     입력요소에 해당하는 css 선택자
     * @param {int} len             최대 글자수
     * @param {string} msg          값이 없을 경우 표시될 메시지
     * @return {boolean} 초과하지 않은 경우 true / 초과한 경우 false 
     */
    max_length(selector, len, msg) {
        const field = document.querySelector(selector);
        const content = field.value.trim();
        if (content.length > len) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field.value = "";
            field.focus();
            return false;
        }
        return true;
    }

    /**
     * 입력값이 지정된 글자수 미만인지 검사한다.
     * @param {string} selector  입력요소에 해당하는 css 선택자
     * @param {int} len     최대 글자수
     * @param {string} msg  값이 없을 경우 표시될 메시지
     * @return {boolean} 지정된 글자수 이상인 경우 true / 미만인 경우 false  
     */
    min_length(selector, len, msg) {
        const field = document.querySelector(selector);
        const content = field.value.trim();
        if (content.length < len) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field.value = "";
            field.focus();
            return false;
        }
        return true;
    }

    /**
     * 체크박스나 라디오가 선택되어 있는지 검사한다.
     * @param {selector} selector  입력요소에 해당하는 css 선택자
     * @param {string} msg       값이 없을 경우 표시될 메시지
     * @return {boolean} 체크된 경우 true / 체크되지 않은 경우 false 
     */
    check(selector, msg) {
        const field = document.querySelectorAll(selector);
        let checked = false;

        Array.from(field).some((v, i) => {
            if (v.checked) {
                checked = true;
                return true;
            }
        });

        if (!checked) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field[0].focus();
        }
        return checked;
    }

    /**
     * 체크박스나 라디오의 최소 선택 갯수를 검사한다.
     * @param {string} selector 입력요소에 해당하는 css 선택자
     * @param {int} min       최소 선택 갯수
     * @param {string} msg       검사에 실패한 경우 표시할 메시지
     * @return {boolean} 최소 수량 이상인 경우 true / 그렇지 않은 경우 false
     */
    check_min(selector, min, msg) {
        let count = 0;
        const field = document.querySelectorAll(selector);

        field.forEach((v, i) => {
            if (v.checked) {
                count++;
            }
        });

        if (count < min) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field[0].focus();
            return false;
        }
        return true;
    }

    /**
     * 체크박스나 라디오의 최대 선택 갯수를 검사한다.
     * @param {string} selector  입력요소에 해당하는 css선택자
     * @param {int} max       최대 선택 갯수
     * @param {string} msg       검사에 실패한 경우 표시할 메시지
     * @return {boolean}  최대 수량 이하인 경우 true / 그렇지 않은 경우 false
     */
    check_max(selector, max, msg) {
        let count = 0;
        const field = document.querySelectorAll(selector);

        field.forEach((v, i) => {
            if (v.checked) {
                count++;
            }
        });

        if (count > max) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field[0].focus();
            return false;
        }
        return true;
    }

    /**
     * 두 요소의 입력값이 동일한지 검사한다.
     * @param {string} origin_selector   원본 요소의 selector
     * @param {string} compare_selector  검사 대상 요소의 selector
     * @param {string} msg       검사에 실패할 경우 표시할 메시지
     * @return {boolean} 동일한 경우 true / 다른 경우 false
     */
    compare_to(origin_selector, compare_selector, msg) {
        const origin = document.querySelector(origin_selector);
        const compare = document.querySelector(compare_selector);
        let src = origin.value.trim();
        let dsc = compare.value.trim();

        if (src != dsc) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            origin.value = "";
            compare.value = "";
            origin.focus();
            return false;
        }
        return true;
    }

    /**
     * 입력값이 정규 표현식을 충족하는지 검사한다.
     * @param {string} selector    입력 요소에 해당하는 css 선택자
     * @param {string} msg         표시할 메시지
     * @param {object} regex_expr  검사할 정규 표현식
     * @return {boolean}   표현식을 충족할 경우 true / 그렇지 않은 경우 false
     */
    field(selector, msg, regex_expr) {
        const field = document.querySelector(selector);
        let src = field.value.trim();

        if (!src || !regex_expr.test(src)) {
            Swal.fire({
                text: msg,
                icon: 'error',
                confirmButtonText: '확인'
            });
            field.value = "";
            field.focus();
            return false;
        }
        return true;
    }

    /**
     * 숫자로만 이루어 졌는지 검사하기 위해 field()를 간접적으로 호출한다.
     * @param {string} selector 입력요소에 해당하는 css 선택자 
     * @param {string} msg      표시할 메시지
     * @return {boolean} 표현식을 충족할 경우 true / 그렇지 않은 경우 false
     */
    num(selector, msg) {
        return this.field(selector, msg,  /^[0-9]*$/);
    }

    eng(selector, msg) {
        return this.field(selector, msg, /^[a-zA-Z]*$/);
    }

    kor(selector, msg) {
        return this.field(selector, msg, /^[ㄱ-ㅎ가-힣]*$/);
    }

    eng_num(selector, msg) {
        return this.field(selector, msg, /^[a-zA-Z0-9]*$/);
    }

    kor_num(selector, msg) {
        return this.field(selector, msg, /^[ㄱ-ㅎ가-힣0-9]*$/);
    }

    email(selector, msg) {
        return this.field(selector, msg, /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
    }

    cellphone(selector, msg) {
        return this.field(selector, msg, /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/);
    }

    telephone(selector, msg) {
        return this.field(selector, msg, /^\d{2,3}\d{3,4}\d{4}$/);
    }

    phone(selector, msg) {
        let check1 = /^01(?:0|1|[6-9])(?:\d{3}|\d{4}\d{4}$)/;
        let check2 = /^\d{2,3}\d{3,4}\d{4}$/;

        const field = document.querySelector(selector);
        let src = field.value.trim();

        if (!src || (!check1.test(src) && !check2.test(src))) {
            alert(msg);
            field.value = "";
            field.focus();
            return false;
        }
        return true;
    }





















}