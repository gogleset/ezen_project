/**
 * @filename  : Product.js
 * @author    : 최진 (choij2494@gmail.com)
 * @description : product 데이터베이스에 값 보내기
 **/

const config = require("../../helper/_config");
const logger = require("../../helper/LogHelper");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const regexHelper = require("../../helper/regex_helper");
const MultipartException = require("../exceptions/MultipartException");
const BadRequestException = require("../exceptions/BadRequestException");
const utilHelper = require("../../helper/UtillHelper");
const multer = require("multer");

// 라우팅 정의 부분
module.exports = (app) => {
  router.post("/product", async (req, res, next) => {
    // if (!req.session.memberInfo) {
    //     return next(new BadRequestException("로그인 중이 아닙니다."));
    // }

    console.log(req.body.product_img);
    
    let dbcon = null;

    // webhelper에 추가된 기능을 활용하여 업로드 객체 반환받기
    const multipart = req.getMultipart();
    logger.debug("접속");
    // 업로드 수정하기
    // const upload = multipart.single("profile_img");
    const upload = multipart.single("product_img");

    // 업로드 처리 후 텍스트 파라미터 받기
    upload(req, res, async (err) => {
      // 업로드 에러 처리
      if (err) {
        throw new MultipartException(err);
      }

      // 업로드 된 파일의 정보를 로그로 기록(필요에 따른 선택사항)
      logger.debug(JSON.stringify(req.file));

      //   저장을 위한 파라미터 입력받기
      const user_id = req.post("user_id");
      const user_pw = req.post("user_pw");
      const user_name = req.post("user_name");
      const email = req.post("email");
      const phone = req.post("phone");
      const birthday = req.post("birthday");
      const gender = req.post("gender");
      const postcode = req.post("postcode");
      const addr1 = req.post("addr1");
      const addr2 = req.post("addr2");
      const photo = req.file.url;

      // 유효성 검사
      try {
        regexHelper.value(user_id, "아이디 값이 없습니다.");
        regexHelper.value(user_pw, "비밀번호 값이 없습니다.");
        regexHelper.value(user_name, "이름 값이 없습니다.");
        regexHelper.value(email, "이메일 값이 없습니다.");
        regexHelper.value(birthday, "생년월일 값이 없습니다.");
        regexHelper.value(gender, "성별 값이 없습니다.");
        regexHelper.value(phone, "핸드폰 번호 값이 없습니다.");

        regexHelper.maxLength(user_id, 30, "아이디가 너무 깁니다.");
        regexHelper.maxLength(user_pw, 255, "비밀번호가 너무 깁니다.");
        regexHelper.maxLength(user_name, 20, "이름이 너무 깁니다.");
        regexHelper.maxLength(email, 150, "이메일 형식이 너무 깁니다.");
        regexHelper.maxLength(addr1, 20, "국가번호가 너무 깁니다.");
        regexHelper.maxLength(phone, 11, "전화번호가 너무 깁니다.");

        regexHelper.num(
          phone,
          "전화번호가 숫자가 아닌 형식이 들어가 있습니다."
        );
        regexHelper.num(postcode, "우편번호 값이 없습니다.");
      } catch (err) {
        return next(err);
      }

      try {
        // 데이터 베이스접속
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        let sql1 = "SELECT COUNT(*) AS cnt FROM members WHERE user_id=?";
        let args1 = [user_id];

        const [result1] = await dbcon.query(sql1, args1);
        const totalCount = result1[0].cnt;

        if (totalCount > 0) {
          throw new BadRequestException("이미 사용중인 아이디입니다.");
        }

        // 데이터 저장하기
        let sql2 = "INSERT INTO `members` (";
        sql2 +=
          "user_id, user_pw, user_name, email, phone, birthday, gender, postcode, addr1, addr2, photo, ";
        sql2 += "is_out, is_admin, login_date, reg_date, edit_date";
        sql2 += ") VALUES (";
        sql2 +=
          "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'N', 'N', null, now(), now());";

        const args2 = [
          user_id,
          user_pw,
          user_name,
          email,
          phone,
          birthday,
          gender,
          postcode,
          addr1,
          addr2,
          photo,
        ];
        await dbcon.query(sql2, args2);
      } catch (e) {
        return next(e);
      } finally {
        dbcon.end();
      }

      res.sendJson();
    });
  });
  return router;
};
