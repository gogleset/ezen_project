/**
 * @filename  : Product.js
 * @author    : 최진 (choij2494@gmail.com)
 * @description : product 데이터베이스에 값 보내기
 **/

const config = require("../helper/_config");
const logger = require("../helper/LogHelper");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const regexHelper = require("../helper/regex_helper");
const MultipartException = require("../exceptions/MultipartException");
const BadRequestException = require("../exceptions/BadRequestException");
const util = require("../helper/UtillHelper");
const multer = require("multer");

// 라우팅 정의 부분
module.exports = (app) => {
  let dbcon = null;
  router.get("/product", async (req, res, next) => {
    // if (!req.session.memberInfo) {
    //   return next(new BadRequestException("로그인 중이 아닙니다."));
    // }

    // 검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
    const query = req.get("query");
    // 카테고리 파라미터 받기
    const cate = req.get("cate");
    console.log(cate);
    // 현재 페이지 번호 받기(기본값은 1)
    const page = req.get("page", 1);
    console.log(page);

    // 한 페이지에 보여질 목록 수 받기 (기본값은 10, 최소 10, 최대 30)
    const rows = req.get("rows", 7);

    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;
    let pagenation = null;

    // 카테의 값이 all일 경우(전체 데이터 조회지만, pagenation에 대응되는 값은 보내지 않는다.)
    if (cate === "all") {
      try {
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        // 데이터 조회
        let sql =
          "SELECT product_code, product_name, product_price, product_stock, product_img, product_categorie, product_desc, product_nutri, product_allergy, product_date, product_state FROM products WHERE product_state = 'Y'";

        const [result] = await dbcon.query(sql);
        json = result;
      } catch (e) {
        next(e);
      } finally {
        dbcon.end();
      }
      // 모든 처리에 성공했으므로 정상 조회 결과를 구성
      res.sendJson({ item: json });
      // cate의 값이 랜덤일 경우
    } else if (cate === "random") {
      try {
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();
        // 데이터 조회
        let sql =
          "SELECT product_code, product_img, product_name FROM products WHERE product_state = 'Y' ORDER BY rand() limit 0,6";
        const [result] = await dbcon.query(sql);
        json = result;
      } catch (e) {
        next(e);
      } finally {
        dbcon.end();
      }
      // 모든 처리에 성공했으므로 정상 조회 결과를 구성
      res.sendJson({ item: json });
      // 카테고리에만 값이 있을 때
    } else if (cate != null && query == null) {
      // 카테고리값 유효성 검사
      switch (cate) {
        case "t":
        case "v":
        case "m":
        case "c":
        case "b":
          logger.debug(`카테고리의 값은 ${cate} 입니다.`);
          break;
        default:
          return next(new BadRequestException("잘못된 카테고리 값입니다."));
      }
      try {
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();
        // 데이터 조회
        let sql =
          "SELECT product_code, product_name, product_img, product_price FROM products WHERE product_state = 'Y' AND product_categorie = ?";
        let args = [];
        args.push(cate);
        const [result] = await dbcon.query(sql, args);
        json = result;
      } catch (e) {
        next(e);
      } finally {
        dbcon.end();
      }
      // 모든 처리에 성공했으므로 정상 조회 결과를 구성
      res.sendJson({ item: json });
    } else {
      // if (!req.session.memberInfo.admin === "Y") {
      //   return next(new BadRequestException("관리자가 로그인 중이 아닙니다."));
      // }
      console.log("관리자입니다.");

      try {
        // 데이터베이스 접속
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        // 데이터 조회
        let sql1 = "SELECT COUNT(*) AS cnt FROM products";

        // SQL문에 설정할 치환값
        let args1 = [];

        if (query != null && cate != null) {
          sql1 += " AND product_name LIKE concat('%', ?, '%')";
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
        // 검색조건 검색어 + 카테고리가 아니면 검색 안되게
        if (query != null && cate != null) {
          sql2 += " AND product_name LIKE concat('%', ?, '%')";
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
    }
  });

  router.get("/product/:prod", async (req, res, next) => {
    // if (!req.session.memberInfo) {
    //   return next(new BadRequestException("로그인 중이 아닙니다."));
    // }

    // 검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
    const query = req.get("prod");

    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;
    logger.debug("get파라미터 실행");
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

  // 데이터 넣어주기
  router.post("/product", async (req, res, next) => {
    // if (!req.session.memberInfo.admin === "Y") {
    //   return next(new BadRequestException("관리자가 로그인 중이 아닙니다."));
    // }

    // webhelper에 추가된 기능을 활용하여 업로드 객체 반환받기
    const multipart = req.getMultipart();
    logger.debug("포스트 접속");
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
      const product_state = req.post("productState");
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
        regexHelper.value(product_state, "상품 상태 값이 없습니다.");

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
        regexHelper.maxLength(product_state, 2, "상품 상태 값이 너무 큽니다.");

        regexHelper.num(product_price, "상품 가격을 숫자로 입력해주세요.");
        regexHelper.num(product_stock, "재고 수량을 숫자로 입력해주세요.");

        regexHelper.eng(product_state, "올바른 상태값이 아닙니다.");
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
          "product_name, product_price, product_stock, product_categorie, product_img, product_desc, product_nutri, product_allergy, product_state";
        sql2 += ") VALUES (";
        sql2 += "?, ?, ?, ?, ?, ?, ?, ?, ?);";

        const args2 = [
          product_name,
          product_price,
          product_stock,
          product_categorie,
          product_img,
          product_desc,
          product_nutri,
          product_allergy,
          product_state,
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

  // 이미지는 수정하지 않는 경우 수정
  router.put("/product", async (req, res, next) => {
    // if (!req.session.memberInfo.admin === "Y") {
    //   return next(new BadRequestException("관리자가 로그인 중이 아닙니다."));
    // }
    const product_code = req.post("prod");
    const product_name = req.post("productName");
    const product_price = req.post("productPrice");
    const product_stock = req.post("productStock");
    const product_categorie = req.post("productCategorie");
    const product_desc = req.post("productDesc");
    const product_nutri = req.post("productNutri");
    const product_allergy = req.post("productAllergy");
    const product_state = req.post("productState");
    console.log(product_state);
    console.log(product_code);
    logger.debug("이미지가 없는 경우 실행");

    try {
      regexHelper.value(product_code, "상품코드의 값이 없습니다.");
      regexHelper.value(product_name, "상품명 값이 없습니다.");
      regexHelper.value(product_price, "상품가격 값이 없습니다.");
      regexHelper.value(product_stock, "재고수량 값이 없습니다.");
      regexHelper.value(product_categorie, "카테고리 값이 없습니다.");
      regexHelper.value(product_desc, "상세설명 값이 없습니다.");
      regexHelper.value(product_nutri, "영양정보 값이 없습니다.");
      regexHelper.value(product_allergy, "알레르기 값이 없습니다.");
      regexHelper.value(product_state, "상품 상태 값이 없습니다.");

      regexHelper.maxLength(product_code, 11, "상품 코드가 너무 깁니다.");
      regexHelper.maxLength(product_name, 30, "아이디가 너무 깁니다.");
      regexHelper.maxLength(product_price, 11, "판매가격이 너무 큽니다.");
      regexHelper.maxLength(product_stock, 11, "재고수량이 너무 큽니다.");
      regexHelper.maxLength(product_desc, 255, "상세 설명 값이 너무 큽니다.");
      regexHelper.maxLength(product_nutri, 255, "영양 정보 값이 너무 큽니다.");
      regexHelper.maxLength(product_allergy, 255, "알레르기 값이 너무 큽니다.");
      regexHelper.maxLength(product_state, 2, "상품 상태 값이 너무 큽니다.");
      regexHelper.num(product_code, "상품 코드를 숫자로 입력해주세요.");
      regexHelper.num(product_price, "상품 가격을 숫자로 입력해주세요.");
      regexHelper.num(product_stock, "재고 수량을 숫자로 입력해주세요.");

      regexHelper.eng(product_state, "올바른 상태값이 아닙니다.");
    } catch (err) {
      return next(err);
    }
    // 실행로직

    try {
      // 데이터 베이스접속
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      // 데이터 저장하기
      let sql =
        "UPDATE products SET product_name = ?, product_price = ?, product_stock = ?, product_categorie = ?, product_desc = ?, product_nutri = ?, product_allergy= ?, product_state = ? WHERE product_code = ? ";

      const args = [
        product_name,
        product_price,
        product_stock,
        product_categorie,
        product_desc,
        product_nutri,
        product_allergy,
        product_state,
        product_code,
      ];
      await dbcon.query(sql, args);
    } catch (e) {
      return next(e);
    } finally {
      dbcon.end();
    }

    res.sendJson();
  });

  //이미지까지 수정하기
  router.put("/productImg", async (req, res, next) => {
    // if (!req.session.memberInfo.admin === "Y") {
    //   return next(new BadRequestException("관리자가 로그인 중이 아닙니다."));
    // }

    // webhelper에 추가된 기능을 활용하여 업로드 객체 반환받기
    const multipart = req.getMultipart();
    logger.debug("포스트put 접속");
    // 업로드 수정하기
    // const upload = multipart.single("profile_img");
    const upload = multipart.single("photo");

    // 업로드 처리 후 텍스트 파라미터 받기

    upload(req, res, async (err) => {
      // 업로드 값이 있을 경우
      if (err) {
        throw new MultipartException(err);
      }

      // 업로드 된 파일의 정보를 로그로 기록(필요에 따른 선택사항)
      logger.debug(JSON.stringify(req.file));

      const product_code = req.post("prod");
      const product_name = req.post("productName");
      const product_price = req.post("productPrice");
      const product_stock = req.post("productStock");
      const product_categorie = req.post("productCategorie");
      const product_desc = req.post("productDesc");
      const product_nutri = req.post("productNutri");
      const product_allergy = req.post("productAllergy");
      const product_img = req.file.url;
      const product_state = req.post("productState");
      logger.debug("이미지 값이 있습니다.");
      try {
        regexHelper.value(product_code, "상품코드의 값이 없습니다.");
        regexHelper.value(product_name, "상품명 값이 없습니다.");
        regexHelper.value(product_price, "상품가격 값이 없습니다.");
        regexHelper.value(product_stock, "재고수량 값이 없습니다.");
        regexHelper.value(product_categorie, "카테고리 값이 없습니다.");
        regexHelper.value(product_img, "상품 이미지가 없습니다.");
        regexHelper.value(product_desc, "상세설명 값이 없습니다.");
        regexHelper.value(product_nutri, "영양정보 값이 없습니다.");
        regexHelper.value(product_allergy, "알레르기 값이 없습니다.");
        regexHelper.value(product_state, "상품 상태 값이 없습니다.");

        regexHelper.maxLength(product_code, 11, "상품 코드가 너무 깁니다.");
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
        regexHelper.maxLength(product_state, 2, "상품 상태 값이 너무 깁니다.");

        regexHelper.num(product_code, "상품 코드를 숫자로 입력해주세요.");
        regexHelper.num(product_price, "상품 가격을 숫자로 입력해주세요.");
        regexHelper.num(product_stock, "재고 수량을 숫자로 입력해주세요.");

        regexHelper.eng(product_state, "올바른 상태 값이 아닙니다.");
      } catch (err) {
        return next(err);
      }
      // DB
      try {
        // 데이터 베이스접속
        dbcon = await mysql2.createConnection(config.database);
        await dbcon.connect();

        // 데이터 저장하기
        let sql =
          "UPDATE products SET product_name = ?, product_price = ?, product_stock = ?, product_categorie = ?, product_img = ?, product_desc = ?, product_nutri = ?, product_allergy= ?, product_state = ? WHERE product_code = ?";

        const args = [
          product_name,
          product_price,
          product_stock,
          product_categorie,
          product_img,
          product_desc,
          product_nutri,
          product_allergy,
          product_state,
          product_code,
        ];
        await dbcon.query(sql, args);
      } catch (e) {
        return next(e);
      } finally {
        dbcon.end();
      }
      res.sendJson();
    });
  });

  // 데이터 비활성화 --> DELETE
  router.delete("/product", async (req, res, next) => {
    // if (!req.session.memberInfo.admin === "Y") {
    //   return next(new BadRequestException("관리자가 로그인 중이 아닙니다."));
    // }

    const key = req.post("key");

    if (key === undefined) {
      //400 Bad Request -> 잘못된 요청
      return next(new Error(400));
    }

    try {
      // 데이터 베이스접속
      dbcon = await mysql2.createConnection(config.database);
      await dbcon.connect();

      //데이터 삭제하기
      let sql =
        "UPDATE products SET product_state = 'N' WHERE product_code IN (";
      key.map((v, i) => {
        if (i == key.length - 1) {
          return (sql += "?");
        }
        sql += "?,";
      });
      sql += ")";
      const [result1] = await dbcon.query(sql, key);
      logger.debug([result1]);
      if (result1.affectedRows < 1) {
        throw new Error("비활성화된 데이터가 없습니다.");
      }
    } catch (e) {
      logger.debug(e);
    }
    // 모든 처리에 성공했으므로 정상 조회 결과 구성
    res.sendJson();
  });

  return router;
};
