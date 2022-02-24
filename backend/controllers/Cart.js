/**
 * @filename  : Cart.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Cart DB연동
 **/

/** 모듈 참조 */
const axios = require("axios");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const logger = require("../helper/LogHelper");
const config = require("../helper/_config");
const utilHelper = require("../helper/UtillHelper");
const regexHelper = require("../helper/regex_helper.js");
const BadRequestException = require("../exceptions/BadRequestException");

module.exports = (app) => {
  let dbcon = null;

  //데이터 조회
  router.get("/cart", async (req, res, next) => {
    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;

    let sessionInfo = req.session.memberInfo;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 장바구니 전체 데이터 조회
      let sql2 =
        "SELECT c.cart_code, c.product_count, p.product_name, p.product_price, p.product_img, m.member_id FROM carts c";
      sql2 += " INNER JOIN products p ON c.product_code = p.product_code";
      sql2 += " INNER JOIN members m ON c.member_code = m.member_code";
      sql2 += " WHERE c.member_code = ?";

      const [result2] = await dbcon.query(sql2, sessionInfo.member_code); //sessionInfo.member_code

      json = result2;
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson({ item: json });
  });

  // 데이터 추가
  router.post("/cart", async (req, res, next) => {
    const ctPdCnt = req.post("product_count");
    const ctPdCode = req.post("product_code");

    const sessionInfo = req.session.memberInfo;
    // 세션값 가져오기
    const ctMemCode = sessionInfo.member_code;
    console.log(sessionInfo);
    logger.debug(`카트상품개수 ${ctPdCnt}`);
    logger.debug(`카트상품코드 ${ctPdCode}`);
    logger.debug(`카트멤버코드 ${ctMemCode}`);

    /*         try {
            regexHelper.value(ctPdCnt, '수량을 선택해주세요.');
            regexHelper.value(ctPdCode, '상품을 선택해주세요.');
        } catch (err) {
            return next(err);
        } */

    let json = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 회원 장바구니 추가 시 중복 데이터 조회(상품명 코드, 회원코드 일치하는지 확인하고 그 값을 카운트)
      let sql1 = "SELECT COUNT(*) as cnt";
      sql1 += " FROM carts";
      //   sql1 += " INNER JOIN products p ON c.product_code = p.product_code";
      //   sql1 += " INNER JOIN members m ON c.member_code = m.member_code";
      sql1 += " WHERE member_code = ? AND product_code = ?";

      let args = [];
      args.push(ctMemCode);
      args.push(ctPdCode);

      const [result1] = await dbcon.query(sql1, args);
      //   console.log(result1[0].cnt);
      // 중복값이 있을 경우
      if (result1[0].cnt > 0) {
        //   프론트에게 메세지 중복값이 있다는 메세지를 보냄
        return res.status(200).send("update");
      }

      // 중복값이 없을 경우 데이터 저장
      const sql2 =
        "INSERT INTO carts (product_count, product_code, member_code) values (?, ?, ?)";
      const input_data = [ctPdCnt, ctPdCode, ctMemCode];
      const [result2] = await dbcon.query(sql2, input_data);
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson({ item: json });
  });

  // 데이터 수정
  router.put("/cart/:no", async (req, res, next) => {
    const ctCode = req.get("no");
    const ctPdCnt = req.post("product_count");
    const ctPdCode = req.post("product_code");
    const sessionInfo = req.session.memberInfo;
    // 세션값 가져오기
    const ctMemCode = sessionInfo.member_code;

    if (
      ctCode === null ||
      //   ctPdCnt === null ||
      ctPdCode === null ||
      ctMemCode === null
    ) {
      return next(new Error(400));
    }

    let json = null;
    // 상품의 갯수가 저장될 값
    let count = null;
    // URL 파라미터가 num이면(ProductDetail.html 장바구니)
    if (ctCode == "num") {
      try {
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        // 카운트 값을 추출합니다.
        let sql1 = "SELECT product_count as count";
        sql1 += " FROM carts";
        // sql1 += " INNER JOIN products p ON c.product_code = p.product_code";
        // sql1 += " INNER JOIN members m ON c.member_code = m.member_code";
        sql1 += " WHERE member_code = ? AND product_code = ?";

        const input_data = [ctMemCode, ctPdCode];
        const [result1] = await dbcon.query(sql1, input_data);
        console.log("수정전 카운터:::" + result1[0].count);
        // 전역변수 count에 업데이트 할 숫자값을 넣어줍니다.
        count = result1[0].count + 1;
        console.log(count);
        let sql2 = "UPDATE carts SET product_count = ?";
        sql2 += " WHERE member_code = ? AND product_code = ?";

        const args = [count, ctMemCode, ctPdCode];
        const [result2] = await dbcon.query(sql2, args);
        console.log(result2);
      } catch (error) {
        next(error);
      } finally {
        dbcon.end();
      }
      return res.sendJson({ item: json });
    } else {
      try {
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        const sql =
          "UPDATE carts SET product_count=?, product_code=?, member_code=? WHERE cart_code=?";
        const input_data = [ctPdCnt, ctPdCode, ctMemCode, ctCode];
        const [result1] = await dbcon.query(sql, input_data);

        if (result1.affectedRows < 1) {
          throw new Error(" 수정된 데이터가 없습니다. ");
        }
      } catch (err) {
        return next(err);
      } finally {
        dbcon.end();
      }
      return res.sendJson({ item: json });
    }
  });

  // 데이터 수정(cart.js 변경 버튼)
  router.patch("/cart/:no", async (req, res, next) => {
    const ctCode = req.get("no");
    const ctPdCnt = req.post("product_count");
    const ctPdCode = req.post("product_code");
    const ctMemCode = req.post("member_code");

    let json = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      let sql = "UPDATE carts SET";
      let input_data = [];

      if (ctPdCnt != null) {
        sql += " product_count = ?";
        input_data.push(ctPdCnt);
      }

      if (ctPdCode != null) {
        sql += " product_code = ?";
        input_data.push(ctPdCode);
      }
      if (ctMemCode != null) {
        sql += " member_code = ?";
        input_data.push(ctMemCode);
      }

      if (ctCode != null) {
        sql += " WHERE cart_code = ?";
        input_data.push(ctCode);
      }

      const [result1] = await dbcon.query(sql, input_data);

      if (result1.affectedRows < 1) {
        throw new Error(" 수정된 데이터가 없습니다. ");
      }
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson({ item: json });
  });

  // 데이터 삭제
  router.delete("/cart", async (req, res, next) => {
    const cartCode = req.post("cart_code");

    console.log(cartCode);
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      let sql = "DELETE FROM carts WHERE cart_code IN (";
      cartCode.map((v, i) => {
        if (i == cartCode.length - 1) {
          return (sql += "?)");
        }
        sql += "?,";
      });

      const [result1] = await dbcon.query(sql, cartCode);

      if (result1.affectedRows < 1) {
        throw new Error("삭제된 데이터가 없습니다");
      }
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }

    res.sendJson();
  });

  return router;
};
