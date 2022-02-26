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

  //  저장된 order 전체 데이터 불러오기
  router.get("/order", async (req, res, next) => {
    let sessionInfo = req.session.memberInfo;
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

      // 사용자 페이지에서 내 주문 내역 가지고 오기위한 조건문 추가
      if (sessionInfo != null && sessionInfo.admin != "Y") {
        sql2 += " WHERE member_code = ?";
        args2.push(sessionInfo.member_code);
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

  // order테이블에서 order코드로 데이터 조회
  router.get("/order/:order", async (req, res, next) => {
    const orderCode = req.get("order");

    if (orderCode == null) {
      return next(new Error(400));
    }

    let json = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 전체 데이터 조회
      let sql1 =
        "SELECT o.merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, imp_uid, rq_cancel, m.member_code, member_name FROM orders o INNER JOIN members m ON o.member_code = m.member_code WHERE order_code = ?";

      const [result1] = await dbcon.query(sql1, orderCode);

      json = result1;
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson({ item: json });
  });

  // ordered_product 테이블에서 주문번호로 데이터 조회
  router.get("/prod/:getData", async (req, res, next) => {
    const merchantUID = req.get("getData");

    let json = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql =
        "SELECT merchant_uid, ordered_product_name, ordered_product_img, ordered_product_count, ordered_product_price FROM ordered_product WHERE merchant_uid = ?";
      const [result] = await dbcon.query(sql, merchantUID);
      json = result;
    } catch (err) {
      return next(err);
    }
    res.sendJson({ item: json });
  });

  // orders 테이블 데이터 추가 [ 주문 결제 성공 시 저장 될 DT ]
  router.post("/order", async (req, res, next) => {
    // 세션정보
    let sessionInfo = req.session.memberInfo;
    // 상점의 주문번호
    const merchantUid = req.post("merchant_uid");
    // 주문상태
    const orderState = req.post("order_state");
    // 주문날짜
    const orderDate = req.post("order_date");
    // 결제금액
    const orderTtPrice = req.post("order_total_price");
    // 받는 사람이름
    const rcvNm = req.post("receiver_name");
    // 받는 사람 전화번호
    const rcvPhone = req.post("receiver_phone");
    // 받는 사람 우편번호
    const rcvAddr1 = req.post("receiver_addr1");
    // 받는 사람 주소
    const rcvAddr2 = req.post("receiver_addr2");
    // 받는 사람 상세주소
    const rcvAddr3 = req.post("receiver_addr3");
    // 받는 사람 이메일
    const rcvEmail = req.post("receiver_email");
    // 취소요청 여부
    const rq_cancel = req.post("rq_cancel");
    // 아임포트 주문번호
    const impUid = req.post("imp_uid");
    // 세션에 저장되어있는 회원코드번호
    const memberCode = sessionInfo.member_code;
    let json = null;
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 데이터 저장
      const sql1 =
        "INSERT INTO orders (merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, receiver_email, rq_cancel, member_code, imp_uid) VALUES (?, ?, now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const input_data1 = [
        merchantUid,
        orderState,
        orderTtPrice,
        rcvNm,
        rcvPhone,
        rcvAddr1,
        rcvAddr2,
        rcvAddr3,
        rcvEmail,
        rq_cancel,
        memberCode,
        impUid,
      ];
      await dbcon.query(sql1, input_data1);

    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }

    res.sendJson();
  });

  // 주문번호를 키값으로한 장바구니 데이터 저장
  router.post("/cart/save", async (req, res, next) => {
    // 상점 주문번호
    const merchant_uid = req.post("merchant_uid");
    // 주문한 상품 이름
    const orderedProductName = req.post("ordered_product_name");
    // 주문한 상품 이미지
    const orderedProductImg = req.post("ordered_product_img");
    // 주문한 상품의 총량
    const orderedProductCount = req.post("ordered_product_count");
    // 주문한 상품의 총가격
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
      await dbcon.query(sql, input_data);
    } catch (err) {
      return next(err);
    } finally {
      dbcon.end();
    }
    res.sendJson();
  });

  //order_confirm.html에 ordered_product 테이블을 전송하고 기존 장바구니 내역들을 삭제
  //order_confirm.html이 페이지 로드시 동작하는 라우터
  router.get("/order_confirm", async (req, res, next) => {
    // get파라미터로 받은 상점의 주문번호
    const merchant_uid = req.get("merchant_uid");
    // get파라미터로 받은 아임포트 주문번호
    const imp_uid = req.get("imp_uid");
    // 세션에 저장되어있는 회원번호코드
    const member_code = req.session.memberInfo.member_code;

    let ordered_product = null;
    let orders = null;

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      //ordered_product 테이블 조회
      const sql1 =
        "select merchant_uid, ordered_product_name, ordered_product_img, ordered_product_count, ordered_product_price from ordered_product where merchant_uid = ?";
      const input_data1 = [merchant_uid];
      const [result1] = await dbcon.query(sql1, input_data1);

      //ordered_product JSON저장
      ordered_product = result1;

      //orders테이블의 imp_uid컬럼을 업데이트하며 동시에 order_state값을 Y로 바꿔준다
      const sql2 =
        "update orders set order_state = 'Y', imp_uid = ? where merchant_uid = ?";
      const input_data2 = [imp_uid, merchant_uid];
      await dbcon.query(sql2, input_data2);

      //orders테이블 조회
      const sql3 =
        "select merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, receiver_email, member_code, imp_uid FROM orders WHERE merchant_uid = ?";
      const input_data3 = [merchant_uid];
      const [result3] = await dbcon.query(sql3, input_data3);

      //orders JSON저장
      orders = result3;

      //장바구니 데이터 삭제
      const sql4 = "delete from carts where member_code = ?";
      const input_data4 = [member_code];
      await dbcon.query(sql4, input_data4);
    } catch (err) {
      return next(err);
    }

    res.sendJson({ ordered_product: ordered_product, orders: orders });
  });

  //menu.html에서 ordered.html을 거쳐 order_confirm.html 진입시
  router.get("/menu_ordered", async (req, res, next) => {

    const merchant_uid = req.get("merchant_uid");
    let ordered_product = null;
    let orders = null;
    let mer = null;

    //orders테이블 조회
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql1 =
        "select merchant_uid, order_state, order_date, order_total_price, receiver_name, receiver_phone, receiver_addr1, receiver_addr2, receiver_addr3, receiver_email, rq_cancel, member_code, imp_uid FROM orders WHERE merchant_uid = ?";
      const input_data1 = [merchant_uid];
      const [result1] = await dbcon.query(sql1, input_data1);
      orders = result1;

      //ordered_product 테이블에서 merchant_uid로 조회하기 위해 mer 변수에 merchant_uid를 담아준다.
      mer = orders[0].merchant_uid;


      //ordered_product 테이블 조회
      const sql2 =
        "select merchant_uid, ordered_product_name, ordered_product_img, ordered_product_count, ordered_product_price from ordered_product where merchant_uid = ?";
      const input_data2 = [mer];
      const [result2] = await dbcon.query(sql2, input_data2);
      ordered_product = result2;

    } catch (err) {
      return next(err);
    }

    res.sendJson({ ordered_product: ordered_product, orders: orders });
  });

  //order_confirm.html에서 주문취소 버튼을 눌렀을 때 orders테이블 rq_cancel을 "Y"로 업데이트하는 라우터
  router.put("/order_cancle", async (req, res, next) => {
    const merchant_uid = req.post("merchant_uid");

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql = "update orders set rq_cancel = 'Y' WHERE merchant_uid = ?";
      const input_data = [merchant_uid];
      await dbcon.query(sql, input_data);
    } catch (err) {
      return next(err);
    }

    res.sendJson();
  });

  //imp_sucess가 false일 경우 주문테이블의 order_state의 값을 N=주문실패로 바꾸기 위한 라우터
  router.put("/order_confirm/false", async (req, res, next)=>{
    const merchant_uid = req.post("merchant_uid");

    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql = "update orders set order_state = 'N' WHERE merchant_uid = ?";
      const input_data = [merchant_uid];
      await dbcon.query(sql, input_data);
    } catch (err) {
      return next(err);
    }
    res.sendJson();
  });

  // 관리자 결제 취소
  router.delete("/order", async (req, res, next) => {
    // if (!req.session.memberInfo.admin === "Y") {
    //   return next(new BadRequestException("관리자가 로그인 중이 아닙니다."));
    // }

    const odCode = req.post("data");
    console.log(odCode);

    if (odCode === null) {
      return next(new Error(400));
    }

    // 결제번호
    let imp_uid = null;
    // 주문번호
    let merchant_uid = null;
    // 총 금액
    let totalCount = null;
    // 결제정보 조회 데이터
    let paymentData = null;
    // 환불사유
    let reason = "단순 변심";
    // order_code로 그에 맞는 결제 번호, 주문 번호, 총가격 조회
    try {
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql1 =
        "SELECT imp_uid as imp, merchant_uid as mer, order_total_price as total FROM orders WHERE order_code = ?";
      const [result1] = await dbcon.query(sql1, odCode);

      // 검색한 정보를 할당
      imp_uid = result1[0].imp;
      merchant_uid = result1[0].mer;
      totalCount = result1[0].total;
    } catch (err) {
      console.log(err);
    }

    try {
      const getToken = await axios.post(
        "https://api.iamport.kr/users/getToken",
        {
          imp_key: "4903323596060187", // 발급받은 REST API 키
          imp_secret:
            "a44f209da81bb6ac47ef2f13a5ebc5213a4936c447fd46229bd59c90330443f27472e89cac7b7040", // 발급받은 REST API Secret
        }
      );
      const { access_token } = getToken.data.response;
      console.log("accessToken");

      console.log(access_token);

      // imp_uid로 아임포트 서버에서 결제 정보 조회
      const getPaymentData = await axios.get(
        `https://api.iamport.kr/payments/${imp_uid}`,
        {
          // imp_uid 전달
          headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
        }
      );
      // 조회한 결제 정보
      logger.debug(getPaymentData.data.response);

      const cancelableAmount = totalCount;
      console.log(cancelableAmount);
      if (cancelableAmount <= 0) {
        // 이미 전액 환불된 경우
        return res.status(400).json({ message: "이미 전액환불된 주문입니다." });
      }
      console.log(imp_uid);
      console.log(reason);
      /* 아임포트 REST API로 결제환불 요청 */
      const getCancelData = await axios({
        url: "https://api.iamport.kr/payments/cancel",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          reason, // 가맹점 클라이언트로부터 받은 환불사유
          imp_uid, // imp_uid를 환불 `unique key`로 입력
          // amount: amount, // 가맹점 클라이언트로부터 받은 환불금액
          checksum: cancelableAmount, // [권장] 환불 가능 금액 입력
        },
      });

      console.log(getCancelData.data);

      const { response } = getCancelData.data; // 환불 결과
      json = response;

      console.log(json);

      // DB 바꾸기
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      const sql1 =
        "UPDATE orders SET order_state = 'C', rq_cancel = 'N' WHERE order_code = ?";
      const [result1] = await dbcon.query(sql1, odCode);

      if (result1.affectedRows < 1) {
        throw new Error("변경된 데이터가 없습니다");
      }
      /* 환불 결과 동기화 */
    } catch (error) {
      return next(error);
    } finally {
      dbcon.end();
    }

    res.sendJson({ item: json });
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
