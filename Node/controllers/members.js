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


    return router;
}
