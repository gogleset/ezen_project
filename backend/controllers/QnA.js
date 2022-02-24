/**
 * @filename  : Qna.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Qna Controller
 **/

/** 모듈 참조 */
const axios = require("axios");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const logger = require('../helper/LogHelper');
const config = require('../helper/_config');
const utilHelper = require('../helper/UtillHelper');
const regexHelper = require("../helper/regex_helper.js");


module.exports = (app) => {
    let dbcon = null;

    //데이터 조회 [관리자 사이트에서 활용]
    router.get('/qna', async (req, res, next) => {

        // 검색어 파라미터 받기
        const query = req.get('query');

        // 현재 페이지 번호 받기 (기본값 : 1)
        const page = req.get('page', 1);
        // 한 페이지에 보여질 목록 수 (기본값 : 10)
        const rows = req.get('rows', 10);
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;

        let pagenation = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 전체 데이터수 조회 - 페이지 번호구현에 쓰일dt
            let sql1 = 'SELECT COUNT(*) AS cnt FROM qnas'
            let args1 = [];

            if (query != null) {
                sql1 += " WHERE qna_title Like concat('%', ?, '%')";
                args1.push(query);
            }

            const [result1] = await dbcon.query(sql1, args1);
            const totalCount = result1[0].cnt;

            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));


            // 전체 데이터 조회
            let sql2 = 'SELECT q.qna_code, qna_title, qna_desc, qna_answer, qna_state, qna_date, m.member_code, m.member_id FROM qnas q inner join members m on q.member_code=m.member_code';
            let args2 = [];

            if (query != null) {
                sql2 += " WHERE qna_desc Like concat('%', ?, '%')";
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
        res.sendJson({ 'pagenation': pagenation, 'item': json });
    });

    // 특정 데이터 조회 
    router.get('/qna/:qnaNm', async (req, res, next) => {
        const qnaNm = req.get('qnaNm')

        // DB세션에 저장된 데이터 가져오기
        let sessionInfo = req.session.memberInfo

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // qnas 테이블에서 qna_code 와 일치하는 dt 조회
            let sql1 = "SELECT qna_code, qna_title, qna_desc, qna_answer, qna_state, qna_date, member_code FROM qnas where qna_code = ?";
            let input_data = [qnaNm];
            
            if (sessionInfo != null) {
                sql1 += " AND member_code = ?";
                input_data.push(sessionInfo.member_code);
            }

            const [result1] = await dbcon.query(sql1, input_data);

            json = result1;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'item': json });
    });

    // 특정 데이터 조회  -->  세션 DT 조회 (사용자 본인 게시물 조회용)
    router.get('/myboard', async (req, res, next) => {

        // DB세션에 저장된 데이터 가져오기
        let sessionInfo = req.session.memberInfo

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();


            // qnas 테이블에서 세션에 저장된 ID와 일치하는 게시글 조회하는 sql문
            let sql1 = "SELECT qna_code, qna_title, qna_desc, qna_answer, qna_state, qna_date FROM qnas WHERE member_code = ?";

            const [result1] = await dbcon.query(sql1, sessionInfo.member_code);

            json = result1;


        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'item': json });
    });


    // 데이터 추가 [회원 게시판에서 작성]
    router.post('/qna', async (req, res, next) => {

        const qnaTiTle = req.post('qna_title');
        const qnaDesc = req.post('qna_desc');
        const memberCode = req.post('member_code'); // 

        try {
            regexHelper.value(qnaTiTle, '제목을 입력해주세요.');
            regexHelper.value(qnaDesc, '내용을 입력해주세요.');
        } catch (err) {
            return next(err);
        }

        let json = null;

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장
            const sql = 'INSERT INTO qnas (qna_title, qna_desc, qna_state, qna_date, member_code) values ( ?, ?, "N", now(), ?)';
            const input_data = [qnaTiTle, qnaDesc, memberCode];
            const [result1] = await dbcon.query(sql, input_data);

            // 저장한 데이터를 출력
            const sql2 = 'SELECT qna_code, qna_title, qna_desc, qna_answer, qna_state, qna_date, member_code FROM qnas WHERE qna_code=?';
            const [result2] = await dbcon.query(sql2, [result1.insertId])

            json = result2;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }

        res.sendJson({ 'item': json });

    });


    // 데이터 수정
    router.put('/qna/:qnaNm', async (req, res, next) => {
        const qnaNm = req.get('qnaNm');
        const qnaTiTle = req.post('qna_title');
        const qnaDesc = req.post('qna_desc');
        const qnaAnswer = req.post('qna_answer');
        const qnaState = req.post('qna_state');
        const qnadate = req.post('qna_date');
        const memberCode = req.post('member_code');

        if (qnaNm === null || qnaTiTle === null || qnaDesc === null || qnaState === null) {
            return next(new Error(400));
        }

        // 유효성 검사 -> 구현 필요

        try {
            regexHelper.value(qnaTiTle, '제목 값이 없습니다.');
            regexHelper.value(qnaDesc, '내용 값이 없습니다.');
            regexHelper.value(qnaState, '상태 값이 없습니다.');

            regexHelper.maxLength(qnaTiTle, 20, '제목이 너무 깁니다.');
            regexHelper.maxLength(qnaDesc, 255, '내용이 너무 깁니다.');

        } catch (err) {
            return next(err);
        };

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = `UPDATE qnas SET qna_title=?, qna_desc=?, qna_answer=?, qna_state=? WHERE qna_code=?`
            const input_data = [qnaTiTle, qnaDesc, qnaAnswer, qnaState, qnaNm];
            const [result1] = await dbcon.query(sql, input_data);

            if (result1.affectedRows < 1) {
                throw new Error(' 수정된 데이터가 없습니다. ');
            }

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'item': json });
    });


    // 데이터 삭제
    router.delete('/qna/:qnaNm', async (req, res, next) => {
        const qnaNm = req.get('qnaNm');

        if (qnaNm === null) {
            return next(new Error(400));
        }

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'DELETE FROM qnas WHERE qna_code = ?'

            const [result1] = await dbcon.query(sql, qnaNm);


            if (result1.affectedRows < 1) {
                throw new Error('삭제된 데이터가 없습니다');
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