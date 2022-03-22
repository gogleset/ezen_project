/**
 * @filename  : members.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : members 테이블
 **/

const config = require('../helper/_config');
const logger = require('../helper/LogHelper');
const regexHelper = require("../helper/regex_helper");
const BadRequestException = require('../exceptions/BadRequestException')
const router = require('express').Router();
const mysql2 = require('mysql2/promise');
const util = require("../helper/UtillHelper");
const { default: Swal } = require('sweetalert2');

module.exports = (app) => {
    let dbcon = null;

    //회원가입에 대한 처리
    router.post("/members/signup", async (req, res, next) => {
        const memberId = req.post("member_id");
        const memberEmail = req.post("member_email");
        const memberPw = req.post("member_pw");
        const memberName = req.post("member_name");
        const memberPhone = req.post("member_phone");
        const memberPostcode = req.post("member_postcode");
        const memberAddr1 = req.post("member_addr1");
        const memberAddr2 = req.post("member_addr2");
        const memberBirth = req.post("member_birth");
        const admin = req.post("admin");

        const isOut = req.post("is_out");

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql1 = "SELECT count(*) as cnt FROM members WHERE member_id=?";
            let arg1 = [memberId];

            const [result1] = await dbcon.query(sql1, arg1);
            const totalCount = result1[0].cnt;

            if (totalCount > 0) {
                throw new BadRequestException("이미 사용중인 아이디 입니다.");

            }

            let sql = "INSERT INTO members (";
            sql += "member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out";
            sql += ") VALUE (";
            sql += "?,?,?,?,?,?,?,?,?,?,now(),?);";

            const args = [memberId, memberEmail, memberPw, memberName, memberPhone, memberPostcode, memberAddr1, memberAddr2, memberBirth, admin, isOut];

            await dbcon.query(sql, args);
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        const receiver = `${memberName} <${memberEmail}>`;
        const subject = `${memberName}님의 회원가입을 환영합니다.`;
        const html = `<p><strong>${memberName}</strong>님, 회원가입해 주셔서 감사합니다.</p><p>앞으로 많은 이용 바랍니다.</p>`;

        res.sendJson({ "item": json });

    });

    //회원 로그인
    router.post("/members/login", async (req, res, next) => {
        const memberId = req.post("member_id");
        const memberPw = req.post("member_pw");

        try {
            regexHelper.value(memberId, "아이디를 입력하세요");
            regexHelper.value(memberPw, "비밀번호를 입력하세요");
        } catch (e) {
            return next(e);
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "SELECT member_code, member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out ";
            sql += "FROM members WHERE member_id =? AND member_pw =?"
            let args1 = [memberId, memberPw];

            const [result] = await dbcon.query(sql, args1);

            json = result;

            // login_date값을 now()로 update 처리(json데이터는 result가 가져가는게 맞다.) reg_date값이 없다아
            /* let sql2 = "UPDATE members SET login_date=now() WHERE id=?";
            dbcon.query(sql2, json[0].id);*/
        } catch (e) {
            return next(e);
        } finally {
            dbcon.end();
        }

        if (json == null || json.length == 0) {
            return next(
                new BadRequestException("아이디나 비밀번호가 잘못되었습니다.")
            );
        }

        req.session.memberInfo = json[0];

        res.sendJson();
    });

    //회원정보수정시 메뉴에서 현재 접속한 세션데이터를 넘기기위한 라우터
    router.post("/members/session", async (req, res, next) => {
        if (!req.session.memberInfo) {
            return next(new BadRequestException("로그인 중이 아닙니다."));
        }
        // DB세션에 저장된 데이터 가져오기
        let sessionInfo = req.session.memberInfo

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();


            let sql = "SELECT member_code, member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out ";
            sql += "FROM members WHERE member_id =? AND member_pw =?"
            const [result] = await dbcon.query(sql, [sessionInfo.member_id, sessionInfo.member_pw]);

            json = result;

        } catch (err) {
            return next(err);
        }
        res.sendJson({ 'item': json });
    });

    //회원정보 수정시 받은 세션데이터에서 뽑아낸 회원아이디로 검색
    router.get("/members/set/:member_id", async (req, res, next) => {
        const memberId = req.get("member_id");

        if (memberId === undefined) {
            return next(new Error(400));
        }

        let json = null;
        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "SELECT member_id, member_email, member_pw, member_name, member_phone, ";
            sql += "member_postcode, member_addr1, member_addr2, member_birth ";
            sql += "FROM members WHERE member_id =?";

            const [result] = await dbcon.query(sql, [memberId]);

            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ item: json })
    });

    //회원정보수정
    router.put('/members/edit/:member_id', async (req, res, next) => {
        const memberId = req.get("member_id");
        const memberEmail = req.post("member_email");
        const memberPw = req.post("member_pw");
        const memberName = req.post("member_name");
        const memberPhone = req.post("member_phone");
        const memberPostcode = req.post("member_postcode");
        const memberAddr1 = req.post("member_addr1");
        const memberAddr2 = req.post("member_addr2");
        const memberBirth = req.post("member_birth");

        if (memberId == null) {
            return next(new Error(400));
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "UPDATE members SET member_email = ?, member_pw = ?, member_name = ?, member_phone = ?, member_postcode =?, "
            sql += "member_addr1 =?, member_addr2 =?, member_birth =? WHERE member_id=?"

            const inputData = [memberEmail, memberPw, memberName, memberPhone, memberPostcode, memberAddr1, memberAddr2, memberBirth, memberId]
            const [result] = await dbcon.query(sql, inputData);

            if (result.affectedRows < 1) {
                throw new Error("수정된 데이터가 없습니다.");
            }

            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ 'item': json });
    });


    //관리자 로그인
    router.post("/admin/login", async (req, res, next) => {
        const memberId = req.post("member_id");
        const memberPw = req.post("member_pw");

        try {
            regexHelper.value(memberId, "아이디를 입력하세요");
            regexHelper.value(memberPw, "비밀번호를 입력하세요");
        } catch (e) {
            return next(e);
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "SELECT member_code, member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out ";
            sql += "FROM members WHERE member_id =? AND member_pw =? AND admin=?"
            let args1 = [memberId, memberPw, "Y"];

            const [result] = await dbcon.query(sql, args1);

            json = result;

        } catch (e) {
            return next(e);
        } finally {
            dbcon.end();
        }

        if (json == null || json.length == 0) {
            return next(
                new BadRequestException("아이디나 비밀번호가 잘못되었습니다.")
            );
        }
        req.session.memberInfo = json[0];

        res.sendJson();
    });

    //로그인 쿠키 저장
    router.route("/cookie").post((req, res, next) => {
        // URL 파라미터들은 req.body 객체의 하위 데이터로 저장된다.
        for (key in req.body) {
            const str = "[" + req.method + "]" + key + "=" + req.body[key];
            logger.debug(str);
        }

        // 암호화된 쿠기 저장하기 -> 유효시간을 30초로 설정
        res.cookie("my_id_signed", req.body.member_id, {
            maxAge: 9000000,
            path: "/",
            signed: true,
        });

        res.status(200).send("ok");
    })//로그인 쿠키 읽어오기
        .get((req, res, next) => {

            // 암호화 된 쿠키값들은 req.signedCookies 객체의 하위 데이터로 저장된다.
            for (key in req.signedCookies) {
                const str = "[signedCookies]" + key + "=" + req.signedCookies[key];
                logger.warn(str);
            }

            // 원하는 쿠키값을 가져온다
            const myIdSigned = req.signedCookies.my_id_signed;

            const resultData = {
                my_id_signed: myIdSigned,
            };

            res.status(200).send(resultData);
        })

    //관리자 페이지 멤버목록조회
    router.get("/admin/list", async (req, res, next) => {

        // 검색어 파라미터 받기 -> 검색어가 없을 경우 전체 목록 조회이므로 유효성 검사 안함
        const query = req.get("query");

        // 현재 페이지 번호 받기(기본값은 1)
        const page = req.get("page", 1);

        // 한 페이지에 보여질 목록 수 받기 (기본값은 10, 최소 10, 최대 30)
        const rows = req.get("rows", 10);

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        let pagenation = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql1 = "SELECT count(*) as cnt FROM members ";

            let args1 = [];

            if (query != null) {
                sql1 += "WHERE member_name LIKE concat('%', ?, '%')";
                args1.push(query);
            }
            const [result1] = await dbcon.query(sql1, args1);
            console.log([result1]);
            const totalCount = result1[0].cnt;

            //페이지번호 정보 계산
            pagenation = util.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));

            // 데이터 조회
            let sql2 = "SELECT member_code, member_name, member_id, member_email, member_phone, concat(member_postcode,' ',member_addr1,' ',member_addr2) as totalAdd, reg_date FROM members ";

            // SQL문에 설정할 치환값
            let args2 = [];

            if (query != null) {
                sql2 += "WHERE member_name LIKE concat('%', ?, '%')";
                args2.push(query);
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

        res.sendJson({ pagenation: pagenation, item: json });
    });

    //회원정보 이름으로 검색하기
    router.get("/admin/list/:member_name", async (req, res, next) => {
        const memberName = req.get("member_name");

        if (memberName == null) {
            // 400 Bad Request -> 잘못된 요청
            return next(new Error(400));
        }

        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        try {
            // 데이터 베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 조회
            const sql = "SELECT * FROM members WHERE member_name=?";
            const [result] = await dbcon.query(sql, [memberName]);

            // 조회 결과를 미리 준비한 변수에 저장함
            json = result;
        } catch (e) {
            return next(e);
        } finally {
            dbcon.end();
        }
        // 모든 처리에 성공했으므로 정상 조회 결과 구성
        res.sendJson({ item: json });
    });

    //로그아웃 기능
    router.delete("/members/logout", async (req, res, next) => {

        let sessionInfo = req.session.memberInfo;

        try {
            // 데이터 베이스 접속
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 삭제
            const sql = "DELETE FROM sessions";
            const [result] = await dbcon.query(sql);
        } catch (e) {
            return next(e);
        } finally {
            dbcon.end();
        }
        res.sendJson();
    });

    return router;
}
