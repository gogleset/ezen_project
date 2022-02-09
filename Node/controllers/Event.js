/**
 * @filename  : Event.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Event DB연동
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
    router.get('/event', async(req, res, next) => {

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

            // 전체 데이터 조회
            let sql1 = 'SELECT event_code, event_title, event_link, event_img, event_show FROM event';
            let args1 = [];

            if (query != null) {
                sql += " WHERE event_title Like concat('%', ?, '%')";
                const totalCount = result1[0];
            }

            const [result1] = await dbcon.query(sql1, args1);
            const totalCount = result1[0];

            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));

            json = result1;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({ 'pagenation': pagenation, 'item': json });
    });

    // 데이터 추가
    router.post('/event', async(req, res, next) => {

        const eventTitle = req.post('event_title');
        const eventLink = req.post('event_link');
        const eventImg = req.post('event_img');
        const eventShow = req.post('event_show');

        try {
            regexHelper.value(eventTitle, '제목을 입력해주세요.');
        } catch (err) {
            return next(err);
        } 
        
        let json = null;        
        
        try{

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 저장
            const sql = 'INSERT INTO event (event_title, event_link, event_img, event_show) values (?, ?, ?, ?)';
            const input_data = [eventTitle, eventLink, eventImg, eventShow];
            const [result1] = await dbcon.query(sql, input_data);

            // 저장한 데이터를 출력
            const sql2 = 'SELECT event_code, event_title, event_link, event_img, event_show FROM event WHERE event_code=?';
            const [result2] = await dbcon.query(sql2, [result1.insertId])

            json = result2;

        }catch(err){
            return next(err);
        }finally {
            dbcon.end();
        }

        res.sendJson({'item' : json});

    });


    // 데이터 수정
    router.put('/event/:event_code', async(req, res, next) => {
        const eventCode = req.get('event_code');
        const eventTitle = req.post('event_title');
        const eventLink = req.post('event_link');
        const eventImg = req.post('event_img');
        const eventShow = req.post('event_show');

        if (eventCode === null || eventTitle === null) {
            return next(new Error(400));
        }

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'UPDATE event SET event_title=?, event_link=?, event_img=?, event_show=? WHERE event_code=?'
            const input_data = [eventTitle, eventLink, eventImg, eventShow, eventCode];
            const [result1] = await dbcon.query(sql, input_data);

            if(result1.affectedRows < 1) {
                throw new Error(' 수정된 데이터가 없습니다. ');
            }

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        res.sendJson({'item' : json});
    });


    // 데이터 삭제
    router.delete('/event/:event_code', async(req, res, next) => {
        const eventCode = req.get('event_code');

        if(eventCode === null){
            return next(new Error(400));
        }

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'DELETE FROM event WHERE event_code = ?'

            const [result1] = await dbcon.query(sql, eventCode);


            if (result1.affectedRows < 1){
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