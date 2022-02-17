/**
 * @filename  : Cart.js
 * @author    : 임다정 (dazoo0221@gmail.com)
 * @description : Cart DB연동
 **/

/** 모듈 참조 */
const axios = require("axios");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");
const logger = require('../helper/LogHelper');
const config = require('../helper/_config');
const utilHelper = require('../helper/UtillHelper');
const regexHelper = require("../helper/regex_helper.js");
const MultipartException = require("../exceptions/MultipartException");
const BadRequestException = require("../exceptions/BadRequestException");
const multer = require("multer");


module.exports = (app) => {
    let dbcon = null;

    //데이터 조회
    router.get('/event', async (req, res, next) => {
        // 검색어 파라미터 받기
        const query = req.get('query');
        // 현재 페이지 번호 받기 (기본값 : 1)
        const page = req.get('page', 1);
        // 한 페이지에 보여질 목록 수 (기본값 : 10)
        const rows = req.get('rows',10);
        // 데이터 조회 결과가 저장될 빈 변수
        let json = null;
        let pagenation = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 전체 데이터수 조회 - 페이지 번호구현에 쓰일dt
            let sql1 = 'SELECT COUNT(*) AS cnt FROM events'
            let args1 = [];

            if (query != null) {
                sql1 += " WHERE event_title Like concat('%', ?, '%')";
                args1.push(query);
            }

            const [result1] = await dbcon.query(sql1, args1);
            const totalCount = result1[0].cnt;

            pagenation = utilHelper.pagenation(totalCount, page, rows);
            logger.debug(JSON.stringify(pagenation));


            // 전체 데이터 조회
            let sql2 = 'SELECT event_code, event_title, event_link, event_img, event_show FROM events';
            let args2 = [];

            if (query != null) {
                sql2 += " WHERE event_title Like concat('%', ?, '%')";
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


    // 데이터 조회 [이미 등록된 이벤트 데이터 가져오기]
    router.get('/event/:eventNm', async (req, res, next) => {
        // 검색어 파라미터 받기
        const eventNm = req.get('eventNm');

        let json = null;

        try {
            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            // 데이터 조회
            let sql1 = 'SELECT event_code, event_title, event_link, event_img, event_show FROM events WHERE event_code =?';

            const [result1] = await dbcon.query(sql1, eventNm);

            json = result1;

        } catch (err) {
            return next(err);
        } finally {
            dbcon.end();
        }
        // res 객체에 조회한 결과를 json 형태로 저장
        res.sendJson({'item': json });
    });

    // 데이터 추가
    router.post('/event', async (req, res, next) => {

        console.log(req.body.event_title);
        // webhelper에 추가된 기능을 활용하여 업로드 객체 반환받기
        const multipart = req.getMultipart();
        logger.debug("접속");
        // 업로드 수정하기
        // const upload = multipart.single("profile_img");
        const upload = multipart.single('event_img')
        // 업로드 처리 후 텍스트 파라미터 받기
        console.log(req.body);
        upload(req, res, async (err) => {
            // 업로드 에러 처리

            if (err) {
                throw new MultipartException(err);
            }

            // 업로드 된 파일의 정보를 로그로 기록(필요에 따른 선택사항)
            logger.debug(" ::::::::",JSON.stringify(req.file));

            const eventTitle = req.post('event_title');
            const eventLink = req.post('event_link');
            const eventImg = req.file.url;
            const eventShow = req.post('event_show');

            // 유효성 검사

            let json = null;

            // 데이터 베이스 접속
            try {
                dbcon = await mysql2.createConnection(config.database);
                await dbcon.connect();

                // 데이터 저장
                const sql = 'INSERT INTO events (event_title, event_link, event_img, event_show) values (?, ?, ?, ?)';
                const input_data = [eventTitle, eventLink, eventImg, eventShow];
                const [result1] = await dbcon.query(sql, input_data);

                // 저장한 데이터를 출력
                const sql2 = 'SELECT event_code, event_title, event_link, event_img, event_show FROM events WHERE event_code=?';
                const [result2] = await dbcon.query(sql2, [result1.insertId])

                json = result2;

            } catch (err) {
                return next(err);
            } finally {
                dbcon.end();
            }

            res.sendJson({ 'item': json });

        });
    });


    // 데이터 수정
    router.put('/event/:eventNm', async (req, res, next) => {
        let eventNm = req.get('eventNm');

        const multipart = req.getMultipart();
        const upload = multipart.single('event_img')

        upload(req, res, async (err) => {
            const eventTitle = req.post('event_title');
            const eventLink = req.post('event_link');
            const eventImg = req.file.url;
            const eventShow = req.post('event_show');

            console.log(eventTitle);
            console.log(eventLink);
            console.log(eventImg);
            console.log(eventShow);
                
            if (eventNm === null || eventTitle === null) {
                return next(new Error(400));
            }

            eventNm = parseInt(eventNm);
            let json = null;

            try {
                dbcon = await mysql2.createConnection(config.database);
                await dbcon.connect();

                const sql = 'UPDATE events SET event_title=?, event_link=?,event_img=?, event_show=? WHERE event_code=?';
                const input_data = [eventTitle, eventLink, eventImg, eventShow, eventNm];
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
    });



    // 데이터 삭제
    router.delete('/event/:eventNm', async (req, res, next) => {
        const eventNm = req.get('eventNm');

        if (eventNm === null) {
            return next(new Error(400));
        }

        try {

            dbcon = await mysql2.createConnection(config.database);
            await dbcon.connect();

            const sql = 'DELETE FROM events WHERE event_code = ?'

            const [result1] = await dbcon.query(sql, eventNm);


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