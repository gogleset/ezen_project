/**
 * @filename  : members.js
 * @author    : 정한슬 (seul5106@gmail.com)
 * @description : members 테이블
 **/

const config = require('../../helper/_config');
const logger = require('../../helper/LogHelper');
const regexHelper = require("../../helper/regex_helper");
const BadRequestException = require('../exceptions/BadRequestException')
const router = require('express').Router();
const mysql2 = require('mysql2/promise');

module.exports = (app) => {
    let dbcon = null;

    //회원가입에 대한 처리
    router.post("/members/signup", async (req, res, next) => {
        const member_id = req.post("member_id");
        const member_email = req.post("member_email");
        const member_pw = req.post("member_pw");
        const member_name = req.post("member_name");
        const member_phone = req.post("member_phone");
        const member_postcode = req.post("member_postcode");
        const member_addr1 = req.post("member_addr1");
        const member_addr2 = req.post("member_addr2");
        const member_birth = req.post("member_birth");
        const admin = req.post("admin");

        const is_out = req.post("is_out");

        let json = null;

        //회원가입에 대한 유효성 검사
        /*try{
            regexHelper.value();
        }catch(err){
            return next(err);
        }*/

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql1 = "select count(*) as cnt from members where member_id=?";
            let arg1 = [member_id];

            const [result1] = await dbcon.query(sql1, arg1);
            const totalCount = result1[0].cnt;

            if (totalCount > 0) {
                throw new BadRequestException("이미 사용중인 아이디 입니다.");
            }

            let sql = "insert into members (";
            sql += "member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out";
            sql += ") value (";
            sql += "?,?,?,?,?,?,?,?,?,?,now(),?);";

            const args = [member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, member_birth, admin, is_out];

            await dbcon.query(sql, args);
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        const receiver = `${member_name} <${member_email}>`;
        const subject = `${member_name}님의 회원가입을 환영합니다.`;
        const html = `<p><strong>${member_name}</strong>님, 회원가입해 주셔서 감사합니다.</p><p>앞으로 많은 이용 바랍니다.</p>`;

        res.sendJson({ "item": json });

    });

    //회원 로그인
    router.post("/members/login", async (req, res, next) => {
        const member_id = req.post("member_id");
        const member_pw = req.post("member_pw");

        try {
            regexHelper.value(member_id, "아이디를 입력하세요");
            regexHelper.value(member_pw, "비밀번호를 입력하세요");
        } catch (e) {
            return next(e);
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "select member_code, member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out ";
            sql += "from members where member_id =? and member_pw =?"
            let args1 = [member_id, member_pw];

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


            let sql = "select member_code, member_id, member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, ";
            sql += "member_birth, admin, reg_date, is_out ";
            sql += "from members where member_id =? and member_pw =?"
            const [result1] = await dbcon.query(sql, [sessionInfo.member_id, sessionInfo.member_pw]);

            json = result1;

        } catch (err) {
            return next(err);
        }
        res.sendJson({ 'item': json });
    });

    //회원정보 수정시 받은 세션데이터에서 뽑아낸 회원아이디로 검색
    router.get("/members/set/:member_id", async (req, res, next) => {
        const member_id = req.get("member_id");

        if (member_id === undefined) {
            return next(new Error(400));
        }

        let json = null;
        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "select member_id, member_email, member_pw, member_name, member_phone, ";
            sql += "member_postcode, member_addr1, member_addr2, member_birth ";
            sql += "from members where member_id =?";

            const [result] = await dbcon.query(sql, [member_id]);

            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ item: json })
    });

    router.put('/members/edit/:member_id', async (req, res, next) => {
        const member_id = req.get("member_id");
        const member_email = req.post("member_email");
        const member_pw = req.post("member_pw");
        const member_name = req.post("member_name");
        const member_phone = req.post("member_phone");
        const member_postcode = req.post("member_postcode");
        const member_addr1 = req.post("member_addr1");
        const member_addr2 = req.post("member_addr2");
        const member_birth = req.post("member_birth");

        if (member_id == null) {
            return next(new Error(400));
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            let sql = "UPDATE members SET member_email = ?, member_pw = ?, member_name = ?, member_phone = ?, member_postcode =?, "
            sql += "member_addr1 =?, member_addr2 =?, member_birth =? WHERE member_id=?"

            const input_data = [member_email, member_pw, member_name, member_phone, member_postcode, member_addr1, member_addr2, member_birth, member_id]
            const [result] = await dbcon.query(sql, input_data);

            if (result.affectedRows < 1) {
                throw new Error("수정된 데이터가 없습니다.");
            }

            json = result;
        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ 'item': json});
    });


    //관리자 로그인
    router.post("/admin/login", async (req, res, next) => {

    });

    return router;
}
