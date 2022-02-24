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
        "SELECT order_code, merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, receiver_email, imp_uid, rq_cancel, member_code FROM orders";
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

  // orders 테이블 데이터 추가 [ 주문 결제 성공 시 저장 될 DT ]
  router.post('/order', async (req, res, next) => {

    let sessionInfo = req.session.memberInfo;

    const merchantUid = req.post('merchant_uid');
    const orderState = req.post('order_state');
    const orderDate = req.post('order_date');
    const orderTtPrice = req.post('order_total_price');
    const rcvNm = req.post('receiver_name');
    const rcvPhone = req.post('receiver_phone');
    const rcvAddr1 = req.post('receiver_addr1');
    const rcvAddr2 = req.post('receiver_addr2');
    const rcvAddr3 = req.post('receiver_addr3');
    const rcvEmail = req.post('receiver_email');
    const memberCode = sessionInfo.member_code;
    const impUid = req.post('imp_uid');

    let json = null;
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 데이터 저장
      const sql1 = "INSERT INTO orders (merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, receiver_email, member_code, imp_uid) VALUES (?, ?, now(), ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const input_data1 = [merchantUid, orderState, orderTtPrice, rcvNm, rcvPhone, rcvAddr1, rcvAddr2, rcvAddr3, rcvEmail, memberCode, impUid,];
      const [result1] = await dbcon.query(sql1, input_data1);

      // 저장한 데이터를 출력
      let sql3 =
        "select merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, member_code, imp_uid FROM orders WHERE member_code = ?";
      const [result3] = await dbcon.query(sql3, sessionInfo.member_code);

      json = result3;

    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }

    res.sendJson({ item: json });
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

  //order_confirm.html에 ordered_product 테이블을 전송하고 기존 장바구니 내역들을 삭제
  router.post('/order_confirm', async (req, res, next) => {
    const merchant_uid = req.post("merchant_uid")
    const imp_uid = req.post("imp_uid")

    const member_code = req.session.memberInfo.member_code;
    let json1 = null;
    let json2 = null;

    //ordered_product 테이블 조회
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql1 = "select merchant_uid, ordered_product_name, ordered_product_img, ordered_product_count, ordered_product_price from ordered_product where merchant_uid = ?";
      const input_data1 = [merchant_uid];
      const [result1] = await dbcon.query(sql1, input_data1);
      json1 = result1;
    } catch (err) {
      return next(err);
    }

    //orders테이블의 imp_uid컬럼을 업데이트하며 동시에 order_state값을 Y로 바꿔준다
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql2 = "update orders set order_state = 'Y', imp_uid = ? where merchant_uid = ?";
      const input_data2 = [imp_uid, merchant_uid];
      const [result2] = await dbcon.query(sql2, input_data2);
    } catch (err) {
      return next(err);
    }

    //orders테이블 조회
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql4 = "select merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, receiver_email, member_code, imp_uid FROM orders WHERE merchant_uid = ?";
      const input_data4 = [merchant_uid];
      const [result4] = await dbcon.query(sql4, input_data4);
      json2 = result4;
    } catch (err) {
      return next(err);
    }

    //장바구니 데이터 삭제
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql5 = "delete from carts where member_code = ?";
      const input_data5 = [member_code];
      const [result5] = await dbcon.query(sql5, input_data5);
    } catch (err) {
      return next(err);
    }


    res.sendJson({ "item1": json1, "item2": json2 });
  });

  // 관리자 결제 취소
  router.delete("/order", async (req, res, next) => {
    const odCode = req.post("data");
    console.log(odCode);

    if (odCode === null) {
      return next(new Error(400));
    }

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql1 = "DELETE FROM orders WHERE order_code = ?";
      const [result1] = await dbcon.query(sql1, odCode)

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
