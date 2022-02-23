/**
 * @filename  : Order.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Order DB연동
 **/

/** 모듈 참조 */
const axios = require("axios");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const logger = require("../helper/LogHelper");
const config = require("../helper/_config");
const utilHelper = require("../helper/UtillHelper");
const regexHelper = require("../helper/regex_helper.js");

module.exports = (app) => {
  let dbcon = null;
  //  저장된 order 데이터 불러오기
  router.get("/order", async (req, res, next) => {
    // 검색어 파라미터 받기
    const query = req.get("query");
    // 현재 페이지 번호 받기 (기본값 : 1)
    const page = req.get("page", 1);
    // 한 페이지에 보여질 목록 수 (기본값 : 10)
    const rows = req.get("rows", 16);
    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;
    let pagenation = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 전체 데이터수 조회 - 페이지 번호구현에 쓰일dt
      let sql1 = "SELECT COUNT(*) AS cnt FROM orders";
      let args1 = [];

      if (query != null) {
        sql1 += " WHERE receiver_name Like concat('%', ?, '%')";
        args1.push(query);
      }

      const [result1] = await dbcon.query(sql1, args1);
      const totalCount = result1[0].cnt;

      pagenation = utilHelper.pagenation(totalCount, page, rows);
      logger.debug(JSON.stringify(pagenation));

      // 전체 데이터 조회
      let sql2 =
        "SELECT order_code, merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, imp_uid, rq_cancel, member_code FROM orders";
      let args2 = [];

      if (query != null) {
        sql2 += " WHERE receiver_name Like concat('%', ?, '%')";
        args2.push(query);
      }

      sql2 += " LIMIT ?, ?";
      args2.push(pagenation.offset);
      args2.push(pagenation.listCount);

      const [result2] = await dbcon.query(sql2, args2);

      json = result2;
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson({ pagenation: pagenation, item: json });
  });

  // 주문번호를 키값으로한 장바구니 데이터 저장
  router.post("/cart/save", async (req, res, next) => {
    const merchant_uid = req.post("merchant_uid");
    const orderedProductName = req.post("ordered_product_name");
    const orderedProductImg = req.post("ordered_product_img");
    const orderedProductCount = req.post("ordered_product_count");
    const orderedProductPrice = req.post("ordered_product_price");

    let json = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql =
        "INSERT INTO ordered_product (merchant_uid, ordered_product_name, ordered_product_img, ordered_product_count, ordered_product_price) VALUES (?, ?, ?, ?, ?)";
      const input_data = [
        merchant_uid,
        orderedProductName,
        orderedProductImg,
        orderedProductCount,
        orderedProductPrice,
      ];
      const [result] = await dbcon.query(sql, input_data);
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson();
  });

  // 카트에서 데이터 삭제 [ 주문 결제 성공 시 카트 상품 DELETE ]
  router.delete("/order/:no", async (req, res, next) => {
    let sessionInfo = req.session.memberInfo;

    const memberCode = req.get("no");
    console.log(memberCode);

    if (memberCode === null) {
      return next(new Error(400));
    }

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql1 = "DELETE FROM carts WHERE member_code = ?";
      const [result1] = await dbcon.query(sql1, memberInfo.member_code);

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
