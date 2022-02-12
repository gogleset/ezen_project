/**
 * @filename  : QnA.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : QnA DB연동
 **/


/** 모듈 참조 */
const axios = require("axios");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const logger = require('../../helper/LogHelper');
const config = require('../../helper/_config');
const utilHelper = require('../../helper/UtillHelper');
const regexHelper = require("../../helper/regex_helper.js");


module.exports = (app) => {
    let dbcon = null;

    //데이터 조회
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



    // 특정 데이터 조회  --> 본인이 작성한 글 가져오기
    router.get('/qna/:qna_code', async (req, res, next) => {
        const qnaCode = req.get('qna_code')

        // DB세션에 저장된 데이터 가져오기
        let sessionInfo = req.session.memberInfo

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // qnas 테이블에서 세션에 저장된 ID와 일치하는 게시글 조회하는 sql문
            let sql1 = "SELECT q.qna_code, qna_title, qna_desc, qna_answer, qna_state, qna_date, m.member_id FROM qnas q inner join members m on q.member_code = m.member_code where qna_code = ?";

            // 사용자 qna에서 확인 시 본인의 게시글만 확인되어야하기때문에 sql문에 AND 연산자 추가하여 검색 조건을 추가함 sessionInfo.member_id 
            if (qnaCode != null) {
                sql1 += " AND m.member_id = sessionInfo.member_id";
            }

            const [result1] = await dbcon.query(sql1, qnaCode);

            json = result1;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'item': json });
    });


    // 데이터 추가
    router.post('/qna', async (req, res, next) => {

        const qnaTiTle = req.post('qna_title');
        const qnaDesc = req.post('qna_desc');
        const qnaAnswer = req.post('qna_answer');
        const qnaState = req.post('qna_state');
        const qnaDate = req.post('qna_date');
        const memberCode = req.post('member_code');

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
            const sql = 'INSERT INTO qnas (qna_title, qna_desc, qna_answer, qna_state, qna_date, member_code) values (?, ?, ?, ?, ?, ?)';
            const input_data = [qnaTiTle, qnaDesc, qnaAnswer, qnaState, qnaDate, memberCode];
            const [result1] = await dbcon.query(sql, input_data);

            // 저장한 데이터를 출력
            const sql2 = 'SELECT qna_code, qna_title, qna_desc, qna_answer, qna_state, qna_date, member_code FROM event WHERE qna_code=?';
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
    router.put('/qna/:qna_code', async (req, res, next) => {
        const qnaCode = req.get('qna_code');
        const qnaTiTle = req.post('qna_title');
        const qnaDesc = req.post('qna_desc');
        const qnaAnswer = req.post('qna_answer');
        const qnaState = req.post('qna_state');
        const qnadate = req.post('qna_date');
        const memberCode = req.post('member_code');

        if (qnaCode === null || qnaTiTle === null || qnaDesc === null || qnaState === null) {
            return next(new Error(400));
        }

        // 유효성 검사

        try{
            regexHelper.value(qnaTiTle, '제목 값이 없습니다.'); 
            regexHelper.value(qnaDesc, '내용 값이 없습니다.'); 
            regexHelper.value(qnaState, '상태 값이 없습니다.'); 
            regexHelper.value(qnadate, '날짜 값이 없습니다.'); 

            regexHelper.maxLength(qnaTiTle, 20, '제목이 너무 깁니다.'); 
            regexHelper.maxLength(qnaDesc, 255, '내용이 너무 깁니다.'); 

        }catch(err){
            return next(err);
        };

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = `UPDATE qnas SET qna_title=?, qna_desc=?, qna_answer=?, qna_state=? WHERE qna_code=?`
            const input_data = [qnaTiTle, qnaDesc, qnaAnswer, qnaState, qnaCode];
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
    router.delete('/qna/:qna_code', async (req, res, next) => {
        const qnaCode = req.get('qna_code');

        if (qnaCode === null) {
            return next(new Error(400));
        }

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'DELETE FROM qnas WHERE qna_code = ?'

            const [result1] = await dbcon.query(sql, qnaCode);


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