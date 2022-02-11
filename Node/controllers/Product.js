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
const util = require("../../helper/UtillHelper");
const multer = require("multer");

// 라우팅 정의 부분
module.exports = (app) => {
  let dbcon = null;
  router.get("/product", async (req, res, next) => {
    // 검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
    const query = req.get("query");
    const cate = req.get("cate");
    console.log(cate);
    // 현재 페이지 번호 받기(기본값은 1)
    const page = req.get("page");
    console.log(page);

    // 한 페이지에 보여질 목록 수 받기 (기본값은 10, 최소 10, 최대 30)
    const rows = req.get("rows", 7);

    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;
    let pagenation = null;

    try {
      // 데이터베이스 접속
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 데이터 조회
      let sql1 = "SELECT COUNT(*) AS cnt FROM products";

      // SQL문에 설정할 치환값
      let args1 = [];

      if (query != null && cate != null) {
        sql1 += " WHERE product_name LIKE concat('%', ?, '%')";
        sql1 += " AND product_categorie LIKE concat('%', ?, '%')";
        args1.push(query);
        args1.push(cate);
      }

      const [result1] = await dbcon.query(sql1, args1);
      console.log([result1]);
      const totalCount = result1[0].cnt;

      // 페이지번호 정보를 계산한다.
      pagenation = util.pagenation(totalCount, page, rows);
      logger.debug(JSON.stringify(pagenation));

      // 데이터 조회
      let sql2 =
        "SELECT product_code, product_name, product_price, product_stock, product_img, product_categorie, product_desc, product_nutri, product_allergy, product_date, product_state FROM products";

      // SQL문에 설정할 치환값
      let args2 = [];

      if (query != null && cate != null) {
        sql2 += " WHERE product_name LIKE concat('%', ?, '%')";
        sql2 += " AND product_categorie LIKE concat('%', ?, '%')";
        args2.push(query);
        args2.push(cate);
      }

      sql2 += " LIMIT ?, ?";
      args2.push(pagenation.offset);
      args2.push(pagenation.listCount);

      const [result2] = await dbcon.query(sql2, args2);

      // 조회 결과를 미리 준비한 변수에 저장함
      json = result2;
    } catch (e) {
      return next(e);
    } finally {
      dbcon.end();
    }
    // 모든 처리에 성공했으므로 정상 조회 결과를 구성
    res.sendJson({ pagenation: pagenation, item: json });
  });

  router.get("/product/:prod", async (req, res, next) => {
    // 검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
    const query = req.get("prod");

    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;

    try {
      // 데이터베이스 접속
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 데이터 조회
      let sql2 =
        "SELECT product_code, product_name, product_price, product_stock, product_img, product_categorie, product_desc, product_nutri, product_allergy, product_date, product_state FROM products WHERE product_code = ?";

      const [result2] = await dbcon.query(sql2, query);

      // 조회 결과를 미리 준비한 변수에 저장함
      json = result2;
      console.log(json);
    } catch (e) {
      return next(e);
    } finally {
      dbcon.end();
    }
    // 모든 처리에 성공했으므로 정상 조회 결과를 구성
    res.sendJson({ item: json });
  });

  router.post("/product", async (req, res, next) => {
    // if (!req.session.memberInfo) {
    //     return next(new BadRequestException("로그인 중이 아닙니다."));
    // }
    console.log(req.body.productName);
    // webhelper에 추가된 기능을 활용하여 업로드 객체 반환받기
    const multipart = req.getMultipart();
    logger.debug("접속");
    // 업로드 수정하기
    // const upload = multipart.single("profile_img");
    const upload = multipart.single("photo");
    // 업로드 처리 후 텍스트 파라미터 받기

    upload(req, res, async (err) => {
      // 업로드 에러 처리

      if (err) {
        throw new MultipartException(err);
      }

      // 업로드 된 파일의 정보를 로그로 기록(필요에 따른 선택사항)
      logger.debug(JSON.stringify(req.file));

      //   저장을 위한 파라미터 입력받기
      const product_name = req.post("productName");
      const product_price = req.post("productPrice");
      const product_stock = req.post("productStock");
      const product_categorie = req.post("productCategorie");
      const product_desc = req.post("productDesc");
      const product_nutri = req.post("productNutri");
      const product_allergy = req.post("productAllergy");
      const product_img = req.file.url;
      console.log(product_name);
      console.log(
        "***::::::::::::::::::::::::::::::::::::::::::::::::::" + product_img
      );

      // 유효성 검사
      try {
        regexHelper.value(product_name, "상품명 값이 없습니다.");
        regexHelper.value(product_price, "상품가격 값이 없습니다.");
        regexHelper.value(product_stock, "재고수량 값이 없습니다.");
        regexHelper.value(product_categorie, "카테고리 값이 없습니다.");
        regexHelper.value(product_img, "상품 이미지가 없습니다.");
        regexHelper.value(product_desc, "상세설명 값이 없습니다.");
        regexHelper.value(product_nutri, "영양정보 값이 없습니다.");
        regexHelper.value(product_allergy, "알레르기 값이 없습니다.");

        regexHelper.maxLength(product_name, 30, "아이디가 너무 깁니다.");
        regexHelper.maxLength(product_price, 11, "판매가격이 너무 큽니다.");
        regexHelper.maxLength(product_stock, 11, "재고수량이 너무 큽니다.");
        regexHelper.maxLength(product_desc, 255, "상세 설명 값이 너무 큽니다.");
        regexHelper.maxLength(
          product_nutri,
          255,
          "영양 정보 값이 너무 큽니다."
        );
        regexHelper.maxLength(
          product_allergy,
          255,
          "알레르기 값이 너무 큽니다."
        );

        regexHelper.num(product_price, "상품 가격을 숫자로 입력해주세요.");
        regexHelper.num(product_stock, "재고 수량을 숫자로 입력해주세요.");
      } catch (err) {
        return next(err);
      }

      try {
        // 데이터 베이스접속
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        // 데이터 저장하기
        let sql2 = "INSERT INTO `products` (";
        sql2 +=
          "product_name, product_price, product_stock, product_categorie, product_img, product_desc, product_nutri, product_allergy";
        sql2 += ") VALUES (";
        sql2 += "?, ?, ?, ?, ?, ?, ?, ?);";

        const args2 = [
          product_name,
          product_price,
          product_stock,
          product_categorie,
          product_img,
          product_desc,
          product_nutri,
          product_allergy,
        ];
        await dbcon.query(sql2, args2);
      } catch (e) {
        return next(e);
      } finally {
      }

      res.sendJson();
    });
  });
  return router;
};
